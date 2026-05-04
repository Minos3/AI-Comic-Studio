import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import mammoth from 'mammoth';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { episodes, projects, scripts } from '../db/schema.js';
import { storage } from '../storage/local.storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { breakdownEpisode } from '../services/breakdown.service.js';

const router = Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.txt', '.doc', '.docx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .doc, and .docx files are allowed'));
    }
  },
});

function checkProjectAccess(project: typeof projects.$inferSelect, userId: number, role: string): boolean {
  return project.createdBy === userId || role === 'admin';
}

// GET /api/v1/projects/:projectId/episodes/:episodeId/scripts
router.get('/projects/:projectId/episodes/:episodeId/scripts', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const episodeId = parseInt(req.params.episodeId, 10);

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const rows = await db
    .select()
    .from(scripts)
    .where(eq(scripts.episodeId, episodeId))
    .orderBy(asc(scripts.createdAt));

  res.json({ success: true, data: rows });
});

// POST /api/v1/projects/:projectId/episodes/:episodeId/scripts - upload script file
router.post(
  '/projects/:projectId/episodes/:episodeId/scripts',
  upload.single('file'),
  async (req, res) => {
    const projectId = parseInt(req.params.projectId, 10);
    const episodeId = parseInt(req.params.episodeId, 10);

    const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
    if (!project || project.status === 'deleted') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }
    if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }

    const episode = await db
      .select()
      .from(episodes)
      .where(and(eq(episodes.id, episodeId), eq(episodes.projectId, projectId)))
      .get();
    if (!episode) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
    }

    // Handle file upload or direct text content
    let content = '';
    let originalFilename: string | null = null;
    let filePath: string | null = null;

    if (req.file) {
      originalFilename = req.file.originalname;
      const ext = path.extname(originalFilename).toLowerCase();
      if (ext === '.docx') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        content = result.value;
      } else if (ext === '.doc') {
        // .doc (binary) is not fully supported; attempt utf-8, warn if binary
        content = req.file.buffer.toString('utf-8');
        if (content.includes('�')) {
          return res.status(400).json({ success: false, error: { code: 'UNSUPPORTED_FORMAT', message: '.doc 格式暂不支持，请另存为 .docx 或 .txt 后上传' } });
        }
      } else {
        content = req.file.buffer.toString('utf-8');
      }
      // Store original file
      const storagePath = `projects/${projectId}/episodes/${episodeId}/${Date.now()}_${originalFilename}`;
      await storage.save(storagePath, req.file.buffer);
      filePath = storagePath;
    } else if (req.body.content) {
      content = req.body.content;
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'File or content field is required' },
      });
    }

    const result = await db
      .insert(scripts)
      .values({
        episodeId,
        content,
        originalFilename,
        filePath,
      })
      .returning();

    res.status(201).json({ success: true, data: result[0] });
  },
);

// PATCH /api/v1/projects/:projectId/episodes/:episodeId/scripts/:scriptId
router.patch('/projects/:projectId/episodes/:episodeId/scripts/:scriptId', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const episodeId = parseInt(req.params.episodeId, 10);
  const scriptId = parseInt(req.params.scriptId, 10);

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const { content } = req.body;
  if (content === undefined) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Content is required' },
    });
  }

  await db
    .update(scripts)
    .set({ content, updatedAt: new Date().toISOString() })
    .where(and(eq(scripts.id, scriptId), eq(scripts.episodeId, episodeId)));

  const updated = await db
    .select()
    .from(scripts)
    .where(and(eq(scripts.id, scriptId), eq(scripts.episodeId, episodeId)))
    .get();

  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Script not found' } });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/v1/projects/:projectId/episodes/:episodeId/scripts/:scriptId
router.delete('/projects/:projectId/episodes/:episodeId/scripts/:scriptId', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const episodeId = parseInt(req.params.episodeId, 10);
  const scriptId = parseInt(req.params.scriptId, 10);

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const script = await db
    .select()
    .from(scripts)
    .where(and(eq(scripts.id, scriptId), eq(scripts.episodeId, episodeId)))
    .get();

  if (!script) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Script not found' } });
  }

  // Clean up stored file
  if (script.filePath) {
    try {
      await storage.delete(script.filePath);
    } catch { /* file may already be gone */ }
  }

  await db.delete(scripts).where(eq(scripts.id, scriptId));

  res.json({ success: true, data: { message: 'Script deleted' } });
});

// POST /api/v1/projects/:projectId/episodes/:episodeId/breakdown - AI breakdown
router.post('/projects/:projectId/episodes/:episodeId/breakdown', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const episodeId = parseInt(req.params.episodeId, 10);

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  try {
    const result = await breakdownEpisode(projectId, episodeId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[breakdown] Error:', err.message);
    res.status(500).json({
      success: false,
      error: { code: 'BREAKDOWN_FAILED', message: err.message || 'AI breakdown failed' },
    });
  }
});

export default router;
