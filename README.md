# PingChat

A modern, real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) featuring WebSocket-based instant messaging, user authentication, and a beautiful UI.

https://github.com/user-attachments/assets/d165da33-555e-43f9-9e6d-9501e19d588a





![WhatsApp Image 2026-01-12 at 1 03 53 AM](https://github.com/user-attachments/assets/6323eff3-ba33-484a-ab8f-52079ceb2638)





##  Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure JWT-based authentication with HTTP-only cookies
- **Profile Management**: Update display name and profile picture
- **Message Status**: Sent, Delivered, and Read indicators
- **Online Status**: See when users are online/offline
- **User Search**: Find and start conversations with other users
- **Responsive Design**: Mobile-first design with TailwindCSS and DaisyUI
- **Image Upload**: Cloudinary integration for avatar uploads with compression
- **Redis Caching**: Efficient caching for online users and unread counts
- **Type Safety**: Full TypeScript support on both frontend and backend

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS 4** - Styling
- **DaisyUI** - Component library
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - WebSocket server
- **Redis** - Caching
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Zod** - Schema validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20.19.0 or higher)
- MongoDB (local or Atlas account)
- Redis (local or cloud instance)
- Cloudinary account (for image uploads)

##  Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/pingchat.git
cd pingchat
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Database
DB_URL=mongodb://localhost:27017/pingchat

# Server
PORT=5000
NODE_ENV=development

# Redis
REDIS_URL=localhost
REDIS_PORT=6379
REDIS_PASS=your_redis_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary
Cloudinary_Cloud_Name=your_cloud_name
Cloudinary_API_Key=your_api_key
Cloudinary_API_Secret=your_api_secret

# Client URL
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Development Mode

1. **Start Backend Server** (from `backend` directory):
```bash
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start Frontend** (from `client` directory):
```bash
npm run dev
```
Client will run on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 📁 Project Structure

```
pingchat/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controller/      # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── model/           # Mongoose models
│   │   ├── router/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── validation/      # Zod schemas
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and config
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔑 Key Features Explained

### Real-time Messaging
- Socket.IO handles bidirectional communication
- Messages are optimistically rendered for instant feedback
- Acknowledgment system ensures message delivery

### Authentication Flow
1. User registers/logs in
2. Server generates JWT token
3. Token stored in HTTP-only cookie
4. Protected routes validate token
5. Socket connection authenticated via cookie

### Message Status
- **Sent**: Message sent to server
- **Delivered**: Message delivered to recipient's socket
- **Read**: Recipient opened the chat and viewed message

### Caching Strategy
- Online users stored in Redis hash
- Unread counts cached per user-chat combination
- Reduces database queries for frequently accessed data

## UI Components

- **Sidebar**: Chat list with search functionality
- **ChatContainer**: Message display and input
- **MessageBubble**: Individual message component
- **SearchContainer**: User search interface
- **ProfilePage**: User profile management

## Security Features

- HTTP-only cookies for JWT storage
- CORS configuration
- Password hashing with bcrypt
- Input validation with Zod
- Environment variable protection
- Secure cookie settings in production

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoints for tablets and desktops
- Touch-friendly interface
- Optimized layouts for all screen sizes

##  Known Limitations

- No file/image messaging (text only)
- No group chat functionality
- No message editing/deletion
- No typing indicators
- Limited to single device per user




Made with ❤️ and TypeScript
