import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

export interface JwtPayload {
  userId: number;
  email: string;
  role?: string; // необязательный — как в auth.ts
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn'], // фикс типа
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_CONFIG.secret) as JwtPayload;
};