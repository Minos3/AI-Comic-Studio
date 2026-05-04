import fs from 'fs/promises';
import path from 'path';
import type { StorageInterface } from './storage.interface.js';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export class LocalStorage implements StorageInterface {
  async save(filePath: string, data: Buffer): Promise<string> {
    const fullPath = path.join(UPLOADS_DIR, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, data);
    return filePath;
  }

  async get(filePath: string): Promise<Buffer> {
    const fullPath = path.join(UPLOADS_DIR, filePath);
    return fs.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(UPLOADS_DIR, filePath);
    await fs.unlink(fullPath);
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(UPLOADS_DIR, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new LocalStorage();
