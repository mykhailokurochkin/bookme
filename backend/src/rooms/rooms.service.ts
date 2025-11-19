import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  name: true,
  email: true,
};

export async function getUserRooms(userId: string) {
  return prisma.meetingRoom.findMany({
    where: {
      OR: [
        { createdBy: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      creator: { select: userSelect },
      members: {
        include: {
          user: { select: userSelect },
        },
      },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createRoom(name: string, description: string | undefined, createdBy: string) {
  return prisma.meetingRoom.create({
    data: { name, description, createdBy },
    include: { creator: { select: userSelect } },
  });
}

export async function updateRoom(roomId: string, name?: string, description?: string) {
  return prisma.meetingRoom.update({
    where: { id: roomId },
    data: { name, description },
    include: { creator: { select: userSelect } },
  });
}

export async function deleteRoom(roomId: string) {
  return prisma.meetingRoom.delete({
    where: { id: roomId },
  });
}

export async function isRoomCreator(roomId: string, userId: string) {
  const room = await prisma.meetingRoom.findUnique({
    where: { id: roomId },
    select: { createdBy: true },
  });
  return room?.createdBy === userId;
}

export async function isRoomAdmin(roomId: string, userId: string) {
  const room = await prisma.meetingRoom.findUnique({
    where: { id: roomId },
    select: {
      createdBy: true,
      members: { where: { userId, role: 'ADMIN' } },
    },
  });
  return room ? room.createdBy === userId || room.members.length > 0 : false;
}
