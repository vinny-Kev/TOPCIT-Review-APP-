import { Request, Response, Router } from 'express';
import { z } from 'zod';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import { loginUser, registerUser, sanitizeUser } from '../services/authService';
import prisma from '../utils/prisma';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload.name, payload.email, payload.password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload.email, payload.password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user: sanitizeUser(user) });
});

export default router;
