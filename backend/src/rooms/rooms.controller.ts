import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as roomService from './rooms.service.js';

const roomsRouter = Router();

roomsRouter.use(authMiddleware);

roomsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const rooms = await roomService.getUserRooms(req.userId!);
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

roomsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await roomService.createRoom(name, description, req.userId!);
    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

roomsRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const isCreator = await roomService.isRoomCreator(id, req.userId!);
    if (!isCreator) {
      return res.status(403).json({ error: 'Only room creator can update room info' });
    }

    const room = await roomService.updateRoom(id, name, description);
    res.json(room);
  } catch (error) {
    console.error('Update room error:', error);
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

roomsRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const isCreator = await roomService.isRoomCreator(id, req.userId!);
    if (!isCreator) {
      return res.status(403).json({ error: 'Only room creator can delete room' });
    }

    await roomService.deleteRoom(id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default roomsRouter;
