import { Router, Response } from 'express';
import { z } from 'zod';
import adminMiddleware from '../middleware/adminMiddleware';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authMiddleware, adminMiddleware);

router.get('/users', async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  res.json({ users });
});

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN']).optional()
});

router.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: payload.role || 'USER'
      }
    });
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Unable to create user' });
  }
});

const updateRoleSchema = z.object({ role: z.enum(['USER', 'ADMIN']) });

router.patch('/users/:id/role', async (req: AuthRequest<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  try {
    const payload = updateRoleSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id }, data: { role: payload.role } });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Unable to update role' });
  }
});

router.delete('/users/:id', async (req: AuthRequest<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User removed' });
});

export default router;
