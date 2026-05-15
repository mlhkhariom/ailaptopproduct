import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Users, Receipt, Package, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  { url: '/admin/erp', icon: LayoutDashboard, label: 'Home' },
  { url: '/admin/erp/job-cards', icon: ClipboardList, label: 'Jobs' },
  { url: '/admin/erp/crm', icon: Users, label: 'CRM' },
  { url: '/admin/erp/billing', icon: Receipt, label: 'Billing' },
  { url: '/admin/inventory', icon: Package, label: 'Stock' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.url || (item.url !== '/admin/erp' && pathname.startsWith(item.url));
          return (
            <Link key={item.url} to={item.url} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
