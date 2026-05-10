import { useAuth } from "@/contexts/AuthContext";

const ROLE_LEVEL: Record<string, number> = {
  superadmin: 100, admin: 90, owner: 90,
  manager: 70, accountant: 60, sales: 50, technician: 40, staff: 30,
};

const MODULE_ROLES: Record<string, string[]> = {
  payroll:   ['admin', 'superadmin', 'owner', 'manager'],
  staff:     ['admin', 'superadmin', 'owner', 'manager'],
  expenses:  ['admin', 'superadmin', 'owner', 'manager', 'accountant'],
  billing:   ['admin', 'superadmin', 'owner', 'manager', 'accountant'],
  reports:   ['admin', 'superadmin', 'owner', 'manager', 'accountant'],
  job_cards: ['admin', 'superadmin', 'owner', 'manager', 'technician'],
  crm:       ['admin', 'superadmin', 'owner', 'manager', 'sales'],
  inventory: ['admin', 'superadmin', 'owner', 'manager', 'technician'],
  loyalty:   ['admin', 'superadmin', 'owner', 'manager', 'sales'],
  kpi_alerts:['admin', 'superadmin', 'owner'],
};

export function usePermissions() {
  const { user } = useAuth();
  const role = (user as any)?.role || 'staff';

  const can = (module: string): boolean => {
    const allowed = MODULE_ROLES[module];
    if (!allowed) return role === 'admin' || role === 'superadmin' || role === 'owner';
    return allowed.includes(role);
  };

  const isOwnerOrAdmin = role === 'admin' || role === 'superadmin' || role === 'owner';
  const isManager = isOwnerOrAdmin || role === 'manager';
  const level = ROLE_LEVEL[role] || 30;

  return { can, role, isOwnerOrAdmin, isManager, level };
}
