import { LayoutDashboard, Package, ShoppingBag, FileText, Share2, Image, MessageCircle, Settings, Users, Tag, ChevronDown, Zap, IndianRupee, BarChart3, Palette, Globe } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const mainMenu = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, badge: "" },
  { title: "Products", url: "/admin/products", icon: Package, badge: "8" },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag, badge: "3" },
  { title: "Payments", url: "/admin/payments", icon: IndianRupee, badge: "" },
  { title: "Customers", url: "/admin/customers", icon: Users, badge: "" },
  { title: "Categories", url: "/admin/categories", icon: Tag, badge: "" },
];

const toolsMenu = [
  { title: "Social Automation", url: "/admin/social", icon: Share2, badge: "NEW" },
  { title: "Blog / Content", url: "/admin/blog", icon: FileText, badge: "" },
  { title: "Media Library", url: "/admin/media", icon: Image, badge: "" },
  { title: "WhatsApp", url: "/admin/whatsapp", icon: MessageCircle, badge: "" },
  { title: "CMS / Pages", url: "/admin/cms", icon: Palette, badge: "NEW" },
];

const systemMenu = [
  { title: "Reports", url: "/admin/reports", icon: BarChart3, badge: "" },
  { title: "Settings", url: "/admin/settings", icon: Settings, badge: "" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderMenu = (items: typeof mainMenu) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild className="h-10">
            <NavLink to={item.url} end={item.url === "/admin"} className="rounded-lg hover:bg-sidebar-accent/50 transition-all px-3" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm">
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 ml-2">
                  <span className="text-sm">{item.title}</span>
                  {item.badge && (
                    <Badge variant={item.badge === "NEW" ? "default" : "secondary"} className={`text-[9px] h-5 px-1.5 border-0 ${item.badge === "NEW" ? "bg-sidebar-ring text-sidebar-primary-foreground" : "bg-sidebar-ring/20 text-sidebar-ring"}`}>
                      {item.badge}
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
            <div className="leading-tight">
              <span className="font-serif font-bold text-sidebar-foreground block text-sm leading-none">Apsoncure</span>
              <span className="text-[10px] text-sidebar-foreground/50 flex items-center gap-1 mt-0.5"><Zap className="h-2.5 w-2.5" /> Admin Console</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "Main"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(mainMenu)}</SidebarGroupContent>
        </SidebarGroup>
        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "Tools"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(toolsMenu)}</SidebarGroupContent>
        </SidebarGroup>
        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">{!collapsed && "System"}</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(systemMenu)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-sidebar-accent/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-sidebar-ring/20 flex items-center justify-center"><span className="text-xs font-bold text-sidebar-ring">DP</span></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">Dr. Prachi</p>
                <p className="text-[10px] text-sidebar-foreground/50">Super Admin</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
