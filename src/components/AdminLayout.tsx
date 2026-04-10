import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Link, useLocation } from "react-router-dom";
import { ExternalLink, Bell, Search, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const routeNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/categories": "Categories",
  "/admin/blog": "Blog",
  "/admin/social": "Social Automation",
  "/admin/media": "Media Library",
  "/admin/whatsapp": "WhatsApp",
  "/admin/settings": "Settings",
};

const notifications = [
  { id: 1, text: "New order APC-007 received", time: "2 min ago", read: false },
  { id: 2, text: "Ashwagandha stock running low", time: "1 hour ago", read: false },
  { id: 3, text: "Instagram reel published successfully", time: "3 hours ago", read: true },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const currentPage = routeNames[location.pathname] || "Admin";

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
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search... (⌘K)" className="pl-8 w-56 h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1" />
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">2</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Badge variant="secondary" className="text-[10px]">2 new</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer">
                      <div className="flex items-center gap-2 w-full">
                        {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        <span className={`text-sm flex-1 ${!n.read ? 'font-medium' : 'text-muted-foreground'}`}>{n.text}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-4">{n.time}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center text-xs text-primary justify-center">
                    View all notifications →
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">DP</span>
                    </div>
                    <span className="text-xs hidden sm:inline">Dr. Prachi</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">Dr. Prachi</p>
                    <p className="text-xs text-muted-foreground">prachi@apsoncure.com</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>⚙️ Settings</DropdownMenuItem>
                  <DropdownMenuItem>📊 Reports</DropdownMenuItem>
                  <DropdownMenuItem>❓ Help</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">🚪 Logout</DropdownMenuItem>
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
