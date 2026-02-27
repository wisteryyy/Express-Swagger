import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type Key } from '../db/schema';
import { type JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      apiKey?: Key;
      userId?: number;
      jwtPayload?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header. Format: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = payload.userId;
    req.jwtPayload = payload;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ success: false, message: 'Invalid token' });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Auth check failed', error: errorMessage });
  }
};

export default authMiddleware;