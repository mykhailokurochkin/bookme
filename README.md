# BookMe - Meeting Room Booking App

Web application for booking meeting rooms.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Auth**: JWT (access + refresh tokens)

## Ports

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **PostgreSQL**: localhost:5432

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

1. Install PostgreSQL (if not already installed)
2. Create database:

```bash
createdb meeting_rooms_db
```

3. Configure `.env` file in `backend/`:

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Run Migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Project

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
bookme/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Prisma database schema
│   ├── src/
│   │   ├── auth/              # Authentication
│   │   ├── middleware.ts      # JWT middleware
│   │   └── server.ts          # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user info

## Database

### Models

- **User** - Users
- **MeetingRoom** - Meeting rooms
- **Booking** - Room bookings
- **RoomMember** - Room members with roles (USER/ADMIN)
