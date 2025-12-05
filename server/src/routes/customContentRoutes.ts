import { Router, Response } from 'express';
import { z } from 'zod';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const router = Router();
router.use(authMiddleware);

const cleanupOptional = (value?: string | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const flashcardSchema = z.object({
  prompt: z.string().trim().min(4, 'Prompt should be at least 4 characters.'),
  answer: z.string().trim().min(2, 'Answer should be at least 2 characters.'),
  tags: z
    .union([z.string(), z.undefined()])
    .transform((value) => cleanupOptional(value ?? undefined))
    .optional()
});

const examSchema = z.object({
  question: z.string().trim().min(4, 'Question must be at least 4 characters.'),
  sampleAnswer: z.union([z.string(), z.undefined()]).transform((value) => cleanupOptional(value ?? undefined)).optional(),
  difficulty: z.union([z.string(), z.undefined()]).transform((value) => cleanupOptional(value ?? undefined)).optional()
});

router.get('/flashcards', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const cards = await prisma.customFlashcard.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ cards });
});

router.post('/flashcards', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = flashcardSchema.parse(req.body);
    const card = await prisma.customFlashcard.create({ data: { ...payload, userId: req.user.id } });
    res.status(201).json({ card });
  } catch (err: any) {
    console.error('Failed to save flashcard', err);
    res.status(400).json({ message: err.message || 'Unable to save flashcard' });
  }
});

router.get('/exams', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const questions = await prisma.customExamQuestion.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ questions });
});

router.post('/exams', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = examSchema.parse(req.body);
    const question = await prisma.customExamQuestion.create({ data: { ...payload, userId: req.user.id } });
    res.status(201).json({ question });
  } catch (err: any) {
    console.error('Failed to save custom exam question', err);
    res.status(400).json({ message: err.message || 'Unable to save question' });
  }
});

export default router;
