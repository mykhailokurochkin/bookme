import prisma from '../lib/prisma.js';
import { RoomRole } from '../generated/prisma/client.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
};

export async function getRoomMembers(roomId: string) {
  return prisma.roomMember.findMany({
    where: { roomId },
    include: { user: { select: userSelect } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addMemberByEmail(roomId: string, email: string, role: RoomRole = 'USER') {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('User not found');
  }

  const existing = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: user.id } },
  });

  if (existing) {
    throw new Error('User is already a member');
  }

  return prisma.roomMember.create({
    data: { roomId, userId: user.id, role },
    include: { user: { select: userSelect } },
  });
}

export async function updateMemberRole(roomId: string, userId: string, role: RoomRole) {
  return prisma.roomMember.update({
    where: { roomId_userId: { roomId, userId } },
    data: { role },
    include: { user: { select: userSelect } },
  });
}

export async function addMultipleMembersByEmail(
  roomId: string, 
  members: { email: string; role: RoomRole }[]
) {
  const results = await Promise.allSettled(
    members.map(async ({ email, role }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }

      const existing = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId: user.id } },
      });

      if (existing) {
        throw new Error(`User ${email} is already a member`);
      }

      return prisma.roomMember.create({
        data: { roomId, userId: user.id, role },
        include: { user: { select: userSelect } },
      });
    })
  );

  const successful = results
    .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    .map(result => result.value);

  const failed = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map(result => result.reason.message);

  return { successful, failed };
}

export async function removeMember(roomId: string, userId: string) {
  return prisma.roomMember.delete({
    where: { roomId_userId: { roomId, userId } },
  });
}
