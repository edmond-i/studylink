import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import forumRoutes from './routes/forum.routes.js';
import studyGroupRoutes from './routes/study-group.routes.js';
import aiTutorRoutes from './routes/ai-tutor.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import premiumRoutes from './routes/premium.routes.js';
import resourceRoutes from './routes/resources.routes.js';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('⚠ DATABASE_URL is not set. DB-backed endpoints will fail until you configure .env.');
}

const app = express();
const httpServer = createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:5173',
      'http://localhost:5175',
    ];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use('/api/premium/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store io in app for access in routes
app.set('io', io);
app.set('prisma', prisma);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'StudyLink API',
    status: 'ok',
    docsHint: 'Use /api/* routes (e.g. /api/health)',
  });
});

// Serve React client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // All other requests should return the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/groups', studyGroupRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/resources', resourceRoutes);

// Socket.io connection handler
// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join channel
  socket.on('join-channel', ({ channelId, userId }) => {
    socket.join(`channel-${channelId}`);
    console.log(`User ${userId} joined channel ${channelId}`);
  });

  // Leave channel
  socket.on('leave-channel', ({ channelId, userId }) => {
    socket.leave(`channel-${channelId}`);
    console.log(`User ${userId} left channel ${channelId}`);
  });

  // New message in channel
  socket.on('new-message', ({ channelId, message }) => {
    io.to(`channel-${channelId}`).emit('message-received', message);
  });

  // User typing
  socket.on('user-typing', ({ channelId, userId, name }) => {
    socket.to(`channel-${channelId}`).emit('user-typing', { userId, name });
  });

  // User stopped typing
  socket.on('user-stopped-typing', ({ channelId, userId }) => {
    socket.to(`channel-${channelId}`).emit('user-stopped-typing', { userId });
  });

  socket.on('disconnect', () => {
    console.log(`✗ User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start server
const PORT = process.env.SERVER_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`✓ StudyLink server running on http://localhost:${PORT}`);
  console.log(`✓ Socket.io ready at ws://localhost:${PORT}`);
  if (process.env.DATABASE_URL) {
    console.log('✓ Prisma configured with DATABASE_URL');
  } else {
    console.log('⚠ Prisma started without DATABASE_URL (DB endpoints unavailable)');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
