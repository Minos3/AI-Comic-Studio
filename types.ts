import React from 'react';

export enum AppView {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  SCRIPT_CREATE = 'SCRIPT_CREATE',
  SCRIPT_BREAKDOWN = 'SCRIPT_BREAKDOWN',
  CREATION_TASKS = 'CREATION_TASKS',
  ASSETS_IMAGES = 'ASSETS_IMAGES',
  ASSETS_VIDEO = 'ASSETS_VIDEO',
  ASSETS_GENERAL = 'ASSETS_GENERAL',
  ASSETS_OFFICIAL = 'ASSETS_OFFICIAL',
}

export enum SoraGenerationMode {
  TEXT_TO_VIDEO = 'text_to_video',
  IMAGE_TO_VIDEO = 'image_to_video',
  KEYFRAME_TO_VIDEO = 'keyframe_to_video',
  VIDEO_EXTENSION = 'video_extension',
}

export enum NanobananaGenerationMode {
  TEXT_TO_IMAGE = 'text_to_image',
  IMAGE_TO_IMAGE = 'image_to_image',
  INPAINTING = 'inpainting',
  CONTROLNET = 'controlnet',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  scripts: string[];
  remark: string;
  createDate: string;
  status: 'Draft' | 'In Progress' | 'Completed';
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