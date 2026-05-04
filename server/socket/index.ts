import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../services/auth.service.js';
import { onTaskEvent } from '../services/task.service.js';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
    path: '/socket.io',
  });

  // Auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication required'));
    }
    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Invalid or expired token'));
    }
    (socket as any).userId = payload.userId;
    (socket as any).userRole = payload.role;
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[socket] Connected: user ${(socket as any).userId}`);

    // Subscribe to channel based on role
    const role = (socket as any).userRole as string;
    if (role === 'admin') {
      socket.join('admin');
    }
    socket.join(`user:${(socket as any).userId}`);

    socket.on('disconnect', () => {
      console.log(`[socket] Disconnected: user ${(socket as any).userId}`);
    });
  });

  // Listen for task events and broadcast
  const unsub = onTaskEvent((event) => {
    io.emit('task:status', {
      taskId: event.taskId,
      status: event.status,
      panelId: event.panelId,
      resultUrl: event.resultUrl,
    });

    // On failure, alert admins if too many recent failures
    if (event.status === 'failed') {
      // Simplified alert: emit to admin channel
      io.to('admin').emit('task:failed', {
        taskId: event.taskId,
        panelId: event.panelId,
      });
    }
  });

  // Cleanup on server shutdown
  io.engine.on('close', () => {
    unsub();
  });

  return io;
}
