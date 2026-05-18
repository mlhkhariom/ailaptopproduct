import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { sendEmail, EmailTemplates } from '../lib/email.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });

  const exists = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const id = uuid();
  await db.prepare('INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)').run(id, name, email, hash, phone || null);

  const user = await db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(id);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Welcome email (non-blocking)
  sendEmail({ to: email, subject: '🎉 Welcome to AI Laptop Wala!', html: EmailTemplates.welcome(name), toggleKey: 'email_welcome' }).catch(e => console.error('Welcome email:', e.message));

  res.status(201).json({ token, user });
});

// POST /api/auth/forgot-password — request reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = await db.prepare('SELECT id, name FROM users WHERE email=?').get(email.toLowerCase().trim());
  // Always return success (don't leak whether email exists)
  if (!user) return res.json({ message: 'If account exists, reset email sent' });

  // Generate reset token (valid 1h)
  const resetToken = jwt.sign({ id: user.id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: '🔐 Password Reset — AI Laptop Wala',
    html: EmailTemplates.passwordReset(user.name, resetLink),
    toggleKey: 'email_password_reset',
  });

  res.json({ message: 'If account exists, reset email sent' });
});

// POST /api/auth/reset-password — complete reset
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') return res.status(400).json({ error: 'Invalid token' });
    const hash = bcrypt.hashSync(newPassword, 10);
    await db.prepare('UPDATE users SET password=? WHERE id=?').run(hash, decoded.id);
    res.json({ message: 'Password reset successful. Please login.' });
  } catch (e) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Input validation
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (typeof email !== 'string' || email.length > 100) return res.status(400).json({ error: 'Invalid email' });
  if (typeof password !== 'string' || password.length > 100) return res.status(400).json({ error: 'Invalid password' });

  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.is_active) return res.status(403).json({ error: 'Account deactivated' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
import { authMiddleware } from '../middleware/auth.js';
import { getUserPermissions } from '../middleware/rbac.js';
router.get('/me', authMiddleware, async (req, res) => {
  const user = await db.prepare('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?').get(req.user.id);
  const rbac = getUserPermissions(req);
  res.json({ ...user, ...rbac });
});

// PUT /api/auth/me
router.put('/me', authMiddleware, async (req, res) => {
  const { name, phone, address } = req.body;
  await db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?').run(name, phone, address, req.user.id);
  res.json({ message: 'Profile updated' });
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ error: 'Current password wrong' });
  await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.user.id);
  res.json({ message: 'Password changed' });
});

// POST /api/auth/google — Google One Tap / OAuth login
router.post('/google', async (req, res) => {
  const { email, name, picture, sub } = req.body; // from Google ID token decoded on frontend
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    let user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      // Auto-register
      const id = uuid();
      const password = bcrypt.hashSync(sub || uuid(), 10); // random password (user uses Google to login)
      await db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?,?,?,?,?)')
        .run(id, name || email.split('@')[0], email, password, 'customer');
      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'Google login failed' });
  }
});

// ── 2FA (Simple PIN-based for admin) ──────────────────────

// POST /api/auth/2fa/setup — admin sets a 6-digit PIN
router.post('/2fa/setup', authMiddleware, async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length !== 6 || isNaN(pin)) return res.status(400).json({ error: '6-digit PIN required' });
  await db.prepare("UPDATE users SET address = jsonb_set(COALESCE(address::jsonb,'{}'), '{twofa_pin}', ?::jsonb) WHERE id=?")
    .run(JSON.stringify(pin), req.user.id).catch(async () => {
      // Fallback: store in app_settings
      await db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value")
        .run(`2fa_pin_${req.user.id}`, pin);
    });
  res.json({ success: true, message: '2FA PIN set' });
});

// POST /api/auth/2fa/verify — verify PIN on login
router.post('/2fa/verify', async (req, res) => {
  const { user_id, pin } = req.body;
  const stored = (await db.prepare("SELECT value FROM app_settings WHERE key=?").get(`2fa_pin_${user_id}`))?.value;
  if (!stored) return res.json({ success: true }); // No 2FA set
  if (stored !== pin) return res.status(401).json({ error: 'Invalid PIN' });
  res.json({ success: true });
});

export default router;
