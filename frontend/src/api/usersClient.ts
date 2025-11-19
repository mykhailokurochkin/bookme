import axios from 'axios';
import { getAccessToken } from './authClient';
import type { User } from '../types/auth.js';

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

export const searchUsersByEmail = async (email: string): Promise<User[]> => {
  const response = await usersClient.get('/search', { params: { email } });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await usersClient.get('/me');
  return response.data;
};
