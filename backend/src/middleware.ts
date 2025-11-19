import 'dotenv/config';

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      userId: string;
      email: string;
    };

    if (!decoded.userId) {
      throw new Error('Invalid token payload');
    }

    req.userId = decoded.userId;
    req.email = decoded.email;
    return next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
