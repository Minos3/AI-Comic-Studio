import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ============================================================
// Business Tables
// ============================================================

export const styleTemplates = sqliteTable('style_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').default(''),
  breakdownPrompt: text('breakdown_prompt').default(''),
  imagePrompt: text('image_prompt').default(''),
  videoPrompt: text('video_prompt').default(''),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  templateId: integer('template_id').references(() => styleTemplates.id),
  remark: text('remark').default(''),
  status: text('status', { enum: ['active', 'archived', 'deleted'] }).notNull().default('active'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const episodes = sqliteTable('episodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const scripts = sqliteTable('scripts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  episodeId: integer('episode_id').references(() => episodes.id).notNull(),
  content: text('content').notNull().default(''),
  originalFilename: text('original_filename'),
  filePath: text('file_path'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const panels = sqliteTable('panels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  episodeId: integer('episode_id').references(() => episodes.id).notNull(),
  panelNumber: integer('panel_number').notNull(),
  description: text('description').default(''),
  dialogue: text('dialogue').default(''),
  imagePrompt: text('image_prompt').default(''),
  videoPrompt: text('video_prompt').default(''),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const characters = sqliteTable('characters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  gender: text('gender').default('其他'),
  age: text('age').default(''),
  appearanceDescription: text('appearance_description').default(''),
  portraitUrl: text('portrait_url'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const scenes = sqliteTable('scenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  description: text('description').default(''),
  styleKeywords: text('style_keywords').default(''),
  mainImageUrl: text('main_image_url'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  description: text('description').default(''),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const creatures = sqliteTable('creatures', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  description: text('description').default(''),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const aiModels = sqliteTable('ai_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['image', 'video', 'text'] }).notNull(),
  provider: text('provider').notNull(),
  apiUrl: text('api_url'),
  apiKey: text('api_key'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  configJson: text('config_json'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  panelId: integer('panel_id').references(() => panels.id).notNull(),
  type: text('type', { enum: ['image', 'video'] }).notNull(),
  modelId: integer('model_id').references(() => aiModels.id),
  status: text('status', { enum: ['created', 'submitted', 'processing', 'completed', 'failed'] }).notNull().default('created'),
  prompt: text('prompt'),
  remoteTaskId: text('remote_task_id'),
  resultUrl: text('result_url'),
  errorMessage: text('error_message'),
  errorCode: text('error_code'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const generatedAssets = sqliteTable('generated_assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id),
  panelId: integer('panel_id').references(() => panels.id),
  type: text('type', { enum: ['image', 'video'] }).notNull(),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
