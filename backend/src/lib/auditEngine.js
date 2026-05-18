// ══════════════════════════════════════════════════════════
// AUDIT ENGINE — Deep tracking + Rollback
// Tracks every change with before/after + supports undo
// ══════════════════════════════════════════════════════════

import { v4 as uuid } from 'uuid';
import db from '../db/database.js';

// Log any change (called from routes)
export async function auditLog({ module, action, ref_id, old_value, new_value, user_id, user_name, ip, description }) {
  const id = uuid();
  await db.prepare(`INSERT INTO audit_log (id, module, action, ref_id, old_value, new_value, user_id, user_name, ip, description, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`)
    .run(id, module, action, ref_id || null, JSON.stringify(old_value || null), JSON.stringify(new_value || null), user_id || null, user_name || 'system', ip || null, description || `${action} on ${module}`);
  return id;
}

// Middleware: auto-audit for PUT/DELETE requests
export function auditMiddleware(module) {
  return async (req, res, next) => {
    // Capture original response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      // Log after successful response
      if (res.statusCode < 400 && (req.method === 'PUT' || req.method === 'DELETE' || req.method === 'POST')) {
        auditLog({
          module,
          action: req.method === 'DELETE' ? 'deleted' : req.method === 'POST' ? 'created' : 'updated',
          ref_id: req.params?.id || data?.id,
          old_value: req._auditOldValue || null,
          new_value: req.method === 'DELETE' ? null : req.body,
          user_id: req.user?.id,
          user_name: req.user?.name,
          ip: req.ip,
        }).catch(() => {});
      }
      return originalJson(data);
    };
    next();
  };
}

// Get audit trail for a specific record
export async function getAuditTrail(module, ref_id) {
  return db.prepare("SELECT * FROM audit_log WHERE module=? AND ref_id=? ORDER BY created_at DESC LIMIT 50").all(module, ref_id);
}

// Get all audit logs (admin view)
export async function getAuditLogs({ module, user_id, action, from, to, limit }) {
  let q = "SELECT * FROM audit_log WHERE 1=1";
  const params = [];
  if (module) { q += ' AND module=?'; params.push(module); }
  if (user_id) { q += ' AND user_id=?'; params.push(user_id); }
  if (action) { q += ' AND action=?'; params.push(action); }
  if (from) { q += ' AND created_at >= ?'; params.push(from); }
  if (to) { q += ' AND created_at <= ?'; params.push(to); }
  q += ` ORDER BY created_at DESC LIMIT ${limit || 100}`;
  return db.prepare(q).all(...params);
}

// ROLLBACK — revert a change using audit log
export async function rollback(auditId) {
  const entry = await db.prepare('SELECT * FROM audit_log WHERE id=?').get(auditId);
  if (!entry) return { error: 'Audit entry not found' };
  if (!entry.old_value || entry.old_value === 'null') return { error: 'No previous value to rollback to' };

  const oldData = JSON.parse(entry.old_value);
  const table = getTableForModule(entry.module);
  if (!table) return { error: 'Cannot determine table for rollback' };

  // Build UPDATE from old values
  const fields = Object.keys(oldData).filter(k => k !== 'id' && k !== 'created_at');
  if (fields.length === 0) return { error: 'No fields to rollback' };

  const sets = fields.map(f => `${f}=?`).join(', ');
  const values = fields.map(f => typeof oldData[f] === 'object' ? JSON.stringify(oldData[f]) : oldData[f]);

  await db.prepare(`UPDATE ${table} SET ${sets} WHERE id=?`).run(...values, entry.ref_id);

  // Log the rollback itself
  await auditLog({ module: entry.module, action: 'rollback', ref_id: entry.ref_id, old_value: entry.new_value ? JSON.parse(entry.new_value) : null, new_value: oldData, description: `Rolled back to state before audit #${auditId}` });

  return { success: true, rolled_back_to: oldData };
}

function getTableForModule(module) {
  const map = {
    products: 'products', orders: 'orders', leads: 'leads', staff: 'staff',
    billing: 'billing', expenses: 'expenses', job_cards: 'service_bookings',
    users: 'users', categories: 'categories', coupons: 'coupons',
  };
  return map[module] || null;
}
