export const handleError = (res: any, error: any, defaultMessage = 'Internal server error') => {
  if (error instanceof Error) {
    const errorMap: Record<string, { status: number; message: string }> = {
      'Room not found': { status: 404, message: 'Room not found' },
      'User not found': { status: 404, message: 'User with this email not found' },
      'User is already a member': { status: 409, message: 'User is already a member of this room' },
      'Member not found': { status: 404, message: 'Member not found' },
      'Booking not found': { status: 404, message: 'Booking not found' },
    };

    const mappedError = errorMap[error.message];
    if (mappedError) {
      return res.status(mappedError.status).json({ error: mappedError.message });
    }
  }
  return res.status(500).json({ error: defaultMessage });
};
