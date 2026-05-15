import { useState, useEffect } from "react";
import { ShoppingCart, Send, CheckCircle, Clock } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/orders?type=abandoned', { headers }).then(r => r.json()).then(d => {
      // Fallback: fetch from abandoned_carts directly
      fetch('/api/erp/abandoned-carts', { headers }).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setCarts(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Abandoned Carts</h1>
            <p className="text-sm text-muted-foreground">{carts.length} carts • Auto WhatsApp reminder after 2 hours</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black">{carts.length}</p><p className="text-xs text-muted-foreground">Total Abandoned</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-green-600">{carts.filter(c => c.recovered).length}</p><p className="text-xs text-muted-foreground">Recovered</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-orange-600">{carts.filter(c => c.reminder_sent && !c.recovered).length}</p><p className="text-xs text-muted-foreground">Reminder Sent</p></CardContent></Card>
        </div>

        {loading ? <p className="text-center py-10">Loading...</p> : carts.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No abandoned carts yet. System auto-captures when customers leave with items in cart.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {carts.map((c: any) => {
              const items = typeof c.items === 'string' ? JSON.parse(c.items) : c.items;
              return (
                <Card key={c.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{c.phone || c.email || 'Anonymous'}</span>
                        {c.recovered ? <Badge className="bg-green-100 text-green-700">Recovered</Badge> : c.reminder_sent ? <Badge className="bg-orange-100 text-orange-700">Reminded</Badge> : <Badge variant="outline">Pending</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{items?.map((i: any) => i.name).join(', ')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Total: ₹{c.total?.toLocaleString('en-IN')} • {new Date(c.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₹{c.total?.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-muted-foreground">{items?.length} items</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
