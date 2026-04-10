import { LayoutDashboard, Package, ShoppingBag, FileText, Share2, Image, MessageCircle, Settings, HelpCircle, ChevronDown, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const mainMenu = [
  { title: "डैशबोर्ड", subtitle: "Dashboard", url: "/admin", icon: LayoutDashboard, badge: "" },
  { title: "प्रोडक्ट्स", subtitle: "Products", url: "/admin/products", icon: Package, badge: "8" },
  { title: "ऑर्डर्स", subtitle: "Orders", url: "/admin/orders", icon: ShoppingBag, badge: "3" },
  { title: "ब्लॉग", subtitle: "Blog", url: "/admin/blog", icon: FileText, badge: "" },
];

const toolsMenu = [
  { title: "सोशल मीडिया", subtitle: "Social Automation", url: "/admin/social", icon: Share2, badge: "NEW" },
  { title: "मीडिया लाइब्रेरी", subtitle: "Media Library", url: "/admin/media", icon: Image, badge: "" },
  { title: "WhatsApp", subtitle: "Messaging", url: "/admin/whatsapp", icon: MessageCircle, badge: "" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-ring flex items-center justify-center text-sidebar-primary-foreground font-serif font-bold text-sm shrink-0 shadow-lg">
            A
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-serif font-bold text-sidebar-foreground block text-sm leading-none">Apsoncure</span>
              <span className="text-[10px] text-sidebar-foreground/50 flex items-center gap-1 mt-0.5">
                <Zap className="h-2.5 w-2.5" /> Admin Panel
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">
            {!collapsed && "मुख्य मेनू"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="rounded-lg hover:bg-sidebar-accent/50 transition-all px-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 ml-2">
                          <div>
                            <span className="text-sm block leading-tight">{item.title}</span>
                            <span className="text-[9px] text-sidebar-foreground/40">{item.subtitle}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="text-[9px] h-5 px-1.5 bg-sidebar-ring/20 text-sidebar-ring border-0">
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
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="mx-3 bg-sidebar-border/50" />}

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">
            {!collapsed && "टूल्स"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsMenu.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      className="rounded-lg hover:bg-sidebar-accent/50 transition-all px-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 ml-2">
                          <div>
                            <span className="text-sm block leading-tight">{item.title}</span>
                            <span className="text-[9px] text-sidebar-foreground/40">{item.subtitle}</span>
                          </div>
                          {item.badge && (
                            <Badge className="text-[9px] h-5 px-1.5 bg-sidebar-ring text-sidebar-primary-foreground border-0">
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-sidebar-accent/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-sidebar-ring/20 flex items-center justify-center">
                <span className="text-xs font-bold text-sidebar-ring">प्रा</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">डॉ. प्राची</p>
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
