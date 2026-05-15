import { useState, useEffect } from "react";
import ERPLayout from "@/components/layout/ERPLayout";
import BranchSelector from "@/components/BranchSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const STATUS_CFG = {
  pending:  { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-700',      icon: XCircle },
};

const LEAVE_TYPES = ['casual', 'sick', 'earned', 'unpaid'];

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState('all');
  const [staff, setStaff] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ staff_id: '', type: 'casual', from_date: '', to_date: '', reason: '' });

  const load = async () => {
    setLoading(true);
    const [l, s] = await Promise.all([
      req('GET', `/leaves${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
      req('GET', '/staff'),
    ]);
    setLeaves(Array.isArray(l) ? l : []);
    setStaff(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const save = async () => {
    if (!form.staff_id || !form.from_date || !form.to_date) return toast.error('All fields required');
    const res = await req('POST', '/leaves', form);
    toast.success(`Leave request created (${res.days} days)`);
    setOpen(false); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await req('PATCH', `/leaves/${id}`, { status });
    toast.success(`Leave ${status}`); load();
  };

  const counts = { all: leaves.length, pending: leaves.filter(l => l.status === 'pending').length, approved: leaves.filter(l => l.status === 'approved').length };

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Leave Management</h1>
          <div className="flex gap-2">
<BranchSelector value={branchFilter} onChange={setBranchFilter} className="w-44" />
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={() => { setForm({ staff_id: '', type: 'casual', from_date: '', to_date: '', reason: '' }); setOpen(true); }} className="gap-1.5">
              <Plus className="h-4 w-4" /> New Request
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: counts.all, color: 'text-foreground' },
            { label: 'Pending', value: counts.pending, color: 'text-yellow-600' },
            { label: 'Approved', value: counts.approved, color: 'text-green-600' },
          ].map(k => (
            <div key={k.label} className="border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40'}`}>
              {s} {s !== 'all' && `(${leaves.filter(l => l.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs font-semibold">Staff</th>
                <th className="text-left p-3 text-xs font-semibold">Type</th>
                <th className="text-left p-3 text-xs font-semibold">From</th>
                <th className="text-left p-3 text-xs font-semibold">To</th>
                <th className="text-center p-3 text-xs font-semibold">Days</th>
                <th className="text-left p-3 text-xs font-semibold">Reason</th>
                <th className="text-center p-3 text-xs font-semibold">Status</th>
                <th className="text-center p-3 text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => {
                const cfg = STATUS_CFG[l.status as keyof typeof STATUS_CFG] || STATUS_CFG.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={l.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <p className="font-medium text-sm">{l.staff_name}</p>
                      <p className="text-xs text-muted-foreground">{l.role}</p>
                    </td>
                    <td className="p-3 text-sm capitalize">{l.type}</td>
                    <td className="p-3 text-sm">{l.from_date}</td>
                    <td className="p-3 text-sm">{l.to_date}</td>
                    <td className="p-3 text-center font-bold">{l.days}</td>
                    <td className="p-3 text-sm text-muted-foreground">{l.reason || '—'}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit mx-auto ${cfg.color}`}>
                        <Icon className="h-3 w-3" />{l.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {l.status === 'pending' && (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(l.id, 'approved')}>
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200" onClick={() => updateStatus(l.id, 'rejected')}>
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!leaves.length && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No leave requests</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Staff *</Label>
                <Select value={form.staff_id} onValueChange={v => setForm(f => ({ ...f, staff_id: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Leave Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{LEAVE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">From *</Label><Input type="date" className="mt-1 h-9" value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))} /></div>
                <div><Label className="text-xs">To *</Label><Input type="date" className="mt-1 h-9" value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))} /></div>
              </div>
              {form.from_date && form.to_date && (
                <p className="text-xs text-primary font-medium">
                  {Math.ceil((new Date(form.to_date).getTime() - new Date(form.from_date).getTime()) / 86400000) + 1} days
                </p>
              )}
              <div><Label className="text-xs">Reason</Label><Input className="mt-1 h-9" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
