import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

export interface AuthRequest extends Request {
  userId?: string;
  user?: { id: string; userId: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.user = { id: decoded.userId, userId: decoded.userId };
    next();
  } catch {
    res.sendStatus(403);
  }
};

export const authenticateToken = authMiddleware;
