import { useState, useEffect } from "react";
import { RotateCcw, Check, X, Clock } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700', refunded: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700', completed: 'bg-gray-100 text-gray-700',
};

export default function AdminReturns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => {
    fetch('/api/returns/admin', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setReturns(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    await fetch(`/api/returns/${id}`, { method: 'PUT', headers, body: JSON.stringify({ status, admin_notes: notes }) });
    toast.success(`Status updated to ${status}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><RotateCcw className="h-6 w-6" /> Returns & Refunds</h1>
            <p className="text-sm text-muted-foreground">{returns.length} total requests</p>
          </div>
        </div>

        {loading ? <p className="text-center py-10">Loading...</p> : returns.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No return requests yet</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {returns.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">Order: {r.order_number}</span>
                        <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                        <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Reason: {r.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">Amount: ₹{r.refund_amount?.toLocaleString('en-IN')} • {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                      {r.admin_notes && <p className="text-xs mt-1 p-2 bg-muted rounded">Notes: {r.admin_notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      {r.status === 'requested' && (
                        <>
                          <Button size="sm" variant="default" className="gap-1" onClick={() => updateStatus(r.id, 'approved', 'Approved for return/refund')}>
                            <Check className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => updateStatus(r.id, 'rejected', 'Does not meet return policy')}>
                            <X className="h-3 w-3" /> Reject
                          </Button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <Button size="sm" onClick={() => updateStatus(r.id, 'refunded', 'Refund processed')}>Mark Refunded</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
