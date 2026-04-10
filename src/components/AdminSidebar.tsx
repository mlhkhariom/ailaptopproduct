import { LayoutDashboard, Package, ShoppingBag, FileText, Share2, Image, MessageCircle } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "डैशबोर्ड (Dashboard)", url: "/admin", icon: LayoutDashboard },
  { title: "प्रोडक्ट्स (Products)", url: "/admin/products", icon: Package },
  { title: "ऑर्डर्स (Orders)", url: "/admin/orders", icon: ShoppingBag },
  { title: "ब्लॉग (Blog)", url: "/admin/blog", icon: FileText },
  { title: "सोशल मीडिया", url: "/admin/social", icon: Share2 },
  { title: "मीडिया लाइब्रेरी", url: "/admin/media", icon: Image },
  { title: "WhatsApp", url: "/admin/whatsapp", icon: MessageCircle },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-serif font-bold text-xs shrink-0">A</div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-serif font-bold text-sidebar-foreground block text-sm leading-none">Apsoncure</span>
              <span className="text-[9px] text-sidebar-foreground/60">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">प्रबंधन (Management)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
