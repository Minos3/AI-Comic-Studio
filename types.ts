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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface ProjectPreferences {
  imageModel: string;
  videoModel: string;
  textModel: string;
  artStyle: string;
  videoRatio: string;
}

export interface Project {
  id: string;
  name: string;
  scripts: string[];
  remark: string;
  description?: string;
  coverUrl?: string;
  createDate: string;
  status: 'Draft' | 'In Progress' | 'Completed';
  preferences?: ProjectPreferences;
}

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
