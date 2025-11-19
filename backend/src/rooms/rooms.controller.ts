import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as roomService from './rooms.service.js';
import * as memberService from '../members/members.service.js';
import { handleError } from '../lib/errors.js';
import { validateRequired } from '../lib/validation.js';

const roomsRouter = Router();
roomsRouter.use(authMiddleware);

roomsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    res.json(await roomService.getUserRooms(req.userId!));
  } catch (error) {
    return handleError(res, error);
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
    return handleError(res, error);
  }
});

roomsRouter.get('/:id/members', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Room ID is required' });
    }
    
    if (!(await roomService.isRoomMember(id, req.userId!))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const members = await memberService.getRoomMembers(id);
    res.json(members);
  } catch (error) {
    return handleError(res, error);
  }
});

roomsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const { name, description, members } = req.body;
  const validationError = validateRequired(name, 'Room name', res);
  if (validationError) return validationError;
  
  try {
    res.status(201).json(await roomService.createRoom(name, description, req.userId!, members));
  } catch (error) {
    return handleError(res, error);
  }
});

roomsRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const validationError = validateRequired(name, 'Room name', res);
  if (validationError) return validationError;
  if (!(await roomService.isRoomCreator(id, req.userId!))) {
    return res.status(403).json({ error: 'Only room creator can update room info' });
  }

  try {
    res.json(await roomService.updateRoom(id, name, description));
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    return handleError(res, error);
  }
});

roomsRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!(await roomService.isRoomCreator(id, req.userId!))) {
    return res.status(403).json({ error: 'Only room creator can delete room' });
  }

  try {
    await roomService.deleteRoom(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found') {
      return res.status(404).json({ error: 'Room not found' });
    }
    return handleError(res, error);
  }
});

export default roomsRouter;
