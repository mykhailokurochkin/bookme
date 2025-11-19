import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as userService from './users.service.js';
import { handleError } from '../lib/errors.js';
import { validateEmail } from '../lib/validation.js';

const usersRouter = Router();
usersRouter.use(authMiddleware);

usersRouter.get('/search', async (req, res) => {
  try {
    const { email } = req.query;
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ error: 'Email query required' });
    }
    res.json(await userService.searchUsersByEmail(email));
  } catch (error) {
    return handleError(res, error);
  }
});

export default usersRouter;
