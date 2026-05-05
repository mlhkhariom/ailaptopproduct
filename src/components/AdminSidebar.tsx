import { LayoutDashboard, Package, ShoppingBag, FileText, Share2, Image, MessageCircle, Settings, Users, Tag, ChevronDown, ChevronRight, Zap, IndianRupee, BarChart3, Palette, Mail, UserCog, Bell, Ticket, Wrench, Star, Play, Building2, Truck, ArrowUpDown, ClipboardList, Wallet, UserCheck, Receipt, ShoppingCart, TrendingUp, Cpu, DollarSign, PersonStanding, Box } from "lucide-react";
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

const erpGroups = [
  {
    label: "Operations",
    labelIcon: Cpu,
    items: [
      { title: "ERP Overview", url: "/admin/erp", icon: Building2 },
      { title: "Job Cards", url: "/admin/erp/job-cards", icon: ClipboardList, badge: "core" },
      { title: "Sales CRM", url: "/admin/erp/crm", icon: Users },
      { title: "Services", url: "/admin/services", icon: Wrench },
    ],
  },
  {
    label: "Finance",
    labelIcon: DollarSign,
    items: [
      { title: "Billing", url: "/admin/erp/billing", icon: Receipt, badge: "core" },
      { title: "Expenses", url: "/admin/erp/expenses", icon: Wallet },
      { title: "ERP Reports", url: "/admin/erp/reports", icon: BarChart3 },
    ],
  },
  {
    label: "People",
    labelIcon: UserCheck,
    items: [
      { title: "Staff", url: "/admin/erp/staff", icon: UserCheck },
      { title: "Branches", url: "/admin/erp/branches", icon: Building2 },
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
];

const mainMenu = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, badge: "" },
  { title: "Products", url: "/admin/products", icon: Package, badge: "" },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag, badge: "" },
  { title: "Payments", url: "/admin/payments", icon: IndianRupee, badge: "" },
  { title: "Customers", url: "/admin/customers", icon: Users, badge: "" },
  { title: "Categories", url: "/admin/categories", icon: Tag, badge: "" },
];

const toolsMenu = [
  { title: "Social Automation", url: "/admin/social", icon: Share2, badge: "NEW" },
  { title: "Blog / Content", url: "/admin/blog", icon: FileText, badge: "" },
  { title: "Media Library", url: "/admin/media", icon: Image, badge: "" },
  { title: "WhatsApp", url: "/admin/whatsapp", icon: MessageCircle, badge: "" },
  { title: "Reviews", url: "/admin/reviews", icon: Star, badge: "" },
  { title: "Reels", url: "/admin/reels", icon: Play, badge: "" },
  { title: "CMS / Pages", url: "/admin/cms", icon: Palette, badge: "" },
  { title: "Contact Queries", url: "/admin/contacts", icon: Mail, badge: "" },
  { title: "Coupons", url: "/admin/coupons", icon: Ticket, badge: "" },
];

const systemMenu = [
  { title: "User & Roles", url: "/admin/users", icon: UserCog, badge: "" },
  { title: "Reports", url: "/admin/reports", icon: TrendingUp, badge: "" },
  { title: "Settings", url: "/admin/settings", icon: Settings, badge: "" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const { user } = useAuth();
  const [erpOpen, setErpOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "🔧 Operations": true, "💰 Finance": true, "👥 People": false, "📦 Procurement": false,
  });

  const toggleGroup = (label: string) =>
    setOpenGroups(g => ({ ...g, [label]: !g[label] }));

  const renderMenu = (items: { title: string; url: string; icon: any; badge?: string }[]) => (
    <SidebarMenu>
      {items.map((item) => (
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

      <SidebarContent className="px-2">
        {/* ── ERP Section ── */}
        <SidebarGroup>
          <button
            onClick={() => setErpOpen(o => !o)}
            className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-sidebar-accent/30 transition-colors mb-1"
          >
            {!collapsed && (
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 font-semibold">ERP</span>
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

        {/* ── Main ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "Main"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(mainMenu)}</SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}

        {/* ── Tools ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "Tools"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(toolsMenu)}</SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}

        {/* ── System ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "System"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(systemMenu)}</SidebarGroupContent>
        </SidebarGroup>

        {user?.role === 'superadmin' && (
          <>
            {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "Super Admin"}</SidebarGroupLabel>
              <SidebarGroupContent>{renderMenu([{ title: "Evolution API", url: "/admin/evolution", icon: Zap, badge: "" }])}</SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
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
