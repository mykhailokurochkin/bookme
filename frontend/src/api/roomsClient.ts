import axios from 'axios';
import { getAccessToken } from './authClient';

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

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export const getRooms = async (): Promise<MeetingRoom[]> => {
  const response = await roomsClient.get('/');
  return response.data;
};

export const getRoomById = async (id: string): Promise<MeetingRoom> => {
  const response = await roomsClient.get(`/${id}`);
  return response.data;
};

export const createRoom = async (roomData: Omit<MeetingRoom, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingRoom> => {
  const response = await roomsClient.post('/', roomData);
  return response.data;
};

export const updateRoom = async (id: string, roomData: Partial<MeetingRoom>): Promise<MeetingRoom> => {
  const response = await roomsClient.put(`/${id}`, roomData);
  return response.data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  await roomsClient.delete(`/${id}`);
};
