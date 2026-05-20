# CHAT App

A full-stack real-time one-to-one chat application.

- `frontend`: React + Vite + Tailwind CSS
- `backend`: Node.js + Express + Socket.IO + MongoDB
- `auth`: JWT-based authentication
- `extras`: AI reply suggestions, voice messages, reactions, user profile/avatar

## Features

- User registration, login, logout, and current user session (`/api/auth`)
- Real-time private chat with Socket.IO
- Typing indicators, seen status, and online/offline user presence
- Conversation list with unread message count
- Message actions: send, edit, delete, clear chat
- Message reactions (emoji)
- Voice message upload and playback
- User search, block/unblock users
- Profile update, status update, avatar upload
- AI smart replies and autocomplete endpoints
- Light/dark theme toggle in frontend UI

## Tech Stack

### Frontend
- React 19
- React Router
- Socket.IO Client
- Axios
- Tailwind CSS

### Backend
- Express
- Mongoose
- Socket.IO
- JWT (`jsonwebtoken`)
- Multer + Cloudinary (profile image uploads)
- Google Generative AI SDK

## Folder Structure

```text
CHAT App/
|- frontend/              # React client
|  |- src/
|  |- .gitignore
|  |- package.json
|
|- backend/               # Express + Socket.IO API
|  |- controllers/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- sockets/
|  |- uploads/
|  |- .gitignore
|  |- package.json
|
|- DEPLOYMENT_GUIDE.md
|- RESUME_CONTENT.md
|- README.md
```

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB Atlas connection string
- Cloudinary account (for profile image upload)
- Gemini API key (for AI features)

## Environment Variables (Backend)

Create file: `backend/.env`

```env
PORT=4001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Local Setup

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3) Run backend

```bash
cd ../backend
npm run dev
```

### 4) Run frontend

```bash
cd ../frontend
npm run dev
```

Frontend default dev URL: `http://localhost:5173`  
Backend default URL: `http://localhost:4001`

## Available Scripts

### Backend (`backend/package.json`)
- `npm run dev` -> start with nodemon
- `npm start` -> start with node

### Frontend (`frontend/package.json`)
- `npm run dev` -> Vite dev server
- `npm run build` -> production build
- `npm run preview` -> preview build
- `npm run lint` -> run ESLint

## API Overview

Base URL: `http://localhost:4001`

- `/api/auth` -> register, login, me, logout
- `/api/chat` -> conversations, history, send, voice send, online users, search, read/unread, block
- `/api/messages` -> edit/delete message endpoints
- `/api/reactions` -> add/get reactions
- `/api/users` -> profile, avatar, status updates
- `/api/upload` -> profile image upload/remove (Cloudinary)
- `/api/ai` -> smart replies, auto-complete, contextual response

## Socket Events (High-level)

- Client emits: `join_room`, `leave_room`, `send_message`, `typing`, `mark_message_seen`, `get_online_users`
- Server emits: `receive_message`, `user_typing`, `message_seen`, `user_status_changed`, `online_users_list`

## Important Notes

- Frontend API URLs are currently hardcoded to `http://localhost:4001` in multiple files.
- If you deploy backend elsewhere, update frontend API/socket URLs accordingly.
- `backend/uploads/` stores runtime uploaded files (voice/avatar local paths where used).

## Security

- Keep `.env` private; never commit secrets.
- Project uses separate ignore files:
  - `backend/.gitignore`
  - `frontend/.gitignore`
- If credentials were ever exposed, rotate them before GitHub push.

## Future Improvements

- Move all frontend API base URLs to a single env variable (`VITE_API_BASE_URL`)
- Add automated tests for API and UI
- Add CI pipeline for lint/build/test checks
