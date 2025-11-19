import { Router, Response } from 'express';
import { login, register, refreshSession } from './auth.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';

const authRouter = Router();
const REFRESH_COOKIE = 'refreshToken';
const isProd = process.env.NODE_ENV === 'production';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
};

// Register and login are now proper Express handlers
authRouter.post('/register', register);
authRouter.post('/login', login);

authRouter.post('/refresh', async (req, res) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;

  try {
    const result = await refreshSession(incomingToken);
    setRefreshCookie(res, result.refreshToken);
    return res.status(200).json({
      message: 'Session refreshed',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.post('/logout', (req, res) => {
  clearRefreshCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
});

authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    id: req.userId,
    email: req.email
  });
});

export default authRouter;
