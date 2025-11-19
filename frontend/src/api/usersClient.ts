import axios from 'axios';
import { getAccessToken } from './authClient';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

const usersClient = axios.create({
  baseURL: `${SERVER_BASE_URL}/api/users`,
  headers: { 'Content-Type': 'application/json' },
});

usersClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
}

export const getUsers = async (): Promise<User[]> => {
  const response = await usersClient.get('/');
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await usersClient.get(`/${id}`);
  return response.data;
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const response = await usersClient.post('/', userData);
  return response.data;
};

export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<User> => {
  const response = await usersClient.put(`/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await usersClient.delete(`/${id}`);
};
