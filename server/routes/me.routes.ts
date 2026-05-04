import { Router } from 'express';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// PATCH /api/v1/users/me/password
router.patch('/me/password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Old and new password required' } });
  }

  const user = await db.select().from(users).where(eq(users.id, req.user!.userId)).get();
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Old password is incorrect' } });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, req.user!.userId));

  res.json({ success: true, data: { message: 'Password updated' } });
});

export default router;
