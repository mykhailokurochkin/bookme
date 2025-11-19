import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as roomService from './rooms.service.js';

const roomsRouter = Router();
roomsRouter.use(authMiddleware);

roomsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    res.json(await roomService.getUserRooms(req.userId!));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

roomsRouter.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const room = await roomService.getRoomById(id);
    
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (!(await roomService.isRoomMember(id, req.userId!))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

roomsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Room name is required' });

  res.status(201).json(await roomService.createRoom(name, description, req.userId!));
});

roomsRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Room name is required' });
  if (!(await roomService.isRoomCreator(id, req.userId!))) {
    return res.status(403).json({ error: 'Only room creator can update room info' });
  }

  try {
    res.json(await roomService.updateRoom(id, name, description));
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

roomsRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!(await roomService.isRoomCreator(id, req.userId!))) {
    return res.status(403).json({ error: 'Only room creator can delete room' });
  }

  try {
    await roomService.deleteRoom(id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default roomsRouter;
