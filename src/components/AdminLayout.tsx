import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, Bell, Search, RefreshCw, ChevronRight, CheckCheck, LogOut, Settings, BarChart3, User, X, Package, ShoppingBag, Users, ClipboardList, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const routeNames: Record<string, string> = {
  "/admin": "Dashboard", "/admin/products": "Products", "/admin/orders": "Orders",
  "/admin/customers": "Customers", "/admin/categories": "Categories", "/admin/blog": "Blog",
  "/admin/social": "Social Automation", "/admin/media": "Media Library",
  "/admin/whatsapp": "WhatsApp", "/admin/services": "Service Bookings",
  "/admin/reviews": "Product Reviews", "/admin/reels": "Reels & Videos",
  "/admin/evolution": "Evolution API", "/admin/settings": "Settings",
  "/admin/erp": "ERP", "/admin/erp/job-cards": "Job Cards",
  "/admin/erp/crm": "Sales CRM", "/admin/erp/billing": "Billing",
};

// Quick nav links for search
const QUICK_LINKS = [
  { label: 'Products', url: '/admin/products', icon: Package },
  { label: 'Orders', url: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', url: '/admin/customers', icon: Users },
  { label: 'Job Cards', url: '/admin/erp/job-cards', icon: ClipboardList },
  { label: 'CRM Leads', url: '/admin/erp/crm', icon: MessageSquare },
];

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Click outside close
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [products, orders, customers] = await Promise.all([
          api.getProducts({ search: query, limit: '3' }).catch(() => ({ products: [] })),
          api.getOrders({ search: query }).catch(() => []),
          api.getCustomers().catch(() => []),
        ]);
        const r: any[] = [];
        (products?.products || products || []).slice(0, 3).forEach((p: any) =>
          r.push({ type: 'product', label: p.name, sub: `₹${p.price}`, url: `/admin/products`, icon: 'Package' }));
        (Array.isArray(orders) ? orders : []).slice(0, 3).forEach((o: any) =>
          r.push({ type: 'order', label: o.order_number, sub: o.customer_name || 'Guest', url: `/admin/orders`, icon: 'ShoppingBag' }));
        (Array.isArray(customers) ? customers : []).filter((c: any) =>
          c.name?.toLowerCase().includes(query.toLowerCase()) || c.email?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 2).forEach((c: any) =>
          r.push({ type: 'customer', label: c.name, sub: c.email, url: `/admin/customers`, icon: 'Users' }));
        setResults(r);
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const go = (url: string) => { navigate(url); setOpen(false); setQuery(''); };

  const ICONS: Record<string, any> = { Package, ShoppingBag, Users, ClipboardList, MessageSquare };

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="relative cursor-pointer" onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
        <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search... (⌘K)"
          className="pl-8 w-56 h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {query && <button className="absolute right-2 top-1.5" onClick={() => setQuery('')}><X className="h-4 w-4 text-muted-foreground" /></button>}
      </div>

      {open && (
        <div className="absolute top-10 left-0 w-80 bg-popover border rounded-xl shadow-xl z-50 overflow-hidden">
          {!query && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 py-1">Quick Navigation</p>
              {QUICK_LINKS.map(l => {
                const Icon = l.icon;
                return (
                  <button key={l.url} onClick={() => go(l.url)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                    <Icon className="h-4 w-4 text-muted-foreground" />{l.label}
                  </button>
                );
              })}
            </div>
          )}

          {query && (
            <div className="p-2">
              {loading && <p className="text-xs text-muted-foreground text-center py-4">Searching...</p>}
              {!loading && results.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No results for "{query}"</p>}
              {results.map((r, i) => {
                const Icon = ICONS[r.icon] || Package;
                return (
                  <button key={i} onClick={() => go(r.url)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{r.type}</Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPage = routeNames[location.pathname] || "Admin";
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = () => {
    api.getNotifications().then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id: string) => {
    await api.markRead(id).catch(() => {});
    loadNotifications();
  };

  const markAllRead = async () => {
    await api.markAllRead().catch(() => {});
    loadNotifications();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="ml-0" />
              <div className="hidden sm:flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="font-medium text-foreground">{currentPage}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlobalSearch />

              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && <Badge variant="secondary" className="text-[10px]">{unreadCount} new</Badge>}
                      {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] text-primary hover:underline flex items-center gap-1"><CheckCheck className="h-3 w-3" /> All read</button>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">No notifications</div>
                  ) : notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer"
                      onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}>
                      <div className="flex items-center gap-2 w-full">
                        {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${!n.is_read ? 'font-semibold' : 'text-muted-foreground'}`}>{n.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{n.message}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-4">{new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                    </div>
                    <span className="text-xs hidden sm:inline max-w-24 truncate">{user?.name || 'Admin'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <Badge className="text-[9px] mt-1 capitalize">{(user as any)?.role || 'admin'}</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="gap-2 cursor-pointer">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/reports')} className="gap-2 cursor-pointer">
                    <BarChart3 className="h-3.5 w-3.5" /> Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account')} className="gap-2 cursor-pointer">
                    <User className="h-3.5 w-3.5" /> My Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-destructive cursor-pointer focus:text-destructive"
                    onClick={() => { logout(); navigate('/login'); }}>
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/" target="_blank" className="hidden sm:block">
                <Button variant="outline" size="sm" className="text-xs gap-1 h-8">
                  <ExternalLink className="h-3 w-3" /> Store
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
