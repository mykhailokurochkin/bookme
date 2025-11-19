import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

function generateTokens(user: { id: string; email: string; name: string }): AuthTokens {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken, user };
}

function sendAuthResponse(res: Response, tokens: AuthTokens, status = 200) {
  res.locals.tokens = tokens;
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
  res.status(status).json({
    accessToken: tokens.accessToken,
    user: tokens.user,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (await prisma.user.findUnique({ where: { email } })) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    sendAuthResponse(res, generateTokens({ 
      id: user.id, 
      email: user.email, 
      name: user.name
    }), 201);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    } 

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    sendAuthResponse(res, generateTokens({ id: user.id, email: user.email, name: user.name }));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refreshSession(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  
  if (!user) throw new Error('User not found');
  
  const tokens = generateTokens({ id: user.id, email: user.email, name: user.name });
  return { ...tokens, user };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}
