import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as roomService from '../rooms/rooms.service.js';
import * as memberService from './members.service.js';
import { handleError } from '../lib/errors.js';
import { validateArray, validateEmail, validateRole } from '../lib/validation.js';

const membersRouter = Router();
membersRouter.use(authMiddleware);

const roomMembersRouter = Router();
roomMembersRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;
    
    if (!(await roomService.isRoomMember(roomId, req.userId!))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const members = await memberService.getRoomMembers(roomId);
    res.json(members);
  } catch (error) {
    return handleError(res, error);
  }
});

roomMembersRouter.post('/batch', async (req: AuthenticatedRequest, res) => {
  const { roomId } = req.params;
  const { members } = req.body;
  
  const validationError = validateArray(members, 'Members', res);
  if (validationError) return validationError;
  
  if (!(await roomService.isRoomAdmin(roomId, req.userId!))) {
    return res.status(403).json({ error: 'Only room admins can add members' });
  }

  try {
    const result = await memberService.addMultipleMembersByEmail(roomId, members);
    res.status(201).json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

roomMembersRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const { roomId } = req.params;
  const { email, role } = req.body;
  
  const validationError = validateEmail(email, res);
  if (validationError) return validationError;
  
  if (!(await roomService.isRoomAdmin(roomId, req.userId!))) {
    return res.status(403).json({ error: 'Only room admins can add members' });
  }

  try {
    const result = await memberService.addMemberByEmail(roomId, email, role || 'USER');
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Room not found') return res.status(404).json({ error: 'Room not found' });
      if (error.message === 'User not found') return res.status(404).json({ error: 'User not found' });
      if (error.message === 'User is already a member') return res.status(409).json({ error: 'User is already a member of this room' });
    }
    return handleError(res, error);
  }
});

roomMembersRouter.put('/:userId', async (req: AuthenticatedRequest, res) => {
  const { roomId, userId } = req.params;
  const { role } = req.body;

  const validationError = validateRole(role, res);
if (validationError) return validationError;
  
  if (!(await roomService.isRoomAdmin(roomId, req.userId!))) {
    return res.status(403).json({ error: 'Only room admins can update member roles' });
  }

  try {
    const result = await memberService.updateMemberRole(roomId, userId, role);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Member not found') {
      return res.status(404).json({ error: 'Member not found' });
    }
    return handleError(res, error);
  }
});

roomMembersRouter.delete('/:userId', async (req: AuthenticatedRequest, res) => {
  const { roomId, userId } = req.params;

  if (!(await roomService.isRoomAdmin(roomId, req.userId!))) {
    return res.status(403).json({ error: 'Only room admins can remove members' });
  }

  try {
    await memberService.removeMember(roomId, userId);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Member not found') {
      return res.status(404).json({ error: 'Member not found' });
    }
    return handleError(res, error);
  }
});

membersRouter.use('/rooms/:roomId/members', roomMembersRouter);

export default membersRouter;
