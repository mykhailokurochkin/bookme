import prisma from '../lib/prisma.js';
import { RoomRole } from '../generated/prisma/client.js';

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
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRoomById(roomId: string) {
  return prisma.meetingRoom.findUnique({
    where: { id: roomId },
    include: {
      creator: { select: userSelect },
      members: {
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function createRoom(
  name: string, 
  description: string | undefined, 
  createdBy: string,
  members?: { email: string; role: RoomRole }[]
) {
  const room = await prisma.meetingRoom.create({
    data: { name, description, createdBy },
    include: { creator: { select: userSelect } },
  });

  if (members && members.length > 0) {
    const memberData = await Promise.all(
      members.map(async ({ email, role }) => {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true }
        });
        
        if (!user) {
          throw new Error(`User with email ${email} not found`);
        }
        
        return {
          roomId: room.id,
          userId: user.id,
          role
        };
      })
    );

    await prisma.roomMember.createMany({
      data: memberData
    });
  }

  return prisma.meetingRoom.findUnique({
    where: { id: room.id },
    include: {
      creator: { select: userSelect },
      members: {
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      },
    },
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

export async function isRoomMember(roomId: string, userId: string) {
  const room = await prisma.meetingRoom.findUnique({
    where: { id: roomId },
    select: {
      createdBy: true,
      members: { where: { userId } },
    },
  });
  return room ? room.createdBy === userId || room.members.length > 0 : false;
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
