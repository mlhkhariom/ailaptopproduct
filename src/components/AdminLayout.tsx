import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-between border-b bg-card px-4">
          <SidebarTrigger className="ml-0" />
          <Link to="/" target="_blank">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <ExternalLink className="h-3.5 w-3.5" /> View Store
            </Button>
          </Link>
        </header>
        <main className="flex-1 p-6 bg-background overflow-auto">{children}</main>
      </div>
    </div>
  </SidebarProvider>
);

export default AdminLayout;
