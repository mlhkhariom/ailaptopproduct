import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    fetch('/api/push/notifications', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifications(d); }).catch(() => {});
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/push/notifications/${id}/read`, { method: 'PUT', headers });
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: 1 } : x));
  };

  const typeIcon: Record<string, string> = { order: '📦', push: '🔔', promo: '🎉', return: '↩️', service: '🔧' };

  return (
    <CustomerLayout>
      <SEOHead title="Notifications | AI Laptop Wala" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-black flex items-center gap-2 mb-6"><Bell className="h-6 w-6" /> Notifications</h1>

        {!token ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Please login to see notifications</CardContent></Card>
        ) : notifications.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No notifications yet</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <Card key={n.id} className={n.is_read ? 'opacity-60' : ''}>
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-xl">{typeIcon[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                  </div>
                  {!n.is_read && (
                    <Button size="sm" variant="ghost" className="shrink-0" onClick={() => markRead(n.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
