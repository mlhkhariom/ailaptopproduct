import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');

  const load = () => api.getAdminReviews(status).then(setReviews).catch(() => {});
  useEffect(() => { load(); }, [status]);

  const update = async (id: string, s: string) => {
    await api.updateReview(id, s).catch(() => {});
    toast.success(s === 'approved' ? 'Review approved!' : 'Review rejected');
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Product Reviews</h1>
            <p className="text-sm text-muted-foreground">Moderate customer reviews</p>
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-center text-muted-foreground py-10">No {status} reviews</p>}
          {reviews.map(r => (
            <div key={r.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{r.customer_name?.[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{r.customer_name}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />)}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">{r.product_name}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{r.review || <em>No text</em>}</p>
                </div>
                {status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="gap-1 h-8" onClick={() => update(r.id, 'approved')}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1 h-8" onClick={() => update(r.id, 'rejected')}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
