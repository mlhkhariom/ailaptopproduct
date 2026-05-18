// ══════════════════════════════════════════════════════════════
// RBAC — Role-Based Access Control with Permission Matrix
// ══════════════════════════════════════════════════════════════

// Roles hierarchy
export const ROLES = {
  owner: { level: 100, label: 'Owner' },
  superadmin: { level: 95, label: 'Super Admin' },
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
  'products.create':    ['owner', 'superadmin', 'admin', 'manager'],
  'products.read':      ['owner', 'superadmin', 'admin', 'manager', 'sales', 'content_editor', 'support'],
  'products.update':    ['owner', 'superadmin', 'admin', 'manager'],
  'products.delete':    ['owner', 'superadmin'],
  'products.bulk':      ['owner', 'superadmin', 'admin'],

  'orders.create':      ['owner', 'superadmin', 'admin', 'manager', 'sales', 'support'],
  'orders.read':        ['owner', 'superadmin', 'admin', 'manager', 'sales', 'support', 'accountant'],
  'orders.update':      ['owner', 'superadmin', 'admin', 'manager', 'sales'],
  'orders.delete':      ['owner', 'superadmin'],
  'orders.export':      ['owner', 'superadmin', 'admin', 'manager', 'accountant'],

  'customers.read':     ['owner', 'superadmin', 'admin', 'manager', 'sales', 'support'],
  'customers.update':   ['owner', 'superadmin', 'admin', 'manager', 'sales'],

  'coupons.create':     ['owner', 'superadmin', 'admin', 'manager'],
  'coupons.read':       ['owner', 'superadmin', 'admin', 'manager', 'sales'],
  'coupons.delete':     ['owner', 'superadmin', 'admin'],

  'returns.read':       ['owner', 'superadmin', 'admin', 'manager', 'support'],
  'returns.update':     ['owner', 'superadmin', 'admin', 'manager'],

  // ── ERP ────────────────────────────────────────────────
  'jobcards.create':    ['owner', 'superadmin', 'admin', 'manager', 'technician', 'support'],
  'jobcards.read':      ['owner', 'superadmin', 'admin', 'manager', 'technician', 'support'],
  'jobcards.update':    ['owner', 'superadmin', 'admin', 'manager', 'technician'],
  'jobcards.delete':    ['owner', 'superadmin', 'admin'],

  'billing.create':     ['owner', 'superadmin', 'admin', 'manager', 'accountant'],
  'billing.read':       ['owner', 'superadmin', 'admin', 'manager', 'accountant'],
  'billing.update':     ['owner', 'superadmin', 'admin', 'manager', 'accountant'],
  'billing.delete':     ['owner', 'superadmin'],

  'inventory.read':     ['owner', 'superadmin', 'admin', 'manager', 'technician', 'accountant'],
  'inventory.update':   ['owner', 'superadmin', 'admin', 'manager'],
  'inventory.transfer': ['owner', 'superadmin', 'admin', 'manager'],
  'inventory.audit':    ['owner', 'superadmin', 'admin', 'manager'],

  'expenses.create':    ['owner', 'superadmin', 'admin', 'manager', 'accountant', 'staff'],
  'expenses.read':      ['owner', 'superadmin', 'admin', 'manager', 'accountant'],
  'expenses.approve':   ['owner', 'superadmin', 'admin', 'manager'],

  'payroll.read':       ['owner', 'superadmin', 'admin', 'hr'],
  'payroll.update':     ['owner', 'superadmin', 'admin', 'hr'],

  'staff.create':       ['owner', 'superadmin', 'admin', 'hr'],
  'staff.read':         ['owner', 'superadmin', 'admin', 'manager', 'hr'],
  'staff.update':       ['owner', 'superadmin', 'admin', 'hr'],
  'staff.delete':       ['owner', 'superadmin'],

  'finance.read':       ['owner', 'superadmin', 'admin', 'accountant'],
  'finance.pnl':        ['owner', 'superadmin', 'admin'],
  'finance.reconcile':  ['owner', 'superadmin', 'admin', 'accountant'],

  'reports.read':       ['owner', 'superadmin', 'admin', 'manager', 'accountant'],
  'reports.export':     ['owner', 'superadmin', 'admin', 'manager'],

  // ── CRM ────────────────────────────────────────────────
  'leads.create':       ['owner', 'superadmin', 'admin', 'manager', 'sales', 'support'],
  'leads.read':         ['owner', 'superadmin', 'admin', 'manager', 'sales', 'support'],
  'leads.update':       ['owner', 'superadmin', 'admin', 'manager', 'sales'],
  'leads.delete':       ['owner', 'superadmin', 'admin'],
  'leads.assign':       ['owner', 'superadmin', 'admin', 'manager'],
  'leads.export':       ['owner', 'superadmin', 'admin', 'manager'],

  'campaigns.create':   ['owner', 'superadmin', 'admin', 'manager', 'sales'],
  'campaigns.send':     ['owner', 'superadmin', 'admin', 'manager'],

  'automations.manage': ['owner', 'superadmin', 'admin'],

  // ── CMS ────────────────────────────────────────────────
  'blog.create':        ['owner', 'superadmin', 'admin', 'content_editor'],
  'blog.read':          ['owner', 'superadmin', 'admin', 'content_editor', 'manager'],
  'blog.update':        ['owner', 'superadmin', 'admin', 'content_editor'],
  'blog.delete':        ['owner', 'superadmin', 'admin'],

  'pages.create':       ['owner', 'superadmin', 'admin', 'content_editor'],
  'pages.update':       ['owner', 'superadmin', 'admin', 'content_editor'],

  'banners.manage':     ['owner', 'superadmin', 'admin', 'content_editor'],
  'menus.manage':       ['owner', 'superadmin', 'admin'],
  'popups.manage':      ['owner', 'superadmin', 'admin', 'content_editor'],

  'media.upload':       ['owner', 'superadmin', 'admin', 'content_editor', 'sales', 'technician'],
  'media.delete':       ['owner', 'superadmin', 'admin'],

  // ── SYSTEM ─────────────────────────────────────────────
  'settings.read':      ['owner', 'superadmin', 'admin'],
  'settings.update':    ['owner', 'superadmin'],

  'whatsapp.send':      ['owner', 'superadmin', 'admin', 'manager', 'sales', 'support'],
  'whatsapp.broadcast': ['owner', 'superadmin', 'admin', 'manager'],

  'users.create':       ['owner', 'superadmin'],
  'users.read':         ['owner', 'superadmin', 'admin', 'hr'],
  'users.update':       ['owner', 'superadmin'],
  'users.delete':       ['owner', 'superadmin'],

  'audit.read':         ['owner', 'superadmin', 'admin'],
};

// ── Middleware: Check specific permission ─────────────────
export const hasPermission = (...perms) => (req, res, next) => {
  const userRole = req.user?.role || 'customer';
  // Owner/superadmin bypass all checks
  if (['owner', 'superadmin'].includes(userRole)) return next();

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
    perms[perm] = roles.includes(role) || ['owner', 'superadmin'].includes(role);
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
