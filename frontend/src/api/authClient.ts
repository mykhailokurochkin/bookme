import axios from 'axios';

const client = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const register = async (data: any) => {
  const response = await client.post('/auth/register', data);
  return response.data;
};

export const login = async (data: any) => {
  const response = await client.post('/auth/login', data);
  return response.data;
};

export const logout = async () => {
  await client.post('/auth/logout');
  accessToken = null;
};

export const refreshSession = async () => {
  const response = await client.post('/auth/refresh');
  return response.data;
};

export const getMe = async () => {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const response = await client.get('/auth/me', { headers });
  return response.data;
};
