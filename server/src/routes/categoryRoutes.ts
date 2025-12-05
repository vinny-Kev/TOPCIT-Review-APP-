import { Response, Router } from 'express';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

type CategoryWithCount = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  _count: { questions: number };
};

type ProgressRow = { categoryId: number; completed: number; total: number };

const parseOptions = (raw?: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const categories = (await prisma.category.findMany({
      include: { _count: { select: { questions: true } } }
    })) as CategoryWithCount[];

    const progressRecords = (await prisma.progressRecord.findMany({
      where: { userId: req.user.id }
    })) as ProgressRow[];

    const payload = categories.map((category) => {
      const progress = progressRecords.find((record) => record.categoryId === category.id);
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        questionCount: category._count.questions,
        completed: progress?.completed || 0,
        total: progress?.total || category._count.questions
      };
    });

    res.json({ categories: payload });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

router.get('/flashcards/all', async (_req: AuthRequest, res: Response) => {
  try {
    const questionsPromise = prisma.question.findMany({
      select: {
        id: true,
        prompt: true,
        category: { select: { name: true, color: true } }
      }
    });

    const customPromise = _req.user
      ? prisma.customFlashcard.findMany({ where: { userId: _req.user.id } })
      : Promise.resolve([]);

    const [questions, customCards] = (await Promise.all([questionsPromise, customPromise])) as [
      { id: number; prompt: string; category: { name: string; color: string | null } }[],
      { id: number; prompt: string; answer: string; tags: string | null }[]
    ];

    res.json({
      cards: [
        ...questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          category: question.category.name,
          color: question.category.color
        })),
        ...customCards.map((card) => ({
          id: -card.id,
          prompt: card.prompt,
          category: 'Custom',
          color: '#6366f1'
        }))
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load flashcards' });
  }
});

router.get('/:id/questions', async (req: AuthRequest<{ id: string }>, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const categoryId = Number(req.params.id);
  if (Number.isNaN(categoryId)) {
    return res.status(400).json({ message: 'Invalid category id' });
  }

  try {
    const questions = await prisma.question.findMany({
      where: { categoryId },
      select: { id: true, prompt: true, options: true }
    });

    const quizQuestions = questions
      .map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: parseOptions(question.options as string | null)
      }))
      .filter((question) => question.options.length > 0);

    res.json({ questions: quizQuestions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load questions' });
  }
});

router.post(
  '/:id/progress',
  async (req: AuthRequest<{ id: string }, any, { completed: number; total: number }>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const categoryId = Number(req.params.id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const { completed, total } = req.body;
    if (typeof completed !== 'number' || typeof total !== 'number') {
      return res.status(400).json({ message: 'completed and total must be numbers' });
    }

    try {
      const record = await prisma.progressRecord.upsert({
        create: { userId: req.user.id, categoryId, completed, total },
        update: { completed, total },
        where: {
          userId_categoryId: {
            userId: req.user.id,
            categoryId
          }
        }
      });

      res.json({ progress: record });
    } catch (err) {
      res.status(500).json({ message: 'Failed to save progress' });
    }
  }
);

export default router;
