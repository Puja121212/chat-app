const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// ======================
// CORS SETUP
// ======================

const normalizeOrigin = (origin) =>
  (origin || '').trim().replace(/\/$/, '');

const allowedOrigins = (
  process.env.CLIENT_ORIGINS ||
  'http://localhost:5173,http://localhost:5174'
)
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);

  return allowedOrigins.includes(normalizedOrigin);
};

console.log('✅ Allowed CORS Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],

  optionsSuccessStatus: 204
};

// ======================
// MIDDLEWARE
// ======================

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// ======================
// SOCKET.IO
// ======================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ======================
// DATABASE CONNECTION
// ======================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);

    process.exit(1);
  });

// ======================
// ROUTES IMPORT
// ======================

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');
const reactionRoutes = require('./routes/reactions');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');

// ======================
// TEST ROUTE
// ======================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Chat App Server is running!'
  });
});

// ======================
// API ROUTES
// ======================

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// ======================
// SOCKET HANDLERS
// ======================

const { handleConnection } = require('./sockets/socketHandlers');

handleConnection(io);

// ======================
// SERVER START
// ======================

const PORT = process.env.PORT || 4001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});