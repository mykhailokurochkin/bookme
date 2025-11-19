import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware.js';
import * as bookingService from './bookings.service.js';
import * as roomService from '../rooms/rooms.service.js';

const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

bookingsRouter.get('/rooms/:roomId/bookings', async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;

    if (!(await roomService.isRoomAdmin(roomId, req.userId!) || await roomService.isRoomCreator(roomId, req.userId!))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(await bookingService.getRoomBookings(roomId));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.get('/bookings', async (req: AuthenticatedRequest, res) => {
  try {
    res.json(await bookingService.getAllBookings(req.userId!));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.get('/bookings/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    if (!(await roomService.isRoomAdmin(booking.roomId, req.userId!) ||
          await roomService.isRoomCreator(booking.roomId, req.userId!) ||
          booking.userId === req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.post('/rooms/:roomId/bookings', async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;
    const { startTime, endTime, description } = req.body;

    if (!startTime || !endTime) return res.status(400).json({ error: 'Start/End time required' });
    if (!(await roomService.isRoomMember(roomId, req.userId!))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const booking = await bookingService.createBooking(
      roomId,
      req.userId!,
      new Date(startTime),
      new Date(endTime),
      description
    );
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.put('/bookings/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, description } = req.body;

    if (!(await bookingService.isBookingOwner(id, req.userId!))) {
      if (!(await bookingService.getBookingById(id) && await roomService.isRoomAdmin((await bookingService.getBookingById(id))!.roomId, req.userId!))) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = await bookingService.updateBooking(id, startTime, endTime, description);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.delete('/bookings/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!(await bookingService.isBookingOwner(id, req.userId!))) {
      if (!(await bookingService.getBookingById(id) && await roomService.isRoomAdmin((await bookingService.getBookingById(id))!.roomId, req.userId!))) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await bookingService.deleteBooking(id);
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default bookingsRouter;
