import { NextFunction, Response } from 'express';
import { AuthRequest } from './authMiddleware';

const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

export default adminMiddleware;
