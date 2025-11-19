import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as roomService from '../rooms/rooms.service.js';
import * as memberService from '../members/members.service.js';

const membersRouter = Router();
membersRouter.use(authMiddleware);

membersRouter.post('/rooms/:roomId/members', async (req: AuthenticatedRequest, res) => {
  const { roomId } = req.params;
  const { email, role } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const isAdmin = await roomService.isRoomAdmin(roomId, req.userId!);
  if (!isAdmin) return res.status(403).json({ error: 'Only room admins can add members' });

  try {
    const member = await memberService.addMemberByEmail(roomId, email, role || 'USER');
    res.status(201).json(member);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Room not found') return res.status(404).json({ error: 'Room not found' });
      if (error.message === 'User not found') return res.status(404).json({ error: 'User with this email not found' });
      if (error.message === 'User is already a member') return res.status(409).json({ error: 'User is already a member of this room' });
    }
    throw error;
  }
});

membersRouter.put('/rooms/:roomId/members/:userId', async (req: AuthenticatedRequest, res) => {
  const { roomId, userId } = req.params;
  const { role } = req.body;

  if (!role || !['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Valid role (USER or ADMIN) is required' });
  }

  const isAdmin = await roomService.isRoomAdmin(roomId, req.userId!);
  if (!isAdmin) return res.status(403).json({ error: 'Only room admins can update member roles' });

  try {
    const member = await memberService.updateMemberRole(roomId, userId, role);
    res.json(member);
  } catch (error) {
    if (error instanceof Error && error.message === 'Member not found') {
      return res.status(404).json({ error: 'Member not found' });
    }
    throw error;
  }
});

membersRouter.delete('/rooms/:roomId/members/:userId', async (req: AuthenticatedRequest, res) => {
  const { roomId, userId } = req.params;

  const isAdmin = await roomService.isRoomAdmin(roomId, req.userId!);
  if (!isAdmin) return res.status(403).json({ error: 'Only room admins can remove members' });

  try {
    await memberService.removeMember(roomId, userId);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Member not found') {
      return res.status(404).json({ error: 'Member not found' });
    }
    throw error;
  }
});

export default membersRouter;
