import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { startAlertStream, stopAlertStream } from './sockets/streamSocket.js';

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
const httpServer = createServer(app);

// Socket.IO Setup with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// REST Endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'nominal',
    service: 'astrosight-server',
    activeSocketClients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial stream status to connected client
  socket.emit('stream:status', {
    connected: true,
    cadenceMs: 1500,
    activeConnections: io.engine.clientsCount,
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

// Start the candidate alert stream and save handle for teardown
const streamHandle = startAlertStream(io, 1500);

// Start HTTP & WebSocket Server
httpServer.listen(PORT, () => {
  console.log(`🚀 AstroSight WebSocket/REST Server listening on port ${PORT}`);
});

// Graceful Shutdown Teardown Logic
const shutdown = (signal) => {
  console.log(`\n[Server Teardown] Received ${signal}. Closing server gracefully...`);

  // 1. Stop streaming interval
  stopAlertStream(streamHandle);

  // 2. Disconnect socket clients and close HTTP server
  io.close(() => {
    console.log('[Socket.IO] All connections closed.');
    httpServer.close(() => {
      console.log('[Express] HTTP server terminated.');
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));