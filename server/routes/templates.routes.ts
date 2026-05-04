import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { styleTemplates } from '../db/schema.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/v1/templates - list all templates (any authenticated user)
router.get('/', authMiddleware, async (_req, res) => {
  const templates = await db.select().from(styleTemplates).orderBy(sql`lower(name)`);
  res.json({ success: true, data: templates });
});

// GET /api/v1/templates/:id - get single template
router.get('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const template = await db.select().from(styleTemplates).where(eq(styleTemplates.id, id)).get();
  if (!template) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
  }
  res.json({ success: true, data: template });
});

// POST /api/v1/templates - create template (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const { name, description, breakdownPrompt, imagePrompt, videoPrompt } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
  }

  const result = await db.insert(styleTemplates).values({
    name,
    description: description || '',
    breakdownPrompt: breakdownPrompt || '',
    imagePrompt: imagePrompt || '',
    videoPrompt: videoPrompt || '',
  }).returning();

  res.status(201).json({ success: true, data: result[0] });
});

// PATCH /api/v1/templates/:id - update template (admin only)
router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, description, breakdownPrompt, imagePrompt, videoPrompt } = req.body;

  const updates: Record<string, string> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (breakdownPrompt !== undefined) updates.breakdownPrompt = breakdownPrompt;
  if (imagePrompt !== undefined) updates.imagePrompt = imagePrompt;
  if (videoPrompt !== undefined) updates.videoPrompt = videoPrompt;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  updates.updatedAt = new Date().toISOString();
  await db.update(styleTemplates).set(updates).where(eq(styleTemplates.id, id));

  const updated = await db.select().from(styleTemplates).where(eq(styleTemplates.id, id)).get();
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/v1/templates/:id - delete template (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await db.select().from(styleTemplates).where(eq(styleTemplates.id, id)).get();
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
  }

  await db.delete(styleTemplates).where(eq(styleTemplates.id, id));
  res.json({ success: true, data: { message: 'Template deleted' } });
});

export default router;