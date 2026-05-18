// ══════════════════════════════════════════════════════════════
// RBAC — Role-Based Access Control with Permission Matrix
// ══════════════════════════════════════════════════════════════

// Roles hierarchy
export const ROLES = {
  
  superadmin: { level: 100, label: 'Super Admin (Owner)' },
  admin: { level: 90, label: 'Admin' },
  manager: { level: 70, label: 'Manager' },
  accountant: { level: 60, label: 'Accounts' },
  sales: { level: 50, label: 'Sales' },
  technician: { level: 45, label: 'Technician' },
  hr: { level: 55, label: 'HR' },
  content_editor: { level: 40, label: 'Content Editor' },
  support: { level: 35, label: 'Support' },
  staff: { level: 30, label: 'Staff' },
  customer: { level: 10, label: 'Customer' },
};

// Permission Matrix — module.action → allowed roles
// C=Create, R=Read, U=Update, D=Delete
export const PERMISSIONS = {
  // ── ECOMMERCE ──────────────────────────────────────────
  'products.create':    ['superadmin', 'admin', 'manager'],
  'products.read':      ['superadmin', 'admin', 'manager', 'sales', 'content_editor', 'support'],
  'products.update':    ['superadmin', 'admin', 'manager'],
  'products.delete':    ['superadmin'],
  'products.bulk':      ['superadmin', 'admin'],

  'orders.create':      ['superadmin', 'admin', 'manager', 'sales', 'support'],
  'orders.read':        ['superadmin', 'admin', 'manager', 'sales', 'support', 'accountant'],
  'orders.update':      ['superadmin', 'admin', 'manager', 'sales'],
  'orders.delete':      ['superadmin'],
  'orders.export':      ['superadmin', 'admin', 'manager', 'accountant'],

  'customers.read':     ['superadmin', 'admin', 'manager', 'sales', 'support'],
  'customers.update':   ['superadmin', 'admin', 'manager', 'sales'],

  'coupons.create':     ['superadmin', 'admin', 'manager'],
  'coupons.read':       ['superadmin', 'admin', 'manager', 'sales'],
  'coupons.delete':     ['superadmin', 'admin'],

  'returns.read':       ['superadmin', 'admin', 'manager', 'support'],
  'returns.update':     ['superadmin', 'admin', 'manager'],

  // ── ERP ────────────────────────────────────────────────
  'jobcards.create':    ['superadmin', 'admin', 'manager', 'technician', 'support'],
  'jobcards.read':      ['superadmin', 'admin', 'manager', 'technician', 'support'],
  'jobcards.update':    ['superadmin', 'admin', 'manager', 'technician'],
  'jobcards.delete':    ['superadmin', 'admin'],

  'billing.create':     ['superadmin', 'admin', 'manager', 'accountant'],
  'billing.read':       ['superadmin', 'admin', 'manager', 'accountant'],
  'billing.update':     ['superadmin', 'admin', 'manager', 'accountant'],
  'billing.delete':     ['superadmin'],

  'inventory.read':     ['superadmin', 'admin', 'manager', 'technician', 'accountant'],
  'inventory.update':   ['superadmin', 'admin', 'manager'],
  'inventory.transfer': ['superadmin', 'admin', 'manager'],
  'inventory.audit':    ['superadmin', 'admin', 'manager'],

  'expenses.create':    ['superadmin', 'admin', 'manager', 'accountant', 'staff'],
  'expenses.read':      ['superadmin', 'admin', 'manager', 'accountant'],
  'expenses.approve':   ['superadmin', 'admin', 'manager'],

  'payroll.read':       ['superadmin', 'admin', 'hr'],
  'payroll.update':     ['superadmin', 'admin', 'hr'],

  'staff.create':       ['superadmin', 'admin', 'hr'],
  'staff.read':         ['superadmin', 'admin', 'manager', 'hr'],
  'staff.update':       ['superadmin', 'admin', 'hr'],
  'staff.delete':       ['superadmin'],

  'finance.read':       ['superadmin', 'admin', 'accountant'],
  'finance.pnl':        ['superadmin', 'admin'],
  'finance.reconcile':  ['superadmin', 'admin', 'accountant'],

  'reports.read':       ['superadmin', 'admin', 'manager', 'accountant'],
  'reports.export':     ['superadmin', 'admin', 'manager'],

  // ── CRM ────────────────────────────────────────────────
  'leads.create':       ['superadmin', 'admin', 'manager', 'sales', 'support'],
  'leads.read':         ['superadmin', 'admin', 'manager', 'sales', 'support'],
  'leads.update':       ['superadmin', 'admin', 'manager', 'sales'],
  'leads.delete':       ['superadmin', 'admin'],
  'leads.assign':       ['superadmin', 'admin', 'manager'],
  'leads.export':       ['superadmin', 'admin', 'manager'],

  'campaigns.create':   ['superadmin', 'admin', 'manager', 'sales'],
  'campaigns.send':     ['superadmin', 'admin', 'manager'],

  'automations.manage': ['superadmin', 'admin'],

  // ── CMS ────────────────────────────────────────────────
  'blog.create':        ['superadmin', 'admin', 'content_editor'],
  'blog.read':          ['superadmin', 'admin', 'content_editor', 'manager'],
  'blog.update':        ['superadmin', 'admin', 'content_editor'],
  'blog.delete':        ['superadmin', 'admin'],

  'pages.create':       ['superadmin', 'admin', 'content_editor'],
  'pages.update':       ['superadmin', 'admin', 'content_editor'],

  'banners.manage':     ['superadmin', 'admin', 'content_editor'],
  'menus.manage':       ['superadmin', 'admin'],
  'popups.manage':      ['superadmin', 'admin', 'content_editor'],

  'media.upload':       ['superadmin', 'admin', 'content_editor', 'sales', 'technician'],
  'media.delete':       ['superadmin', 'admin'],

  // ── SYSTEM ─────────────────────────────────────────────
  'settings.read':      ['superadmin', 'admin'],
  'settings.update':    ['superadmin'],

  'whatsapp.send':      ['superadmin', 'admin', 'manager', 'sales', 'support'],
  'whatsapp.broadcast': ['superadmin', 'admin', 'manager'],

  'users.create':       ['superadmin'],
  'users.read':         ['superadmin', 'admin', 'hr'],
  'users.update':       ['superadmin'],
  'users.delete':       ['superadmin'],

  'audit.read':         ['superadmin', 'admin'],
};

// ── Middleware: Check specific permission ─────────────────
export const hasPermission = (...perms) => (req, res, next) => {
  const userRole = req.user?.role || 'customer';
  // Owner/superadmin bypass all checks
  if (['superadmin', 'admin'].includes(userRole)) return next();

  const allowed = perms.some(perm => {
    const roles = PERMISSIONS[perm];
    return roles && roles.includes(userRole);
  });

  if (!allowed) {
    return res.status(403).json({
      error: 'Permission denied',
      required: perms,
      your_role: userRole,
    });
  }
  next();
};

// ── Get all permissions for a role ────────────────────────
export const getPermissionsForRole = (role) => {
  const perms = {};
  for (const [perm, roles] of Object.entries(PERMISSIONS)) {
    perms[perm] = roles.includes(role) || ['superadmin'].includes(role);
  }
  return perms;
};

// ── API: Get current user's permissions ───────────────────
export const getUserPermissions = (req) => {
  const role = req.user?.role || 'customer';
  return {
    role,
    role_label: ROLES[role]?.label || role,
    level: ROLES[role]?.level || 0,
    permissions: getPermissionsForRole(role),
  };
};
