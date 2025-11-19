import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as bookingService from './bookings.service.js';
import * as roomService from '../rooms/rooms.service.js';

const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

bookingsRouter.get('/rooms/:roomId/bookings', async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;

    const hasAccess = await roomService.isRoomAdmin(roomId, req.userId!) ||
      await roomService.isRoomCreator(roomId, req.userId!);

    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

    res.json(await bookingService.getRoomBookings(roomId));
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.post('/rooms/:roomId/bookings', async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;
    const { startTime, endTime, description } = req.body;

    if (!startTime || !endTime) return res.status(400).json({ error: 'Start/End time required' });

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) return res.status(400).json({ error: 'End time must be after start time' });

    const booking = await bookingService.createBooking(
      roomId,
      req.userId!,
      start,
      end,
      description
    );

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    if (error instanceof Error && error.message === 'Time conflict') {
      return res.status(409).json({ error: 'Time slot is already booked' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.put('/bookings/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, description } = req.body;

    const isOwner = await bookingService.isBookingOwner(id, req.userId!);

    if (!isOwner) {
      const booking = await bookingService.getBookingById(id);
      const isAdmin = booking && await roomService.isRoomAdmin(booking.roomId, req.userId!);
      if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
    }

    const start = startTime ? new Date(startTime) : undefined;
    const end = endTime ? new Date(endTime) : undefined;

    if (start && end && start >= end) return res.status(400).json({ error: 'Invalid time range' });

    res.json(await bookingService.updateBooking(id, start, end, description));
  } catch (error) {
    console.error('Update booking error:', error);
    if (error instanceof Error) {
      if (error.message === 'Booking not found') return res.status(404).json({ error: 'Not found' });
      if (error.message === 'Time conflict') return res.status(409).json({ error: 'Time conflict' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.delete('/bookings/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const isOwner = await bookingService.isBookingOwner(id, req.userId!);

    if (!isOwner) {
      const booking = await bookingService.getBookingById(id);
      const isAdmin = booking && await roomService.isRoomAdmin(booking.roomId, req.userId!);
      if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
    }

    await bookingService.deleteBooking(id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Delete booking error:', error);
    if (error instanceof Error && error.message === 'Booking not found') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default bookingsRouter;
