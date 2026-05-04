import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks, panels, projects, episodes, aiModels, styleTemplates } from '../db/schema.js';
import { adapterRegistry } from './adapters/adapter.registry.js';
import { storage } from '../storage/local.storage.js';

export type TaskStatus = 'created' | 'submitted' | 'processing' | 'completed' | 'failed';

// Event emitter for WebSocket push
type TaskEventListener = (event: { taskId: number; taskVersion?: number; status: TaskStatus; panelId: number; resultUrl?: string }) => void;
const listeners: TaskEventListener[] = [];

export function onTaskEvent(fn: TaskEventListener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function emitTaskEvent(task: typeof tasks.$inferSelect) {
  const event = {
    taskId: task.id,
    status: task.status as TaskStatus,
    panelId: task.panelId,
    resultUrl: task.resultUrl || undefined,
  };
  for (const fn of listeners) fn(event);
}

export async function submitTask(params: {
  panelId: number;
  type: 'image' | 'video';
  modelId: number;
  prompt?: string;
}): Promise<typeof tasks.$inferSelect> {
  // Verify panel and project exist, inject template prompt
  const panel = await db.select().from(panels).where(eq(panels.id, params.panelId)).get();
  if (!panel) throw new Error('Panel not found');

  const episode = await db.select().from(episodes).where(eq(episodes.id, panel.episodeId)).get();
  if (!episode) throw new Error('Episode not found');

  const project = await db
    .select({
      id: projects.id,
      templateId: projects.templateId,
      imagePrompt: styleTemplates.imagePrompt,
      videoPrompt: styleTemplates.videoPrompt,
    })
    .from(projects)
    .leftJoin(styleTemplates, eq(projects.templateId, styleTemplates.id))
    .where(eq(projects.id, episode.projectId))
    .get();
  if (!project) throw new Error('Project not found');

  // Build prompt: template prefix + per-panel prompt
  const templatePrefix = params.type === 'image' ? (project.imagePrompt || '') : (project.videoPrompt || '');
  const finalPrompt = [templatePrefix, params.prompt || panel.imagePrompt || ''].filter(Boolean).join('\n');

  // Create task
  const now = new Date().toISOString();
  const result = await db
    .insert(tasks)
    .values({
      panelId: params.panelId,
      type: params.type,
      modelId: params.modelId,
      status: 'created',
      prompt: finalPrompt,
    })
    .returning();

  const task = result[0];

  // Submit to adapter (async, don't block)
  executeTask(task.id).catch((err) => {
    console.error(`[task] Execution failed for task ${task.id}:`, err.message);
  });

  return task;
}

async function executeTask(taskId: number) {
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) return;

  const model = task.modelId ? await db.select().from(aiModels).where(eq(aiModels.id, task.modelId)).get() : null;

  const adapter = model?.provider ? adapterRegistry.get(model.provider) : null;
  if (!adapter || !model) {
    await updateTaskStatus(taskId, 'failed', { errorMessage: 'Model or adapter not found', errorCode: 'ADAPTER_NOT_FOUND' });
    return;
  }

  try {
    // Submit
    await updateTaskStatus(taskId, 'submitted');
    emitTaskEvent({ ...task, status: 'submitted' });

    // For video tasks, find the latest completed image task for this panel as input
    let imageUrl: string | undefined;
    let duration: number | undefined;
    const configJson = model.configJson ? JSON.parse(model.configJson) : {};

    if (task.type === 'video') {
      // Look for the latest completed image task for this panel
      const imageTask = await db
        .select()
        .from(tasks)
        .where(eq(tasks.panelId, task.panelId))
        .orderBy(asc(tasks.createdAt))
        .all()
        .reverse()
        .find((t) => t.type === 'image' && t.status === 'completed' && t.resultUrl);

      if (imageTask?.resultUrl) {
        imageUrl = imageTask.resultUrl;
        if (!imageUrl.startsWith('http')) {
          imageUrl = `http://localhost:${process.env.PORT || 3001}${imageUrl}`;
        }
      }
      duration = configJson.duration || 5;
    }

    const remoteTaskId = await adapter.submitTask(task.prompt || '', {
      apiUrl: model.apiUrl || '',
      apiKey: model.apiKey || '',
      imageUrl,
      duration,
    });

    await db
      .update(tasks)
      .set({ remoteTaskId, status: 'processing', updatedAt: new Date().toISOString() })
      .where(eq(tasks.id, taskId));

    task.status = 'processing' as any;
    emitTaskEvent(task);

    // Poll for result
    const maxRetries = task.type === 'video' ? 180 : 60; // 15 min for video, 5 min for image
    const pollInterval = task.type === 'video' ? 10000 : 5000;
    const result = await pollForResult(adapter, remoteTaskId, model.apiUrl || '', model.apiKey || '', maxRetries, pollInterval);

    if (result) {
      // Download result to local storage
      const ext = task.type === 'video' || result.endsWith('.mp4') ? 'mp4' : 'png';
      const storagePath = `projects/episodes/panels/${task.panelId}/tasks/${taskId}.${ext}`;
      const response = await fetch(result);
      const buffer = Buffer.from(await response.arrayBuffer());
      const localPath = await storage.save(storagePath, buffer);

      await updateTaskStatus(taskId, 'completed', { resultUrl: `/api/v1/files/${localPath}` });

      // Update panel status
      await db
        .update(panels)
        .set({ status: 'completed', updatedAt: new Date().toISOString() })
        .where(eq(panels.id, task.panelId));
    } else {
      await updateTaskStatus(taskId, 'failed', { errorMessage: 'Generation returned no result', errorCode: 'EMPTY_RESULT' });
    }
  } catch (err: any) {
    const errorCode = err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' ? 'TIMEOUT' : 'API_ERROR';
    await updateTaskStatus(taskId, 'failed', { errorMessage: err.message, errorCode });
  }
}

async function pollForResult(
  adapter: any,
  remoteTaskId: string,
  apiUrl: string,
  apiKey: string,
  maxRetries = 60,
  intervalMs = 5000,
): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    try {
      const result = await adapter.queryResult(remoteTaskId, { apiUrl, apiKey });
      if (result) return result;
    } catch {
      // continue polling
    }
  }
  return null;
}

async function updateTaskStatus(
  taskId: number,
  status: TaskStatus,
  extra: { errorMessage?: string; errorCode?: string; resultUrl?: string } = {},
) {
  const updates: Record<string, string | null> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (extra.errorMessage !== undefined) updates.errorMessage = extra.errorMessage;
  if (extra.errorCode !== undefined) updates.errorCode = extra.errorCode;
  if (extra.resultUrl !== undefined) updates.resultUrl = extra.resultUrl;

  await db.update(tasks).set(updates).where(eq(tasks.id, taskId));

  const updated = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (updated) emitTaskEvent(updated);
}

export async function retryTask(taskId: number): Promise<typeof tasks.$inferSelect> {
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) throw new Error('Task not found');

  // Create new task with same params
  return submitTask({
    panelId: task.panelId,
    type: task.type as 'image' | 'video',
    modelId: task.modelId || 0,
    prompt: task.prompt || undefined,
  });
}

export async function getTasksByEpisode(episodeId: number) {
  const allPanels = await db
    .select({ id: panels.id })
    .from(panels)
    .where(eq(panels.episodeId, episodeId));

  if (allPanels.length === 0) return [];

  const panelIds = allPanels.map((p) => p.id);
  const rows = await db
    .select()
    .from(tasks)
    .where(panelIds.length === 1 ? eq(tasks.panelId, panelIds[0]) : undefined)
    .orderBy(asc(tasks.createdAt));

  // Filter tasks that belong to panels in this episode
  return rows.filter((t) => panelIds.includes(t.panelId));
}

export async function recoverStaleTasks() {
  const now = Date.now();
  const thresholds: Record<string, number> = {
    image: 10 * 60 * 1000, // 10 min
    video: 30 * 60 * 1000, // 30 min
  };

  const staleProcessing = await db
    .select()
    .from(tasks)
    .where(eq(tasks.status, 'processing'));

  for (const task of staleProcessing) {
    const created = new Date(task.createdAt).getTime();
    const threshold = thresholds[task.type as string] || thresholds.image;
    if (now - created > threshold) {
      await updateTaskStatus(task.id, 'failed', { errorMessage: 'Task timed out (server restart)', errorCode: 'TIMEOUT_RECOVERY' });
    }
  }

  // Also mark old 'submitted' tasks as failed
  const staleSubmitted = await db
    .select()
    .from(tasks)
    .where(eq(tasks.status, 'submitted'));

  for (const task of staleSubmitted) {
    const created = new Date(task.createdAt).getTime();
    if (now - created > 5 * 60 * 1000) {
      await updateTaskStatus(task.id, 'failed', { errorMessage: 'Task stalled during submission', errorCode: 'STALLED' });
    }
  }
}
