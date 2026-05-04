import { Router } from 'express';
import { register, login } from '../services/auth.service.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Username and password required' } });
  }
  const result = await register(username, password);
  if ('error' in result) {
    return res.status(409).json({ success: false, error: result.error });
  }
  res.status(201).json({ success: true, data: result.data });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Username and password required' } });
  }
  const result = await login(username, password);
  if ('error' in result) {
    return res.status(401).json({ success: false, error: result.error });
  }
  res.json({ success: true, data: result.data });
});

export default router;
