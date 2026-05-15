import { LayoutDashboard, Clock, Tv2, Sun, Moon, Shield, Search, Package, ShoppingBag, FileText, Share2, Image, MessageCircle, Settings, Users, Tag, ChevronDown, ChevronRight, Zap, IndianRupee, BarChart3, Palette, Mail, UserCog, Bell, Ticket, Wrench, Star, Play, Building2, Truck, ArrowUpDown, ClipboardList, Wallet, UserCheck, Receipt, ShoppingCart, TrendingUp, Cpu, DollarSign, Box, Calendar, MessageSquare, CalendarCheck, CalendarX, RefreshCw, Table2, Gift, UserCircle, FileSpreadsheet, Phone, RotateCcw, Layout, Send } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

const erpGroups = [
  {
    label: "Operations",
    labelIcon: Cpu,
    items: [
      { title: "ERP Overview", url: "/admin/erp", icon: Building2 },
      { title: "Live Dashboard", url: "/admin/erp/live", icon: Tv2 },
      { title: "Job Cards", url: "/admin/erp/job-cards", icon: ClipboardList, badge: "core" },
      { title: "Services", url: "/admin/services", icon: Wrench },
      { title: "Branches", url: "/admin/erp/branches", icon: Building2 },
    ],
  },
  {
    label: "CRM",
    labelIcon: Users,
    items: [
      { title: "Leads & Pipeline", url: "/admin/erp/crm", icon: Users, badge: "core" },
      { title: "Follow-ups", url: "/admin/erp/crm?tab=list&status=all", icon: Phone },
      { title: "Kanban Board", url: "/admin/erp/crm?tab=kanban", icon: LayoutDashboard },
      { title: "Automations", url: "/admin/automations", icon: Zap, badge: "NEW" },
      { title: "Email Campaigns", url: "/admin/email-campaigns", icon: Mail },
      { title: "Customer 360", url: "/admin/erp/customer360", icon: UserCircle },
    ],
  },
  {
    label: "Finance",
    labelIcon: DollarSign,
    items: [
      { title: "Billing", url: "/admin/erp/billing", icon: Receipt, badge: "core" },
      { title: "Recurring", url: "/admin/erp/recurring", icon: RefreshCw },
      { title: "Expenses", url: "/admin/erp/expenses", icon: Wallet },
      { title: "GSTR-1 Export", url: "/admin/erp/reports#gstr", icon: FileSpreadsheet },
    ],
  },
  {
    label: "HR & Staff",
    labelIcon: UserCheck,
    items: [
      { title: "Staff", url: "/admin/erp/staff", icon: UserCheck },
      { title: "Payroll", url: "/admin/erp/payroll", icon: IndianRupee, perm: 'payroll' },
      { title: "Attendance", url: "/admin/erp/attendance", icon: CalendarCheck },
      { title: "Shifts", url: "/admin/erp/shifts", icon: Clock },
      { title: "Leaves", url: "/admin/erp/leaves", icon: CalendarX },
    ],
  },
  {
    label: "Reports & Analytics",
    labelIcon: BarChart3,
    items: [
      { title: "ERP Reports", url: "/admin/erp/reports", icon: BarChart3 },
      { title: "Report Builder", url: "/admin/erp/report-builder", icon: Table2 },
      { title: "KPI Alerts", url: "/admin/erp/kpi-alerts", icon: Bell, perm: 'kpi_alerts' },
      { title: "Audit Log", url: "/admin/erp/audit-log", icon: Shield, perm: "kpi_alerts" },
    ],
  },
  {
    label: "Procurement",
    labelIcon: Box,
    items: [
      { title: "Inventory", url: "/admin/inventory", icon: Package },
      { title: "Suppliers", url: "/admin/inventory?tab=suppliers", icon: Truck },
      { title: "Purchase Orders", url: "/admin/inventory?tab=po", icon: ShoppingCart },
      { title: "Stock Movements", url: "/admin/inventory?tab=movements", icon: ArrowUpDown },
    ],
  },
  {
    label: "Engagement",
    labelIcon: Gift,
    items: [
      { title: "Loyalty Program", url: "/admin/erp/loyalty", icon: Gift },
      { title: "WA Templates", url: "/admin/erp/wa-templates", icon: MessageCircle },
      { title: "Coupons", url: "/admin/coupons", icon: Ticket },
    ],
  },
];

const mainMenu = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, badge: "" },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3, badge: "NEW" },
  { title: "Products", url: "/admin/products", icon: Package, badge: "" },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag, badge: "" },
  { title: "Returns", url: "/admin/returns", icon: RotateCcw, badge: "" },
  { title: "Customers", url: "/admin/customers", icon: Users, badge: "" },
  { title: "Categories", url: "/admin/categories", icon: Tag, badge: "" },
  { title: "Abandoned Carts", url: "/admin/abandoned-carts", icon: ShoppingCart, badge: "" },
  { title: "Homepage", url: "/admin/homepage-sections", icon: Layout, badge: "NEW" },
];

const toolsMenu = [
  { title: "WhatsApp", url: "/admin/whatsapp", icon: MessageCircle, badge: "" },
  { title: "WA Broadcast", url: "/admin/broadcast", icon: Send, badge: "NEW" },
  { title: "Evolution API", url: "/admin/evolution", icon: Zap, badge: "" },
  { title: "Social Media", url: "/admin/social", icon: Share2, badge: "NEW" },
  { title: "Reels & Videos", url: "/admin/reels", icon: Play, badge: "" },
  { title: "Blog / Content", url: "/admin/blog", icon: FileText, badge: "" },
  { title: "CMS / Pages", url: "/admin/cms", icon: Palette, badge: "" },
  { title: "Media Library", url: "/admin/media", icon: Image, badge: "" },
  { title: "Reviews", url: "/admin/reviews", icon: Star, badge: "" },
  { title: "Contact Queries", url: "/admin/contacts", icon: Mail, badge: "" },
  { title: "Service Leads", url: "/admin/erp/crm?tab=list&source=Enquiry Form", icon: ClipboardList, badge: "" },
];

const systemMenu = [
  { title: "User & Roles", url: "/admin/users", icon: UserCog, badge: "" },
  { title: "Reports", url: "/admin/reports", icon: TrendingUp, badge: "" },
  { title: "Settings", url: "/admin/settings", icon: Settings, badge: "" },
  { title: "Shipping Rules", url: "/admin/shipping-rules", icon: Truck, badge: "" },
  { title: "Linktree Page", url: "/admin/settings?tab=linktree", icon: Share2, badge: "" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [sidebarSearch, setSidebarSearch] = useState("");
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const { user } = useAuth();
  const { can } = usePermissions();
  const [erpOpen, setErpOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Operations": true, "CRM": true, "Finance": true, "HR & Staff": false, "Reports & Analytics": false, "Procurement": false, "Engagement": false,
  });

  const toggleGroup = (label: string) =>
    setOpenGroups(g => ({ ...g, [label]: !g[label] }));

  const renderMenu = (items: { title: string; url: string; icon: any; badge?: string; perm?: string }[]) => {
    const filtered = items.filter(item => !item.perm || can(item.perm));
    if (!filtered.length) return null;
    return (
    <SidebarMenu>
      {filtered.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild className="h-9">
            <NavLink to={item.url} end={item.url === "/admin"} className="rounded-lg hover:bg-sidebar-accent/50 transition-all px-3" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm">
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 ml-2">
                  <span className="text-sm">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className={`text-[9px] h-4 px-1 border-0 ${item.badge === "NEW" ? "bg-primary/20 text-primary" : item.badge === "core" ? "bg-orange-100 text-orange-600" : "bg-sidebar-ring/20 text-sidebar-ring"}`}>
                      {item.badge === "core" ? "●" : item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-ring flex items-center justify-center text-sidebar-primary-foreground font-serif font-bold text-sm shrink-0 shadow-lg">A</div>
          {!collapsed && (
            <div className="leading-tight flex-1">
              <span className="font-serif font-bold text-sidebar-foreground block text-sm leading-none">AI Laptop Wala</span>
              <span className="text-[10px] text-sidebar-foreground/50 flex items-center gap-1 mt-0.5"><Zap className="h-2.5 w-2.5" /> Admin Console</span>
            </div>
          )}
          {!collapsed && unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground border-0 text-[9px] h-5 px-1.5">
              <Bell className="h-3 w-3 mr-0.5" /> {unreadCount}
            </Badge>
          )}
        </div>
      </SidebarHeader>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search menu..." value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} />
          </div>
        </div>
      )}

      <SidebarContent className="px-2">
        {/* ── Main (Ecommerce) ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "Ecommerce"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(mainMenu)}</SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}

        {/* ── ERP Section ── */}
        <SidebarGroup>
          <button
            onClick={() => setErpOpen(o => !o)}
            className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-sidebar-accent/30 transition-colors mb-1"
          >
            {!collapsed && (
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 font-semibold flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> ERP / CRM
              </span>
            )}
            {!collapsed && (erpOpen
              ? <ChevronDown className="h-3 w-3 text-sidebar-foreground/40" />
              : <ChevronRight className="h-3 w-3 text-sidebar-foreground/40" />
            )}
          </button>

          {erpOpen && (
            <SidebarGroupContent>
              {erpGroups.map(group => (
                <div key={group.label} className="mb-1">
                  {!collapsed && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="flex items-center justify-between w-full px-3 py-1 text-[10px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <group.labelIcon className="h-3 w-3" />
                        {group.label}
                      </span>
                      {openGroups[group.label]
                        ? <ChevronDown className="h-2.5 w-2.5" />
                        : <ChevronRight className="h-2.5 w-2.5" />}
                    </button>
                  )}
                  {(collapsed || openGroups[group.label]) && renderMenu(group.items)}
                </div>
              ))}
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}

        {/* ── Tools ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "Tools & Content"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(toolsMenu)}</SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}

        {/* ── System (always visible) ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "System"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(systemMenu)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-sidebar-accent/30 p-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-sidebar-ring/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-sidebar-ring">{user?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-sidebar-foreground/50 capitalize">{(user as any)?.role || 'admin'}</p>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
