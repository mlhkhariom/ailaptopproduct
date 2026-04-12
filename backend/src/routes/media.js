import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../../../uploads/media');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const router = Router();

// DB table
db.exec(`CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'image',
  size INTEGER DEFAULT 0,
  folder TEXT DEFAULT 'general',
  alt TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);

// GET /api/media
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const { folder, type } = req.query;
  let q = 'SELECT * FROM media WHERE 1=1';
  const params = [];
  if (folder) { q += ' AND folder = ?'; params.push(folder); }
  if (type) { q += ' AND type = ?'; params.push(type); }
  q += ' ORDER BY created_at DESC';
  res.json(db.prepare(q).all(...params));
});

// POST /api/media/upload
router.post('/upload', authMiddleware, adminOnly, upload.array('files', 20), (req, res) => {
  const files = req.files;
  if (!files?.length) return res.status(400).json({ error: 'No files uploaded' });
  const folder = req.body.folder || 'general';
  const inserted = files.map(file => {
    const id = uuid();
    const type = file.mimetype.startsWith('video') ? 'video' : file.mimetype.startsWith('image') ? 'image' : 'document';
    const url = `/uploads/media/${file.filename}`;
    db.prepare('INSERT INTO media (id, filename, original_name, url, type, size, folder) VALUES (?,?,?,?,?,?,?)')
      .run(id, file.filename, file.originalname, url, type, file.size, folder);
    return { id, url, filename: file.filename, original_name: file.originalname, type, size: file.size, folder };
  });
  res.json(inserted);
});

// PUT /api/media/:id
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { alt, folder } = req.body;
  db.prepare('UPDATE media SET alt=?, folder=? WHERE id=?').run(alt, folder, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/media/:id
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (media) {
    const filePath = path.join(uploadDir, media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  }
  res.json({ message: 'Deleted' });
});

// GET /api/media/stats
router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c, SUM(size) as s FROM media').get();
  const byType = db.prepare('SELECT type, COUNT(*) as count FROM media GROUP BY type').all();
  const byFolder = db.prepare('SELECT folder, COUNT(*) as count FROM media GROUP BY folder').all();
  res.json({ total: total.c, totalSize: total.s || 0, byType, byFolder });
});

export default router;
