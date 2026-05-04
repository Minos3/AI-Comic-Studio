import { Router } from 'express';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/v1/admin/users - list all users (admin only)
router.get('/', requireRole('admin'), async (_req, res) => {
  const allUsers = await db.select({
    id: users.id,
    username: users.username,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt,
  }).from(users);
  res.json({ success: true, data: allUsers });
});

// POST /api/v1/admin/users - create user (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Username and password required' } });
  }

  const existing = await db.select().from(users).where(eq(users.username, username)).get();
  if (existing) {
    return res.status(409).json({ success: false, error: { code: 'USERNAME_EXISTS', message: 'Username already taken' } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.insert(users).values({
    username,
    passwordHash,
    role: role === 'admin' ? 'admin' : 'user',
  }).returning();

  const user = result[0];
  res.status(201).json({ success: true, data: { id: user.id, username: user.username, role: user.role, status: user.status } });
});

// PATCH /api/v1/admin/users/:userId - edit user (admin only)
router.patch('/:userId', requireRole('admin'), async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { role, status } = req.body;

  const updates: Record<string, string> = {};
  if (role && ['admin', 'user'].includes(role)) updates.role = role;
  if (status && ['active', 'disabled'].includes(status)) updates.status = status;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
  }

  await db.update(users).set(updates).where(eq(users.id, userId));
  const updated = await db.select({
    id: users.id,
    username: users.username,
    role: users.role,
    status: users.status,
  }).from(users).where(eq(users.id, userId)).get();

  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  res.json({ success: true, data: updated });
});

export default router;
