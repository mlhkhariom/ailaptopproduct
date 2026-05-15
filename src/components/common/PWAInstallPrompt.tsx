import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa_dismissed');
    if (dismissed) return;

    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  const dismiss = () => { setShow(false); sessionStorage.setItem('pwa_dismissed', '1'); };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border shadow-xl rounded-xl p-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-2"><Download className="h-5 w-5 text-primary" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install AI Laptop Wala</p>
          <p className="text-[10px] text-muted-foreground">Quick access from home screen</p>
        </div>
        <Button size="sm" onClick={install}>Install</Button>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
