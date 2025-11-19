import type { RoomMember } from './rooms.js';

export interface AddMemberData {
  email: string;
  role?: 'USER' | 'ADMIN';
}

export interface AddMultipleMembersData {
  members: { email: string; role: 'USER' | 'ADMIN' }[];
}

export interface BatchResult {
  successful: RoomMember[];
  failed: string[];
}
