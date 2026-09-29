import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { ENV } from './server/src/config/env.js';
import { apiRouter } from './server/src/routes/index.js';
import { errorHandler } from './server/src/middleware/errorHandler.js';
import { initializeSockets } from './server/src/sockets/socketManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Configure Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  initializeSockets(io);

  // Standard middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API calls
  app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Centralized error handler for API
  app.use('/api', errorHandler);

  // Dev mode vs Prod mode
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = ENV.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FixMate full-stack server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Socket.IO server initialized`);
    console.log(`⚡ API endpoints live on /api/*`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting FixMate server:', err);
  process.exit(1);
});
