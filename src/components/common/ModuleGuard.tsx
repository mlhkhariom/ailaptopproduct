import { ReactNode } from "react";
import { useAppSettings } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

export default function ModuleGuard({ module, children }: { module: string; children: ReactNode }) {
  const appSettings = useAppSettings() as any;
  const { user } = useAuth();

  // Superadmin always has access
  if ((user as any)?.role === 'superadmin') return <>{children}</>;

  // Check if module is disabled
  if (appSettings?.[module] === '0') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Module Disabled</h1>
        <p className="text-muted-foreground max-w-md">This module has been disabled by the platform administrator. Contact MLHK Infotech to enable it.</p>
      </div>
    );
  }

  return <>{children}</>;
}
