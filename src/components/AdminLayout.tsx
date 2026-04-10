import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Link, useLocation } from "react-router-dom";
import { ExternalLink, Bell, Search, Moon, Sun, RefreshCw, ChevronRight } from "lucide-react";
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
  "/admin": "डैशबोर्ड",
  "/admin/products": "प्रोडक्ट्स",
  "/admin/orders": "ऑर्डर्स",
  "/admin/blog": "ब्लॉग",
  "/admin/social": "सोशल मीडिया",
  "/admin/media": "मीडिया लाइब्रेरी",
  "/admin/whatsapp": "WhatsApp",
};

const notifications = [
  { id: 1, text: "नया ऑर्डर APC-007 आया है", time: "2 मिनट पहले", read: false },
  { id: 2, text: "Ashwagandha स्टॉक कम हो रहा है", time: "1 घंटा पहले", read: false },
  { id: 3, text: "Instagram रील पब्लिश हो गई", time: "3 घंटे पहले", read: true },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const currentPage = routeNames[location.pathname] || "Admin";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Premium Header */}
          <header className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="ml-0" />

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="font-medium text-foreground">{currentPage}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="खोजें... (⌘K)" className="pl-8 w-56 h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1" />
              </div>

              {/* Refresh */}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">2</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>सूचनाएं (Notifications)</span>
                    <Badge variant="secondary" className="text-[10px]">2 नई</Badge>
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
                    सभी सूचनाएं देखें →
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">प्रा</span>
                    </div>
                    <span className="text-xs hidden sm:inline">डॉ. प्राची</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">डॉ. प्राची</p>
                    <p className="text-xs text-muted-foreground">prachi@apsoncure.com</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>⚙️ सेटिंग्स</DropdownMenuItem>
                  <DropdownMenuItem>📊 रिपोर्ट्स</DropdownMenuItem>
                  <DropdownMenuItem>❓ मदद (Help)</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">🚪 लॉग आउट</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/" target="_blank" className="hidden sm:block">
                <Button variant="outline" size="sm" className="text-xs gap-1 h-8">
                  <ExternalLink className="h-3 w-3" /> स्टोर
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
