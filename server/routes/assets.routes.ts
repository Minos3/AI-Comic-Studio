import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { items, creatures, projects } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

function checkAccess(p: typeof projects.$inferSelect, userId: number, role: string) {
  return p.createdBy === userId || role === 'admin';
}

// ---- ITEMS ----
router.get('/projects/:projectId/items', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  if (!checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const rows = await db.select().from(items).where(eq(items.projectId, projectId)).orderBy(asc(items.createdAt));
  res.json({ success: true, data: rows });
});

router.post('/projects/:projectId/items', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (!checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const { name, description, imageUrl } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const now = new Date().toISOString();
  const r = await db.insert(items).values({ projectId, name, description: description || '', imageUrl: imageUrl || '', createdAt: now, updatedAt: now }).returning();
  res.status(201).json({ success: true, data: r[0] });
});

router.patch('/items/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const item = await db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const project = await db.select().from(projects).where(eq(projects.id, item.projectId)).get();
  if (!project || !checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const updates: Record<string, string> = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.imageUrl !== undefined) updates.imageUrl = req.body.imageUrl;
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR' } });
  updates.updatedAt = new Date().toISOString();
  await db.update(items).set(updates).where(eq(items.id, itemId));
  res.json({ success: true, data: await db.select().from(items).where(eq(items.id, itemId)).get() });
});

router.delete('/items/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const item = await db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const project = await db.select().from(projects).where(eq(projects.id, item.projectId)).get();
  if (!project || !checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  await db.delete(items).where(eq(items.id, itemId));
  res.json({ success: true, data: { message: 'Item deleted' } });
});

// ---- CREATURES ----
router.get('/projects/:projectId/creatures', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (!checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const rows = await db.select().from(creatures).where(eq(creatures.projectId, projectId)).orderBy(asc(creatures.createdAt));
  res.json({ success: true, data: rows });
});

router.post('/projects/:projectId/creatures', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (!checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const { name, description, imageUrl } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const now = new Date().toISOString();
  const r = await db.insert(creatures).values({ projectId, name, description: description || '', imageUrl: imageUrl || '', createdAt: now, updatedAt: now }).returning();
  res.status(201).json({ success: true, data: r[0] });
});

router.patch('/creatures/:creatureId', async (req, res) => {
  const creatureId = parseInt(req.params.creatureId, 10);
  const creature = await db.select().from(creatures).where(eq(creatures.id, creatureId)).get();
  if (!creature) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const project = await db.select().from(projects).where(eq(projects.id, creature.projectId)).get();
  if (!project || !checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const updates: Record<string, string> = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.imageUrl !== undefined) updates.imageUrl = req.body.imageUrl;
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR' } });
  updates.updatedAt = new Date().toISOString();
  await db.update(creatures).set(updates).where(eq(creatures.id, creatureId));
  res.json({ success: true, data: await db.select().from(creatures).where(eq(creatures.id, creatureId)).get() });
});

router.delete('/creatures/:creatureId', async (req, res) => {
  const creatureId = parseInt(req.params.creatureId, 10);
  const creature = await db.select().from(creatures).where(eq(creatures.id, creatureId)).get();
  if (!creature) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const project = await db.select().from(projects).where(eq(projects.id, creature.projectId)).get();
  if (!project || !checkAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  await db.delete(creatures).where(eq(creatures.id, creatureId));
  res.json({ success: true, data: { message: 'Creature deleted' } });
});

export default router;
