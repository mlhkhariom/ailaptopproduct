// App configuration
export const APP_CONFIG = {
  name: 'MLHK ERP Platform',
  version: '2.0.0',
  developer: 'MLHK Infotech',
  apiBase: import.meta.env.VITE_API_URL || '/api',
};

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OWNER: 'owner',
  ACCOUNTANT: 'accountant',
  SALES: 'sales',
  TECHNICIAN: 'technician',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

export const MODULES = [
  'mod_ecommerce', 'mod_crm', 'mod_erp', 'mod_billing',
  'mod_inventory', 'mod_hr', 'mod_blog', 'mod_whatsapp',
  'mod_email', 'mod_social', 'mod_analytics', 'mod_loyalty',
  'mod_reviews', 'mod_multi_branch', 'mod_ai_agent', 'mod_custom_code',
] as const;
