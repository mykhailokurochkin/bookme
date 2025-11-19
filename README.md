# 🏢 BookMe

> Modern meeting room booking system with role-based access control.

## ✨ Features

- 🔐 **JWT Authentication** - Secure login/registration with refresh tokens
- 👥 **Role Management** - Admin and user permissions
- 📅 **Room Booking** - Schedule and manage meeting rooms
- 📊 **Dashboard** - Real-time statistics and overview
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS

## 🛠️ Tech Stack

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS  
**Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL  
**Auth**: JWT with access & refresh tokens

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### 1. Clone & Install
```bash
git clone <repository-url>
cd bookme
npm run install:all
```

### 2. Database Setup
```bash
# Create database
createdb meeting_rooms_db

# Setup environment files
cd backend
cp .env.example .env

cd ../frontend  
cp .env.example .env
```

### 3. Environment Configuration

**Backend** - Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/meeting_rooms_db"
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_EMAIL=adminemail@gmail.com
ADMIN_USERNAME=administrator
ADMIN_PASSWORD=Admin123!
```

**Frontend** - Edit `frontend/.env` (optional):
```env
VITE_PORT=5173
VITE_API_BASE_URL=http://localhost:4000
```

### 4. Database Migration
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Start Development
```bash
npm run dev
```

Open 🌐 [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
bookme/
├── backend/                 # Express API
│   ├── prisma/             # Database schema
│   ├── src/                # Source code
│   └── .env.example        # Environment template
├── frontend/               # React app
│   ├── src/                # Source code
│   └── .env.example        # Environment template
└── README.md
```

## 🔐 Admin Account

Register with these credentials for admin access:
- **Email**: `adminemail@gmail.com`
- **Username**: `administrator`
- **Password**: `Admin123!`

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get user info

### Rooms & Bookings
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room (admin)
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking

## 🗄️ Database Models

```sql
User {
  id, email, name, password, role (USER|ADMIN)
}

MeetingRoom {
  id, name, capacity, location, amenities[]
}

Booking {
  id, userId, roomId, startTime, endTime, status
}
```

## 🎯 Development Scripts

```bash
npm run install:all    # Install all dependencies
npm run dev           # Start development servers
npm run build         # Build for production
```

## 🚀 Deployment

**Backend**:
```bash
cd backend && npm run build && npm start
```

**Frontend**:
```bash
cd frontend && npm run build
# Deploy dist/ folder
```

---

<div align="center">
Made with ❤️ by Mykhailo Kurochkin
</div>
