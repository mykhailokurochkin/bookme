import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

function generateTokens(user: { id: string; email: string }): AuthTokens {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
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

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    sendAuthResponse(res, generateTokens({ id: user.id, email: user.email }), 201);
  } catch (error) {
    console.error('Registration error:', error);
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

    sendAuthResponse(res, generateTokens({ id: user.id, email: user.email }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refreshSession(incomingToken: string): Promise<AuthTokens> {
  try {
    const decoded = jwt.verify(incomingToken, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return generateTokens({ id: user.id, email: user.email });
  } catch {
    throw new Error('Invalid refresh token');
  }
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
