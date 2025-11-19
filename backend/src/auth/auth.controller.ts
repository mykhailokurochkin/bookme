import { Router, Response } from 'express';
import * as authService from './auth.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import { handleError } from '../lib/errors.js';

const authRouter = Router();
const REFRESH_COOKIE = 'refreshToken';
const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

authRouter.post('/register', async (req, res) => {
  await authService.register(req, res);
});

authRouter.post('/login', async (req, res) => {
  await authService.login(req, res);
});

authRouter.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
    const result = await authService.refreshSession(token);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    res.json({
      message: 'Session refreshed',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
  res.json({ message: 'Logged out successfully' });
});

authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
});

export default authRouter;
