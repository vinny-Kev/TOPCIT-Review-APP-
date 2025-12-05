import { Response, Router } from 'express';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

interface SubmittedResponse {
  questionId: number;
  selectedIndex: number | null;
}

interface BreakdownRow {
  questionId: number;
  prompt: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number | null;
  isCorrect: boolean;
}

const router = Router();

router.use(authMiddleware);

const parseOptions = (raw?: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildInsights = (categoryName: string, scorePercent: number, breakdown: BreakdownRow[]) => {
  const missed = breakdown.filter((row) => !row.isCorrect);
  if (breakdown.length === 0) {
    return 'No graded items yet. Try taking a quick quiz to unlock insights.';
  }

  if (missed.length === 0) {
    return `Flawless victory! You mastered every ${categoryName} prompt. Keep the momentum by reviewing another topic.`;
  }

  const focusAreas = missed
    .slice(0, 3)
    .map((row) => row.prompt)
    .join('; ');

  return `You scored ${scorePercent}%. Revisit these concepts next: ${focusAreas}. Your correct answers show solid progress—capture quick notes and try again to reinforce them.`;
};

router.post(
  '/session',
  async (
    req: AuthRequest<Record<string, never>, any, { categoryId: number; durationSec: number; responses: SubmittedResponse[] }>,
    res: Response
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { categoryId, durationSec, responses } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: 'categoryId must be a positive integer' });
    }

    if (typeof durationSec !== 'number' || Number.isNaN(durationSec) || durationSec < 0) {
      return res.status(400).json({ message: 'durationSec must be a positive number' });
    }

    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ message: 'responses must be a non-empty array' });
    }

    const normalizedResponses = responses.filter((response) => Number.isInteger(response.questionId));

    if (normalizedResponses.length === 0) {
      return res.status(400).json({ message: 'No valid responses provided' });
    }
    const questionIds = normalizedResponses.map((response) => response.questionId);

    try {
      const [category, questions] = await Promise.all([
        prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, name: true } }),
        prisma.question.findMany({
          where: { id: { in: questionIds }, categoryId },
          select: { id: true, prompt: true, options: true, correctOptionIndex: true }
        })
      ]);

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      if (questions.length === 0) {
        return res.status(400).json({ message: 'No gradable questions were submitted' });
      }

      const responseMap = new Map<number, number | null>(
        normalizedResponses.map((response) => [response.questionId, response.selectedIndex ?? null])
      );

      let answered = 0;
      let correct = 0;

      const breakdown: BreakdownRow[] = questions.map((question) => {
        const options = parseOptions(question.options as string | null);
        const selectedIndex = responseMap.get(question.id) ?? null;
        const hasAnswered = typeof selectedIndex === 'number' && selectedIndex >= 0;
        const isCorrect = hasAnswered && question.correctOptionIndex === selectedIndex;

        if (hasAnswered) {
          answered += 1;
        }
        if (isCorrect) {
          correct += 1;
        }

        return {
          questionId: question.id,
          prompt: question.prompt,
          options,
          selectedIndex,
          correctIndex: question.correctOptionIndex ?? null,
          isCorrect
        };
      });

      const total = questions.length;
      const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
      const aiInsights = buildInsights(category.name, scorePercent, breakdown);

      const session = await prisma.testSession.create({
        data: {
          userId: req.user.id,
          categoryId,
          answered,
          total,
          correct,
          scorePercent,
          durationSec,
          aiInsights
        }
      });

      await prisma.testResponse.createMany({
        data: breakdown.map((row) => ({
          sessionId: session.id,
          questionId: row.questionId,
          selectedIndex: row.selectedIndex,
          isCorrect: row.isCorrect
        }))
      });

      await prisma.progressRecord.upsert({
        where: {
          userId_categoryId: {
            userId: req.user.id,
            categoryId
          }
        },
        create: { userId: req.user.id, categoryId, completed: correct, total },
        update: {
          completed: correct,
          total
        }
      });

      res.status(201).json({
        session,
        result: {
          answered,
          total,
          correct,
          scorePercent,
          durationSec,
          aiInsights,
          breakdown
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to log test session' });
    }
  }
);

export default router;
