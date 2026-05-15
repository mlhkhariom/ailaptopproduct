import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/contexts/AuthContext";

// Maintenance Mode wrapper
export const MaintenanceGate = ({ children }: { children: React.ReactNode }) => {
  const { maintenance_mode } = useSiteSettings();
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === 'admin' || (user as any)?.role === 'superadmin';
  if (maintenance_mode && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10 p-8 text-center">
        <div className="text-6xl mb-6">🌿</div>
        <h1 className="text-4xl font-serif font-bold mb-3">Coming Soon</h1>
        <p className="text-muted-foreground text-lg max-w-md">We're working on something amazing. AI Laptop Wala will be back shortly.</p>
        <p className="text-sm text-muted-foreground mt-4">For urgent queries: <a href="https://wa.me/919876543210" className="text-primary underline">WhatsApp us</a></p>
      </div>
    );
  }
  return <>{children}</>;
};
