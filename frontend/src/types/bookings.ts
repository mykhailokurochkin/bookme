export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  description?: string;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateBookingRequest {
  roomId: string;
  startTime: string;
  endTime: string;
  description?: string;
}
