import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSettings } from "@/contexts/SiteSettingsContext";
import { Lock } from "lucide-react";

const PATH_MODULE_MAP: Record<string, string> = {
  '/admin/products': 'mod_ecommerce', '/admin/orders': 'mod_ecommerce', '/admin/payments': 'mod_ecommerce',
  '/admin/customers': 'mod_ecommerce', '/admin/returns': 'mod_ecommerce', '/admin/categories': 'mod_ecommerce',
  '/admin/abandoned-carts': 'mod_ecommerce', '/admin/coupons': 'mod_loyalty',
  '/admin/erp/crm': 'mod_crm', '/admin/automations': 'mod_crm', '/admin/email-campaigns': 'mod_crm',
  '/admin/erp/customer360': 'mod_crm',
  '/admin/erp/job-cards': 'mod_erp', '/admin/services': 'mod_erp', '/admin/erp/live': 'mod_erp',
  '/admin/erp/billing': 'mod_billing', '/admin/erp/recurring': 'mod_billing', '/admin/erp/expenses': 'mod_billing',
  '/admin/inventory': 'mod_inventory', '/admin/erp/branches': 'mod_inventory',
  '/admin/erp/staff': 'mod_hr', '/admin/erp/payroll': 'mod_hr', '/admin/erp/attendance': 'mod_hr',
  '/admin/erp/shifts': 'mod_hr', '/admin/erp/leaves': 'mod_hr',
  '/admin/whatsapp': 'mod_whatsapp', '/admin/broadcast': 'mod_whatsapp', '/admin/evolution': 'mod_whatsapp',
  '/admin/social': 'mod_social', '/admin/reels': 'mod_social',
  '/admin/blog': 'mod_blog', '/admin/cms': 'mod_blog', '/admin/media': 'mod_blog',
  '/admin/reviews': 'mod_reviews',
  '/admin/analytics': 'mod_analytics', '/admin/reports': 'mod_analytics', '/admin/erp/reports': 'mod_analytics',
  '/admin/erp/report-builder': 'mod_analytics', '/admin/erp/kpi-alerts': 'mod_analytics',
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const appSettings = useAppSettings() as any;
  const { pathname } = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login?redirect=admin" replace />;
  const role = (user as any).role;
  if (role !== 'admin' && role !== 'superadmin' && role !== 'manager' && role !== 'owner') return <Navigate to="/" replace />;

  // Module access check (superadmin bypasses)
  if (role !== 'superadmin' && appSettings) {
    const moduleKey = Object.entries(PATH_MODULE_MAP).find(([path]) => pathname.startsWith(path))?.[1];
    if (moduleKey && appSettings[moduleKey] === '0') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Module Disabled</h1>
          <p className="text-muted-foreground max-w-md">This module has been disabled by MLHK Infotech. Contact support to enable it.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
