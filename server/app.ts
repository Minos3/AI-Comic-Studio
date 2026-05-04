import express from 'express';
import path from 'path';
import cors from 'cors';
import { testConnection } from './db/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Root
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: '梦境AI短剧平台 API',
      version: '2.0.0',
      docs: '/api/v1/health',
      frontend: 'http://localhost:3000',
    },
  });
});

// Health check
app.get('/api/v1/health', async (_req, res) => {
  const dbOk = await testConnection();
  res.json({ success: true, data: { status: 'ok', db: dbOk ? 'connected' : 'disconnected' } });
});

// File serving
app.use('/api/v1/files', express.static(path.resolve(process.cwd(), 'uploads')));

// Routes
import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import usersAdminRoutes from './routes/users.routes.js';
import meRoutes from './routes/me.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import scriptsRoutes from './routes/scripts.routes.js';
import panelsRoutes from './routes/panels.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import modelsRoutes from './routes/models.routes.js';
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/admin/users', usersAdminRoutes);
app.use('/api/v1/users', meRoutes);
app.use('/api/v1/templates', templatesRoutes);
app.use('/api/v1', scriptsRoutes);
app.use('/api/v1', panelsRoutes);
app.use('/api/v1', tasksRoutes);
app.use('/api/v1', modelsRoutes);

// Root
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: '梦境AI短剧平台 API',
      version: '2.0.0',
      docs: '/api/v1/health',
      frontend: 'http://localhost:3000',
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler
app.use(errorMiddleware);

export default app;
