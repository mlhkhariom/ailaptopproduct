export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
};

// Role hierarchy: owner > manager > technician > sales > accountant
const ROLE_LEVEL = { superadmin: 100, admin: 90, owner: 90, manager: 70, accountant: 60, sales: 50, technician: 40, staff: 30 };

// Require minimum role level
export const requireRole = (...roles) => (req, res, next) => {
  const userRole = req.user?.role || 'staff';
  const allowed = roles.some(r => (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[r] || 0));
  if (!allowed) return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
  next();
};

// ERP module permissions
export const ERP_PERMS = {
  // Who can access what
  payroll:    ['admin', 'superadmin', 'owner', 'manager'],
  staff:      ['admin', 'superadmin', 'owner', 'manager'],
  expenses:   ['admin', 'superadmin', 'owner', 'manager', 'accountant'],
  billing:    ['admin', 'superadmin', 'owner', 'manager', 'accountant'],
  reports:    ['admin', 'superadmin', 'owner', 'manager', 'accountant'],
  job_cards:  ['admin', 'superadmin', 'owner', 'manager', 'technician'],
  crm:        ['admin', 'superadmin', 'owner', 'manager', 'sales'],
  inventory:  ['admin', 'superadmin', 'owner', 'manager', 'technician'],
};

export const canAccess = (module) => (req, res, next) => {
  const userRole = req.user?.role || 'staff';
  const allowed = ERP_PERMS[module] || ['admin', 'superadmin'];
  if (!allowed.includes(userRole)) return res.status(403).json({ error: `No access to ${module}` });
  next();
};
