import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks, panels, episodes, projects } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { submitTask, retryTask, getTasksByEpisode } from '../services/task.service.js';
import { storage } from '../storage/local.storage.js';

const router = Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// GET /api/v1/tasks?episodeId=xxx - list tasks for an episode
router.get('/tasks', async (req, res) => {
  const episodeId = parseInt(req.query.episodeId as string, 10);
  if (!episodeId) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'episodeId query param required' } });
  }

  const ep = await db.select().from(episodes).where(eq(episodes.id, episodeId)).get();
  if (!ep) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, ep.projectId)).get();
  if (!project || (project.createdBy !== req.user!.userId && req.user!.role !== 'admin')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const data = await getTasksByEpisode(episodeId);
  res.json({ success: true, data });
});

// GET /api/v1/tasks/:taskId - single task
router.get('/tasks/:taskId', async (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
  }
  res.json({ success: true, data: task });
});

// POST /api/v1/tasks - submit generation task
router.post('/tasks', async (req, res) => {
  const { panelId, type, modelId, prompt } = req.body;

  if (!panelId || !type || !modelId) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'panelId, type, and modelId are required' },
    });
  }

  if (!['image', 'video'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'type must be "image" or "video"' },
    });
  }

  // Check access via panel → episode → project
  const panel = await db.select().from(panels).where(eq(panels.id, panelId)).get();
  if (!panel) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Panel not found' } });
  }

  const ep = await db.select().from(episodes).where(eq(episodes.id, panel.episodeId)).get();
  if (!ep) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, ep.projectId)).get();
  if (!project || (project.createdBy !== req.user!.userId && req.user!.role !== 'admin')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  try {
    const task = await submitTask({ panelId, type, modelId, prompt });
    res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'TASK_CREATE_FAILED', message: err.message } });
  }
});

// POST /api/v1/tasks/:taskId/retry - retry a failed task
router.post('/tasks/:taskId/retry', async (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  try {
    const newTask = await retryTask(taskId);
    res.status(201).json({ success: true, data: newTask });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'RETRY_FAILED', message: err.message } });
  }
});

// POST /api/v1/panels/:panelId/upload - manually upload image/video for a panel
router.post('/panels/:panelId/upload', upload.single('file'), async (req, res) => {
  const panelId = parseInt(req.params.panelId, 10);

  const panel = await db.select().from(panels).where(eq(panels.id, panelId)).get();
  if (!panel) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Panel not found' } });
  }

  const ep = await db.select().from(episodes).where(eq(episodes.id, panel.episodeId)).get();
  if (!ep) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, ep.projectId)).get();
  if (!project || (project.createdBy !== req.user!.userId && req.user!.role !== 'admin')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'File is required' } });
  }

  // Validate file type
  const ext = path.extname(req.file.originalname).toLowerCase();
  const validExts = ['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov', '.webm'];
  if (!validExts.includes(ext)) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: `Unsupported file type: ${ext}` } });
  }

  const storagePath = `projects/${ep.projectId}/episodes/${panel.episodeId}/uploads/${Date.now()}_${req.file.originalname}`;
  await storage.save(storagePath, req.file.buffer);

  // Update panel status
  await db
    .update(panels)
    .set({ status: 'completed', updatedAt: new Date().toISOString() })
    .where(eq(panels.id, panelId));

  res.json({
    success: true,
    data: {
      fileUrl: `/api/v1/files/${storagePath}`,
      panelId,
    },
  });
});

export default router;
