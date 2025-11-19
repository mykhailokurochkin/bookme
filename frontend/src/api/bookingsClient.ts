import axios from 'axios';
import { getAccessToken } from './authClient';
import type { Booking, CreateBookingRequest } from '../types/bookings.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const bookingClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

bookingClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getBookings = async (): Promise<Booking[]> => {
  const response = await bookingClient.get('/api/bookings');
  return response.data;
};

export const getBookingById = async (_id: string): Promise<Booking> => {
  const response = await bookingClient.get(`/api/bookings/${_id}`);
  return response.data;
};

export const createBooking = async (bookingData: CreateBookingRequest): Promise<Booking> => {
  const response = await bookingClient.post(`/api/rooms/${bookingData.roomId}/bookings`, {
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
  });
  return response.data;
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await bookingClient.put(`/api/bookings/${id}`, bookingData);
  return response.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await bookingClient.patch(`/api/bookings/${id}/cancel`);
  return response.data;
};

export const deleteBooking = async (id: string): Promise<void> => {
  await bookingClient.delete(`/api/bookings/${id}`);
};
