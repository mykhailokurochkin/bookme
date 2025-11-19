import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

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
      role: true,
    },
    take: 10,
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(data: { name: string; email: string; password: string; role: UserRole }) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) throw new Error('Email already exists');

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(id: string, data: { name?: string; email?: string; role: UserRole }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new Error('Email already exists');
  }

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  return prisma.user.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
