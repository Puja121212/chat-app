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

const normalizeOrigin = (o) => (o || '').trim().replace(/\/$/, '');

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => normalizeOrigin(o))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // same-origin / curl / mobile apps (no Origin header)
  const n = normalizeOrigin(origin);
  return allowedOrigins.includes(n);
};

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, isOriginAllowed(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

console.log('CORS allowed origins:', allowedOrigins.length ? allowedOrigins : '(none — check CLIENT_ORIGINS on Render)');

// Socket.IO setup (array origins — add your Vercel URL to CLIENT_ORIGINS on Render)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware — must run before routes so OPTIONS preflight gets valid headers
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files for voice messages
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Please check your MongoDB Atlas connection string');
    process.exit(1);
  });

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');
const reactionRoutes = require('./routes/reactions');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Chat App Server is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Socket.IO handlers
const { handleConnection } = require('./sockets/socketHandlers');

// Initialize Socket.IO handlers
handleConnection(io);

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
