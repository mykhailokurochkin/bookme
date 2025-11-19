import axios from 'axios';
import { getAccessToken } from './authClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const createAuthenticatedClient = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export const roomsApi = {
  getRooms: async (): Promise<MeetingRoom[]> => {
    const client = createAuthenticatedClient();
    const response = await client.get('/api/rooms');
    return response.data;
  },

  getRoomById: async (id: string): Promise<MeetingRoom> => {
    const client = createAuthenticatedClient();
    const response = await client.get(`/api/rooms/${id}`);
    return response.data;
  },

  createRoom: async (roomData: Omit<MeetingRoom, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingRoom> => {
    const client = createAuthenticatedClient();
    const response = await client.post('/api/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id: string, roomData: Partial<MeetingRoom>): Promise<MeetingRoom> => {
    const client = createAuthenticatedClient();
    const response = await client.put(`/api/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id: string): Promise<void> => {
    const client = createAuthenticatedClient();
    await client.delete(`/api/rooms/${id}`);
  },
};
