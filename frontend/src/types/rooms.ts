import type { User } from './auth.js';

export interface MeetingRoom {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  creator: User;
  members: RoomMember[];
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  user: User;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  members?: { email: string; role: 'USER' | 'ADMIN' }[];
}

export interface MemberFormData {
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface MemberManagementProps {
  roomId: string;
  isAdmin: boolean;
}
