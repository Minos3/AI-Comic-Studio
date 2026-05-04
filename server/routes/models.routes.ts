import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { aiModels } from '../db/schema.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/v1/models?type=image|video - list enabled models (public, any authenticated user)
router.get('/models', authMiddleware, async (req, res) => {
  const type = req.query.type as string | undefined;
  let rows;
  if (type && ['image', 'video', 'text'].includes(type)) {
    rows = await db
      .select()
      .from(aiModels)
      .where(eq(aiModels.type, type))
      .orderBy(sql`is_default DESC, lower(name)`);
  } else {
    rows = await db
      .select()
      .from(aiModels)
      .orderBy(sql`lower(name)`);
  }

  // Sanitize: never expose apiKey
  const sanitized = rows.map(({ apiKey, ...rest }) => ({
    ...rest,
    hasApiKey: !!apiKey,
  }));

  res.json({ success: true, data: sanitized });
});

// POST /api/v1/admin/models - create model (admin)
router.post('/admin/models', authMiddleware, requireRole('admin'), async (req, res) => {
  const { name, type, provider, apiUrl, apiKey, configJson, isDefault } = req.body;

  if (!name || !type || !provider) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'name, type, and provider are required' },
    });
  }

  if (!['image', 'video', 'text'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'type must be image, video, or text' },
    });
  }

  // If setting as default, unset others of same type
  if (isDefault) {
    await db
      .update(aiModels)
      .set({ isDefault: false })
      .where(eq(aiModels.type, type));
  }

  const result = await db
    .insert(aiModels)
    .values({
      name,
      type,
      provider,
      apiUrl: apiUrl || '',
      apiKey: apiKey || '',
      enabled: true,
      isDefault: !!isDefault,
      configJson: configJson ? JSON.stringify(configJson) : null,
    })
    .returning();

  const { apiKey: _, ...rest } = result[0];
  res.status(201).json({ success: true, data: { ...rest, hasApiKey: !!apiKey } });
});

// PATCH /api/v1/admin/models/:modelId - update model (admin)
router.patch('/admin/models/:modelId', authMiddleware, requireRole('admin'), async (req, res) => {
  const modelId = parseInt(req.params.modelId, 10);
  const { name, type, provider, apiUrl, apiKey, enabled, isDefault, configJson } = req.body;

  const existing = await db.select().from(aiModels).where(eq(aiModels.id, modelId)).get();
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Model not found' } });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (type !== undefined) updates.type = type;
  if (provider !== undefined) updates.provider = provider;
  if (apiUrl !== undefined) updates.apiUrl = apiUrl;
  if (apiKey !== undefined) updates.apiKey = apiKey;
  if (enabled !== undefined) updates.enabled = enabled;
  if (configJson !== undefined) updates.configJson = typeof configJson === 'string' ? configJson : JSON.stringify(configJson);

  // Handle default switch
  if (isDefault) {
    const targetType = type || existing.type;
    await db.update(aiModels).set({ isDefault: false }).where(eq(aiModels.type, targetType));
    updates.isDefault = true;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  updates.updatedAt = new Date().toISOString();
  await db.update(aiModels).set(updates).where(eq(aiModels.id, modelId));

  const updated = await db.select().from(aiModels).where(eq(aiModels.id, modelId)).get();
  const { apiKey: _, ...rest } = updated!;
  res.json({ success: true, data: { ...rest, hasApiKey: !!updated?.apiKey } });
});

// PATCH /api/v1/admin/models/:modelId/default - toggle default
router.patch('/admin/models/:modelId/default', authMiddleware, requireRole('admin'), async (req, res) => {
  const modelId = parseInt(req.params.modelId, 10);

  const model = await db.select().from(aiModels).where(eq(aiModels.id, modelId)).get();
  if (!model) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Model not found' } });
  }

  // Unset other defaults of same type, set this one
  await db.update(aiModels).set({ isDefault: false }).where(eq(aiModels.type, model.type));
  await db.update(aiModels).set({ isDefault: true, updatedAt: new Date().toISOString() }).where(eq(aiModels.id, modelId));

  res.json({ success: true, data: { message: `${model.name} is now the default ${model.type} model` } });
});

// DELETE /api/v1/admin/models/:modelId - delete model (admin)
router.delete('/admin/models/:modelId', authMiddleware, requireRole('admin'), async (req, res) => {
  const modelId = parseInt(req.params.modelId, 10);

  const existing = await db.select().from(aiModels).where(eq(aiModels.id, modelId)).get();
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Model not found' } });
  }

  await db.delete(aiModels).where(eq(aiModels.id, modelId));
  res.json({ success: true, data: { message: 'Model deleted' } });
});

export default router;
