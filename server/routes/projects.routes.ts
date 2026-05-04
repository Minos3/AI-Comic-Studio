import { Router } from 'express';
import { and, asc, count, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { episodes, projects, styleTemplates } from '../db/schema.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      templateId: projects.templateId,
      templateName: styleTemplates.name,
      remark: projects.remark,
      status: projects.status,
      createdAt: projects.createdAt,
      episodeCount: count(episodes.id),
    })
    .from(projects)
    .leftJoin(styleTemplates, eq(projects.templateId, styleTemplates.id))
    .leftJoin(episodes, eq(episodes.projectId, projects.id))
    .where(and(eq(projects.createdBy, req.user!.userId), eq(projects.status, 'active')))
    .groupBy(projects.id, styleTemplates.name)
    .orderBy(asc(projects.createdAt));

  res.json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      templateName: row.templateName || '未选择模板',
      remark: row.remark || '',
      scripts: [],
    })),
  });
});

router.post('/', async (req, res) => {
  const { name, templateId, remark } = req.body;
  if (!name || !templateId) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name and templateId are required' } });
  }

  const template = await db.select().from(styleTemplates).where(eq(styleTemplates.id, Number(templateId))).get();
  if (!template) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
  }

  const result = await db
    .insert(projects)
    .values({
      name,
      templateId: Number(templateId),
      remark: remark || '',
      createdBy: req.user!.userId,
    })
    .returning();

  const project = result[0];
  res.status(201).json({
    success: true,
    data: {
      id: project.id,
      name: project.name,
      templateId: project.templateId,
      templateName: template.name,
      remark: project.remark || '',
      status: project.status,
      createdAt: project.createdAt,
      episodeCount: 0,
      scripts: [],
    },
  });
});

router.patch('/:projectId', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const existing = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  if (existing.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const { name, templateId, remark, status } = req.body;
  const updates: Record<string, string | number | null> = {};
  if (name !== undefined) updates.name = name;
  if (remark !== undefined) updates.remark = remark;
  if (templateId !== undefined) updates.templateId = templateId ? Number(templateId) : null;
  if (status && ['active', 'archived', 'deleted'].includes(status)) updates.status = status;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  updates.updatedAt = new Date().toISOString();
  await db.update(projects).set(updates).where(eq(projects.id, projectId));

  const updated = await db
    .select({
      id: projects.id,
      name: projects.name,
      templateId: projects.templateId,
      templateName: styleTemplates.name,
      remark: projects.remark,
      status: projects.status,
      createdAt: projects.createdAt,
      episodeCount: count(episodes.id),
    })
    .from(projects)
    .leftJoin(styleTemplates, eq(projects.templateId, styleTemplates.id))
    .leftJoin(episodes, eq(episodes.projectId, projects.id))
    .where(eq(projects.id, projectId))
    .groupBy(projects.id, styleTemplates.name)
    .get();

  res.json({
    success: true,
    data: {
      ...updated,
      templateName: updated?.templateName || '未选择模板',
      remark: updated?.remark || '',
      scripts: [],
    },
  });
});

router.delete('/:projectId', requireRole('admin'), async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const existing = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  await db.update(projects).set({ status: 'deleted', updatedAt: new Date().toISOString() }).where(eq(projects.id, projectId));
  res.json({ success: true, data: { message: 'Project deleted' } });
});

router.get('/:projectId/episodes', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  if (project.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const rows = await db.select().from(episodes).where(eq(episodes.projectId, projectId)).orderBy(asc(episodes.sortOrder));
  res.json({ success: true, data: rows });
});

router.post('/:projectId/episodes', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const { title, sortOrder } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Title is required' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  if (project.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const result = await db.insert(episodes).values({
    projectId,
    title,
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
  }).returning();

  res.status(201).json({ success: true, data: result[0] });
});

router.patch('/:projectId/episodes/:episodeId', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const episodeId = parseInt(req.params.episodeId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  if (project.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const { title, sortOrder } = req.body;
  const updates: Record<string, string | number> = {};
  if (title !== undefined) updates.title = title;
  if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  updates.updatedAt = new Date().toISOString();
  await db.update(episodes).set(updates).where(and(eq(episodes.id, episodeId), eq(episodes.projectId, projectId)));
  const updated = await db.select().from(episodes).where(and(eq(episodes.id, episodeId), eq(episodes.projectId, projectId))).get();
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  res.json({ success: true, data: updated });
});

router.delete('/:projectId/episodes/:episodeId', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const episodeId = parseInt(req.params.episodeId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  if (project.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  await db.delete(episodes).where(and(eq(episodes.id, episodeId), eq(episodes.projectId, projectId)));
  res.json({ success: true, data: { message: 'Episode deleted' } });
});

export default router;
