import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as roomService from './rooms.service.js';

const roomsRouter = Router();
roomsRouter.use(authMiddleware);

roomsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  const rooms = await roomService.getUserRooms(req.userId!);
  res.json(rooms);
});

roomsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Room name is required' });

  const room = await roomService.createRoom(name, description, req.userId!);
  res.status(201).json(room);
});

roomsRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const isCreator = await roomService.isRoomCreator(id, req.userId!);
  if (!isCreator) return res.status(403).json({ error: 'Only room creator can update room info' });

  try {
    const room = await roomService.updateRoom(id, name, description);
    res.json(room);
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    throw error;
  }
});

roomsRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const isCreator = await roomService.isRoomCreator(id, req.userId!);
  if (!isCreator) return res.status(403).json({ error: 'Only room creator can delete room' });

  try {
    await roomService.deleteRoom(id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    throw error;
  }
});

export default roomsRouter;
