import axios from 'axios';
import { getAccessToken } from './authClient';
import type { RoomMember } from '../types/rooms.js';
import type { AddMemberData, AddMultipleMembersData, BatchResult } from '../types/members.js';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

const membersClient = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

membersClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
  const response = await membersClient.get(`/rooms/${roomId}/members`);
  return response.data;
};

export const addMember = async (roomId: string, memberData: AddMemberData): Promise<RoomMember> => {
  const response = await membersClient.post(`/rooms/${roomId}/members`, memberData);
  return response.data;
};

export const addMultipleMembers = async (roomId: string, membersData: AddMultipleMembersData): Promise<BatchResult> => {
  const response = await membersClient.post(`/rooms/${roomId}/members/batch`, membersData);
  return response.data;
};

export const updateMemberRole = async (roomId: string, userId: string, role: 'USER' | 'ADMIN'): Promise<RoomMember> => {
  const response = await membersClient.put(`/rooms/${roomId}/members/${userId}`, { role });
  return response.data;
};

export const removeMember = async (roomId: string, userId: string): Promise<void> => {
  await membersClient.delete(`/rooms/${roomId}/members/${userId}`);
};
