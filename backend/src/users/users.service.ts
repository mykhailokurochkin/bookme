import prisma from '../lib/prisma.js';

export async function searchUsersByEmail(emailQuery: string) {
  return prisma.user.findMany({
    where: {
      email: {
        contains: emailQuery,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 10,
  });
}
