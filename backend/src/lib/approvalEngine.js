// ══════════════════════════════════════════════════════════
// UNIVERSAL APPROVAL ENGINE
// Any module can request approval: expenses, POs, refunds, leaves, discounts
// ══════════════════════════════════════════════════════════

import { v4 as uuid } from 'uuid';
import db from '../db/database.js';

// Create approval request
export async function requestApproval({ module, ref_id, title, amount, requested_by, approver_role, data }) {
  const id = uuid();
  await db.prepare(`INSERT INTO approvals (id, module, ref_id, title, amount, requested_by, approver_role, data, status)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(id, module, ref_id, title, amount || 0, requested_by, approver_role || 'manager', JSON.stringify(data || {}), 'pending');
  // Notify approvers
  const { notify } = await import('./notifications.js');
  notify({ type: 'approval', title: `Approval needed: ${title}`, message: `${module} — ₹${amount || 0} by ${requested_by}`, link: '/admin/approvals', roles: [approver_role || 'manager', 'admin', 'superadmin'] });
  return id;
}

// Approve
export async function approve(approvalId, approvedBy, notes) {
  const item = await db.prepare('SELECT * FROM approvals WHERE id=?').get(approvalId);
  if (!item || item.status !== 'pending') return { error: 'Not found or already processed' };
  await db.prepare("UPDATE approvals SET status='approved', approved_by=?, notes=?, approved_at=NOW() WHERE id=?").run(approvedBy, notes || '', approvalId);
  // Execute post-approval action
  await executeApprovalAction(item);
  return { success: true };
}

// Reject
export async function reject(approvalId, rejectedBy, reason) {
  await db.prepare("UPDATE approvals SET status='rejected', approved_by=?, notes=?, approved_at=NOW() WHERE id=?").run(rejectedBy, reason || '', approvalId);
  return { success: true };
}

// Post-approval actions (auto-execute after approval)
async function executeApprovalAction(item) {
  try {
    switch (item.module) {
      case 'expense':
        await db.prepare("UPDATE expenses SET status='approved' WHERE id=?").run(item.ref_id);
        break;
      case 'purchase_order':
        await db.prepare("UPDATE purchase_orders SET status='approved' WHERE id=?").run(item.ref_id);
        break;
      case 'refund':
        await db.prepare("UPDATE returns SET status='approved' WHERE id=?").run(item.ref_id);
        break;
      case 'leave':
        await db.prepare("UPDATE leaves SET status='approved' WHERE id=?").run(item.ref_id);
        break;
      case 'discount':
        // Custom discount approval — data has product_id + new_price
        const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
        if (data.product_id && data.new_price) {
          await db.prepare('UPDATE products SET price=? WHERE id=?').run(data.new_price, data.product_id);
        }
        break;
    }
  } catch (e) { console.error('Approval action error:', e.message); }
}

// Get pending approvals for a role
export async function getPendingApprovals(role) {
  return await db.prepare("SELECT * FROM approvals WHERE status='pending' AND (approver_role=? OR approver_role='any') ORDER BY created_at DESC")
    .all(role);
}
