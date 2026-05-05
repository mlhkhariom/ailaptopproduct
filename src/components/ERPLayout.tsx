import AdminLayout from "@/components/AdminLayout";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ERP_ROUTES: Record<string, { label: string; action?: { label: string; url: string } }> = {
  "/admin/erp":            { label: "ERP Overview" },
  "/admin/erp/job-cards":  { label: "Job Cards",      action: { label: "+ New Job Card", url: "/admin/erp/job-cards" } },
  "/admin/erp/crm":        { label: "Sales CRM",       action: { label: "+ Add Lead",     url: "/admin/erp/crm" } },
  "/admin/erp/billing":    { label: "Billing",          action: { label: "+ Custom Invoice", url: "/admin/erp/billing" } },
  "/admin/erp/expenses":   { label: "Expenses",         action: { label: "+ Add Expense",  url: "/admin/erp/expenses" } },
  "/admin/erp/staff":      { label: "Staff",            action: { label: "+ Add Staff",    url: "/admin/erp/staff" } },
  "/admin/erp/branches":   { label: "Branches",         action: { label: "+ Add Branch",   url: "/admin/erp/branches" } },
  "/admin/erp/reports":    { label: "ERP Reports" },
  "/admin/inventory":      { label: "Inventory" },
};

interface ERPLayoutProps {
  children: React.ReactNode;
  /** Override the quick action button behavior — pass onClick to trigger dialog instead of navigating */
  onAction?: () => void;
}

export default function ERPLayout({ children, onAction }: ERPLayoutProps) {
  const location = useLocation();
  const route = ERP_ROUTES[location.pathname] || { label: "ERP" };

  return (
    <AdminLayout>
      {/* ERP Sub-header */}
      <div className="border-b bg-card/60 px-4 md:px-6 py-2.5 flex items-center justify-between gap-3 -mt-4 md:-mt-6 -mx-4 md:-mx-6 mb-4 md:mb-6">
        <div className="flex items-center gap-1.5 text-sm">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <Link to="/admin/erp" className="text-muted-foreground hover:text-foreground transition-colors text-xs">ERP</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <span className="font-semibold text-xs">{route.label}</span>
        </div>

        {route.action && (
          onAction
            ? <Button size="sm" className="h-7 text-xs" onClick={onAction}>{route.action.label}</Button>
            : <Link to={route.action.url}><Button size="sm" className="h-7 text-xs">{route.action.label}</Button></Link>
        )}
      </div>

      {children}
    </AdminLayout>
  );
}
