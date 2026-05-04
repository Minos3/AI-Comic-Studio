import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '24h';

export async function register(username: string, password: string) {
  const existing = await db.select().from(users).where(eq(users.username, username)).get();
  if (existing) {
    return { error: { code: 'USERNAME_EXISTS', message: 'Username already taken' } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.insert(users).values({ username, passwordHash }).returning();
  const user = result[0];

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return { data: { token, user: { id: user.id, username: user.username, role: user.role } } };
}

export async function login(username: string, password: string) {
  const user = await db.select().from(users).where(eq(users.username, username)).get();
  if (!user) {
    return { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } };
  }

  if (user.status === 'disabled') {
    return { error: { code: 'ACCOUNT_DISABLED', message: 'Account is disabled' } };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } };
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return { data: { token, user: { id: user.id, username: user.username, role: user.role } } };
}

export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; role: string; exp: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string; exp: number };
  } catch {
    return null;
  }
}
