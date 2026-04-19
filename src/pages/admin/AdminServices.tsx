import { useState, useEffect } from "react";
import { Calendar, Phone, Wrench, Clock, CheckCircle, XCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const AdminServices = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api.getServiceBookings(filter === 'all' ? undefined : filter).then(setBookings).catch(() => {});
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      await api.updateServiceBooking(id, { status, notes });
      toast.success('Status updated! WhatsApp notification sent.');
      setSelected(null);
      load();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const filtered = bookings.filter(b =>
    b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.booking_number?.includes(search) ||
    b.customer_phone?.includes(search)
  );

  const counts = bookings.reduce((acc: any, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Service Bookings</h1>
            <p className="text-sm text-muted-foreground">Manage repair & service appointments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['pending','confirmed','in_progress','completed','cancelled'].map(s => (
            <div key={s} onClick={() => setFilter(s)} className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${filter === s ? 'border-primary bg-primary/5' : ''}`}>
              <p className="text-xs text-muted-foreground capitalize">{s.replace('_',' ')}</p>
              <p className="text-2xl font-bold">{counts[s] || 0}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 text-sm" placeholder="Search name, phone, booking ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{['Booking','Customer','Service','Device','Date','Price','Status','Action'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-xs">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{b.booking_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.customer_name}</p>
                    <a href={`tel:${b.customer_phone}`} className="text-xs text-primary flex items-center gap-1"><Phone className="h-3 w-3" />{b.customer_phone}</a>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.service_name}</p>
                    <p className="text-xs text-muted-foreground">{b.issue_description?.slice(0,40)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{b.device_brand} {b.device_model}</td>
                  <td className="px-4 py-3 text-xs">
                    <p>{b.preferred_date || '—'}</p>
                    <p className="text-muted-foreground">{b.preferred_time || ''}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">₹{b.price}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[b.status] || ''}`}>{b.status?.replace('_',' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelected(b); setNotes(b.notes || ''); }}>Update</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No bookings found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Update Booking — {selected?.booking_number}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p><strong>{selected?.customer_name}</strong> · {selected?.customer_phone}</p>
              <p className="text-muted-foreground">{selected?.service_name} · {selected?.device_brand} {selected?.device_model}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Notes (optional)</p>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="text-sm resize-none" placeholder="Repair notes, parts needed..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['confirmed','in_progress','completed','cancelled'].map(s => (
                <Button key={s} size="sm" variant={s === 'completed' ? 'default' : s === 'cancelled' ? 'destructive' : 'outline'}
                  disabled={loading} onClick={() => updateStatus(selected.id, s)} className="capitalize text-xs gap-1">
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : s === 'completed' ? <CheckCircle className="h-3 w-3" /> : s === 'cancelled' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {s.replace('_',' ')}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminServices;
