import axios from 'axios';
import { getAccessToken } from './authClient';
import type { MeetingRoom, CreateRoomData } from '../types/rooms.js';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

const roomsClient = axios.create({
  baseURL: `${SERVER_BASE_URL}/api/rooms`,
  headers: { 'Content-Type': 'application/json' },
});

roomsClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getRooms = async (): Promise<MeetingRoom[]> => {
  const response = await roomsClient.get('/');
  return response.data;
};

export const getRoomById = async (id: string): Promise<MeetingRoom> => {
  const response = await roomsClient.get(`/${id}`);
  return response.data;
};

export const createRoom = async (data: CreateRoomData): Promise<MeetingRoom> => {
  const response = await roomsClient.post('/', data);
  return response.data;
};

export const updateRoom = async (id: string, roomData: Partial<MeetingRoom>): Promise<MeetingRoom> => {
  const response = await roomsClient.put(`/${id}`, roomData);
  return response.data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  await roomsClient.delete(`/${id}`);
};
