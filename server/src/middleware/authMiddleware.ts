import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import jwt from 'jsonwebtoken';

export interface AuthRequest<
  Params = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  params: Params;
  body: ReqBody;
  query: ReqQuery;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Invalid authorization header' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as {
      id: number;
      email: string;
      role: 'USER' | 'ADMIN';
    };
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
