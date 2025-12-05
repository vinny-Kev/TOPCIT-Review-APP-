import { Router, Response } from 'express';
import { z } from 'zod';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const router = Router();

router.use(authMiddleware);

const noteSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2)
});

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const notes = await prisma.note.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: 'desc' }
  });

  res.json({ notes });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = noteSchema.parse(req.body);
    const note = await prisma.note.create({
      data: { ...payload, userId: req.user.id }
    });
    res.status(201).json({ note });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Unable to save note' });
  }
});

export default router;
