import { Router } from 'express';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { episodes, panels, projects, characters, scenes, tasks } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

function checkProjectAccess(project: typeof projects.$inferSelect, userId: number, role: string): boolean {
  return project.createdBy === userId || role === 'admin';
}

// GET /api/v1/projects/:projectId/episodes/:episodeId/panels
router.get('/projects/:projectId/episodes/:episodeId/panels', async (req, res) => {
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
    .from(panels)
    .where(eq(panels.episodeId, episodeId))
    .orderBy(asc(panels.panelNumber));

  res.json({ success: true, data: rows });
});

// PATCH /api/v1/panels/:panelId - update panel (description, dialogue, imagePrompt, videoPrompt)
router.patch('/panels/:panelId', async (req, res) => {
  const panelId = parseInt(req.params.panelId, 10);

  const panel = await db.select().from(panels).where(eq(panels.id, panelId)).get();
  if (!panel) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Panel not found' } });
  }

  const episode = await db.select().from(episodes).where(eq(episodes.id, panel.episodeId)).get();
  if (!episode) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, episode.projectId)).get();
  if (!project || !checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const { description, dialogue, imagePrompt, videoPrompt } = req.body;
  const updates: Record<string, string> = {};
  if (description !== undefined) updates.description = description;
  if (dialogue !== undefined) updates.dialogue = dialogue;
  if (imagePrompt !== undefined) updates.imagePrompt = imagePrompt;
  if (videoPrompt !== undefined) updates.videoPrompt = videoPrompt;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  updates.updatedAt = new Date().toISOString();
  await db.update(panels).set(updates).where(eq(panels.id, panelId));

  const updated = await db.select().from(panels).where(eq(panels.id, panelId)).get();
  res.json({ success: true, data: updated });
});

// POST /api/v1/panels/merge - merge two adjacent panels
router.post('/panels/merge', async (req, res) => {
  const { panelIds } = req.body;
  if (!Array.isArray(panelIds) || panelIds.length !== 2) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'panelIds must be an array of 2 panel IDs' } });
  }

  const [id1, id2] = panelIds;
  const panel1 = await db.select().from(panels).where(eq(panels.id, id1)).get();
  const panel2 = await db.select().from(panels).where(eq(panels.id, id2)).get();

  if (!panel1 || !panel2 || panel1.episodeId !== panel2.episodeId) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Panels must exist and belong to the same episode' } });
  }

  const episode = await db.select().from(episodes).where(eq(episodes.id, panel1.episodeId)).get();
  if (!episode) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, episode.projectId)).get();
  if (!project || !checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const minNum = Math.min(panel1.panelNumber, panel2.panelNumber);

  // Create merged panel
  const mergedDescription = [panel1.description, panel2.description].filter(Boolean).join(' ');
  const mergedDialogue = [panel1.dialogue, panel2.dialogue].filter(Boolean).join('\n');
  const mergedImagePrompt = [panel1.imagePrompt, panel2.imagePrompt].filter(Boolean).join('; ');

  const result = await db
    .insert(panels)
    .values({
      episodeId: panel1.episodeId,
      panelNumber: minNum,
      description: mergedDescription,
      dialogue: mergedDialogue,
      imagePrompt: mergedImagePrompt,
      videoPrompt: panel2.videoPrompt || panel1.videoPrompt || '',
      status: 'pending',
    })
    .returning();

  // Delete original panels
  await db.delete(panels).where(eq(panels.id, id1));
  await db.delete(panels).where(eq(panels.id, id2));

  // Renumber remaining panels
  const allPanels = await db
    .select()
    .from(panels)
    .where(eq(panels.episodeId, panel1.episodeId))
    .orderBy(asc(panels.panelNumber));

  for (let i = 0; i < allPanels.length; i++) {
    if (allPanels[i].panelNumber !== i + 1) {
      await db
        .update(panels)
        .set({ panelNumber: i + 1, updatedAt: new Date().toISOString() })
        .where(eq(panels.id, allPanels[i].id));
    }
  }

  res.json({ success: true, data: result[0] });
});

// POST /api/v1/panels/:panelId/split - split a panel into two
router.post('/panels/:panelId/split', async (req, res) => {
  const panelId = parseInt(req.params.panelId, 10);
  const { splitPoint } = req.body;

  const panel = await db.select().from(panels).where(eq(panels.id, panelId)).get();
  if (!panel) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Panel not found' } });
  }

  const episode = await db.select().from(episodes).where(eq(episodes.id, panel.episodeId)).get();
  if (!episode) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, episode.projectId)).get();
  if (!project || !checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  // Split description - first half / second half
  const desc = panel.description || '';
  const dialogue = panel.dialogue || '';
  const splitIndex = typeof splitPoint === 'number' ? splitPoint : Math.floor(desc.length / 2);

  const part1 = desc.substring(0, splitIndex).trim();
  const part2 = desc.substring(splitIndex).trim();

  // Get max panel number for reordering
  const maxPanelResult = await db
    .select()
    .from(panels)
    .where(eq(panels.episodeId, panel.episodeId))
    .orderBy(asc(panels.panelNumber))
    .all();
  const maxNum = Math.max(...maxPanelResult.map((p) => p.panelNumber));

  // Shift panels after the split panel
  for (const p of maxPanelResult) {
    if (p.panelNumber > panel.panelNumber) {
      await db
        .update(panels)
        .set({ panelNumber: p.panelNumber + 1, updatedAt: new Date().toISOString() })
        .where(eq(panels.id, p.id));
    }
  }

  // Create the second panel
  const result = await db
    .insert(panels)
    .values({
      episodeId: panel.episodeId,
      panelNumber: panel.panelNumber + 1,
      description: part2,
      dialogue: dialogue ? dialogue.substring(Math.floor(dialogue.length / 2)).trim() : '',
      imagePrompt: panel.imagePrompt || '',
      videoPrompt: panel.videoPrompt || '',
      status: 'pending',
    })
    .returning();

  // Update the first panel
  await db
    .update(panels)
    .set({
      description: part1,
      dialogue: dialogue ? dialogue.substring(0, Math.floor(dialogue.length / 2)).trim() : '',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(panels.id, panelId));

  const updated = await db.select().from(panels).where(eq(panels.id, panelId)).get();

  res.json({ success: true, data: { original: updated, new: result[0] } });
});

// PATCH /api/v1/characters/:characterId - update character
router.patch('/characters/:characterId', async (req, res) => {
  const characterId = parseInt(req.params.characterId, 10);

  const character = await db.select().from(characters).where(eq(characters.id, characterId)).get();
  if (!character) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Character not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, character.projectId)).get();
  if (!project || !checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const { name, gender, age, appearanceDescription } = req.body;
  const updates: Record<string, string> = {};
  if (name !== undefined) updates.name = name;
  if (gender !== undefined) updates.gender = gender;
  if (age !== undefined) updates.age = age;
  if (appearanceDescription !== undefined) updates.appearanceDescription = appearanceDescription;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  updates.updatedAt = new Date().toISOString();
  await db.update(characters).set(updates).where(eq(characters.id, characterId));

  const updated = await db.select().from(characters).where(eq(characters.id, characterId)).get();
  res.json({ success: true, data: updated });
});

// PATCH /api/v1/scenes/:sceneId - update scene
router.patch('/scenes/:sceneId', async (req, res) => {
  const sceneId = parseInt(req.params.sceneId, 10);

  const scene = await db.select().from(scenes).where(eq(scenes.id, sceneId)).get();
  if (!scene) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scene not found' } });
  }

  const project = await db.select().from(projects).where(eq(projects.id, scene.projectId)).get();
  if (!project || !checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const { name, description, styleKeywords } = req.body;
  const updates: Record<string, string> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (styleKeywords !== undefined) updates.styleKeywords = styleKeywords;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  updates.updatedAt = new Date().toISOString();
  await db.update(scenes).set(updates).where(eq(scenes.id, sceneId));

  const updated = await db.select().from(scenes).where(eq(scenes.id, sceneId)).get();
  res.json({ success: true, data: updated });
});

// POST /api/v1/projects/:projectId/scenes - create scene
router.post('/projects/:projectId/scenes', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const { name, description, styleKeywords } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const now = new Date().toISOString();
  const r = await db.insert(scenes).values({ projectId, name, description: description || '', styleKeywords: styleKeywords || '', createdAt: now, updatedAt: now }).returning();
  res.status(201).json({ success: true, data: r[0] });
});

// POST /api/v1/projects/:projectId/characters - create character
router.post('/projects/:projectId/characters', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });

  const { name, gender, age, appearanceDescription } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const now = new Date().toISOString();
  const r = await db.insert(characters).values({ projectId, name, gender: gender || '其他', age: age || '', appearanceDescription: appearanceDescription || '', createdAt: now, updatedAt: now }).returning();
  res.status(201).json({ success: true, data: r[0] });
});

// GET /api/v1/projects/:projectId/characters - list characters for project
router.get('/projects/:projectId/characters', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const rows = await db
    .select()
    .from(characters)
    .where(eq(characters.projectId, projectId))
    .orderBy(asc(characters.createdAt));

  res.json({ success: true, data: rows });
});

// GET /api/v1/projects/:projectId/scenes - list scenes for project
router.get('/projects/:projectId/scenes', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project || project.status === 'deleted') {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }
  if (!checkProjectAccess(project, req.user!.userId, req.user!.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  const rows = await db
    .select()
    .from(scenes)
    .where(eq(scenes.projectId, projectId))
    .orderBy(asc(scenes.createdAt));

  res.json({ success: true, data: rows });
});

// GET /api/v1/projects/:projectId/episodes/:episodeId/preview - episode panel preview
router.get('/projects/:projectId/episodes/:episodeId/preview', async (req, res) => {
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

  // Get all panels ordered by panel number
  const panelRows = await db
    .select()
    .from(panels)
    .where(eq(panels.episodeId, episodeId))
    .orderBy(asc(panels.panelNumber));

  // For each panel, find latest completed image and video tasks
  const panelsWithAssets = await Promise.all(
    panelRows.map(async (panel) => {
      const panelTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.panelId, panel.id))
        .all();

      const completedImageTask = panelTasks
        .filter((t) => t.type === 'image' && t.status === 'completed' && t.resultUrl)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      const completedVideoTask = panelTasks
        .filter((t) => t.type === 'video' && t.status === 'completed' && t.resultUrl)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      return {
        id: panel.id,
        panelNumber: panel.panelNumber,
        description: panel.description,
        dialogue: panel.dialogue,
        status: panel.status,
        imageUrl: completedImageTask?.resultUrl || null,
        videoUrl: completedVideoTask?.resultUrl || null,
      };
    }),
  );

  res.json({
    success: true,
    data: {
      episode: {
        id: episode.id,
        title: episode.title,
        sortOrder: episode.sortOrder,
      },
      project: {
        id: project.id,
        name: project.name,
      },
      panels: panelsWithAssets,
      totalPanels: panelsWithAssets.length,
      completedPanels: panelsWithAssets.filter((p) => p.status === 'completed').length,
    },
  });
});

export default router;
