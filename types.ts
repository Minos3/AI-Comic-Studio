import React from 'react';

export enum AppView {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  SCRIPT_CREATE = 'SCRIPT_CREATE',
  SCRIPT_BREAKDOWN = 'SCRIPT_BREAKDOWN',
  CREATION_TASKS = 'CREATION_TASKS',
  ASSETS_CHARACTERS = 'ASSETS_CHARACTERS',
  ASSETS_ITEMS = 'ASSETS_ITEMS',
  ASSETS_IMAGES = 'ASSETS_IMAGES',
  ASSETS_VIDEO = 'ASSETS_VIDEO',
  ASSETS_GENERAL = 'ASSETS_GENERAL',
  ASSETS_OFFICIAL = 'ASSETS_OFFICIAL',
}

// ---- API-compatible types ----

export interface Project {
  id: number;
  name: string;
  templateId: number | null;
  templateName: string;
  remark: string;
  createdAt: string;
  status: 'active' | 'archived' | 'deleted';
  episodeCount: number;
  scripts: string[];
}

export interface EpisodeSummary {
  id: number;
  projectId: number;
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StyleTemplateOption {
  id: number;
  name: string;
  description: string;
}

// ---- Frontend types ----

export interface ScriptProject {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
}

export interface Panel {
  panelNumber: number;
  description: string;
  dialogue: string;
  characters: string[];
}

export interface Asset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  category: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: AppView;
  subItems?: NavItem[];
}
