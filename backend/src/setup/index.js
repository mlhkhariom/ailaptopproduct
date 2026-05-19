// First-time setup and seed data
import db from '../db/database.js';
import { uuid } from '../utils/index.js';

export async function seedDefaultSettings() {
  const defaults = {
    store_name: 'AI Laptop Wala',
    store_tagline: 'Best Laptops in Indore',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    founded_year: '2011',
    default_gst_rate: '18',
    sla_urgent: '24',
    sla_normal: '72',
    low_stock_threshold: '5',
    lead_stages: 'new,contacted,interested,negotiation,won,lost',
    lead_sources: 'WhatsApp,Walk-in,Referral,Social Media,Website',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await db.prepare('INSERT INTO app_settings (key, value, category) VALUES (?, ?, ?) ON CONFLICT (key) DO NOTHING').run(key, value, 'general');
  }
}

export async function createSuperAdmin(name, email, password) {
  const { hashPassword } = await import('../utils/index.js');
  const hash = await hashPassword(password);
  await db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(uuid(), name, email, hash, 'superadmin');
}
