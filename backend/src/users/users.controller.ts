import { Router } from 'express';
import { authMiddleware } from '../middleware.js';
import * as userService from './users.service.js';

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
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default usersRouter;
