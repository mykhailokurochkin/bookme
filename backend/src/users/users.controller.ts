import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    res.json(await userService.getAllUsers());
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    
    const { name, email, password, role = 'USER' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    res.status(201).json(await userService.createUser({ name, email, password, role }));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    res.json(await userService.updateUser(id, { name, email, role }));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    
    const { id } = req.params;
    if (id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    await userService.deleteUser(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default usersRouter;
