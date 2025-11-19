import 'dotenv/config';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import authRouter from './auth/auth.controller.js';
import roomsRouter from './rooms/rooms.controller.js';
import membersRouter from './members/members.controller.js';
import bookingsRouter from './bookings/bookings.controller.js';
import usersRouter from './users/users.controller.js';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api', membersRouter);
app.use('/api', bookingsRouter);
app.use('/api/users', usersRouter);

const port = Number(process.env.PORT ?? 4000);

const start = async () => {
  try {
    app.listen(port, () => {});
  } catch (error) {
    process.exit(1);
  }
};

void start();
