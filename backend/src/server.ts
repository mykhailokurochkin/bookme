import 'dotenv/config';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import authRouter from './auth/auth.controller.js';
import roomsRouter from './rooms/rooms.controller.js';
import membersRouter from './members/members.controller.js';

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

const port = Number(process.env.PORT ?? 4000);

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void start();
