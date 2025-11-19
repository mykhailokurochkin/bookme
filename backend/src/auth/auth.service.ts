import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '../generated/prisma/client.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'adminemail@gmail.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'administrator';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

function generateTokens(user: { id: string; email: string; role: UserRole }): AuthTokens {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Check if this is the admin account
    const isAdmin = email === ADMIN_EMAIL && name === ADMIN_USERNAME;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      },
    });

    sendAuthResponse(res, generateTokens({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }), 201);
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

    sendAuthResponse(res, generateTokens({ id: user.id, email: user.email, role: user.role }));
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

    return generateTokens({ id: user.id, email: user.email, role: user.role });
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
      role: true,
      createdAt: true,
    },
  });
}
