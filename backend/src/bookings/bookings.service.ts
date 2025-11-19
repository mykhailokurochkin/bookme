import prisma from '../lib/prisma.js';

const userSelect = { id: true, name: true, email: true };

async function checkConflicts(roomId: string, start: Date, end: Date, excludeId?: string) {
  const conflict = await prisma.booking.findFirst({
    where: {
      roomId,
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        { startTime: { lt: end }, endTime: { gt: start } },
      ],
    },
  });

  if (conflict) throw new Error('Time conflict');
}

export async function getRoomBookings(roomId: string) {
  return prisma.booking.findMany({
    where: { roomId },
    include: { user: { select: userSelect } },
    orderBy: { startTime: 'asc' },
  });
}

export async function getBookingById(bookingId: string) {
  return prisma.booking.findUnique({ where: { id: bookingId } });
}

export async function getAllBookings(userId: string) {
  return prisma.booking.findMany({
    where: {
      OR: [
        { userId },
        {
          room: {
            members: {
              some: { userId }
            }
          }
        }
      ]
    },
    include: { 
      user: { select: userSelect },
      room: { select: { id: true, name: true } }
    },
    orderBy: { startTime: 'asc' },
  });
}

export async function createBooking(roomId: string, userId: string, startTime: Date, endTime: Date, description?: string) {
  await checkConflicts(roomId, startTime, endTime);

  return prisma.booking.create({
    data: { roomId, userId, startTime, endTime, description },
    include: { user: { select: userSelect } },
  });
}

export async function updateBooking(bookingId: string, startTime?: Date, endTime?: Date, description?: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error('Booking not found');

  const start = startTime ?? booking.startTime;
  const end = endTime ?? booking.endTime;

  if (startTime || endTime) {
    await checkConflicts(booking.roomId, start, end, bookingId);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { startTime, endTime, description },
    include: { user: { select: userSelect } },
  });
}

export async function deleteBooking(bookingId: string) {
  return prisma.booking.delete({ where: { id: bookingId } });
}

export async function isBookingOwner(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { userId: true },
  });
  return booking?.userId === userId;
}
