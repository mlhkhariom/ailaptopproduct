import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus, Trash2, RefreshCw, Edit, X, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const CATEGORIES = ['Rent', 'Salary', 'Electricity', 'Internet', 'Supplies', 'Marketing', 'Transport', 'Maintenance', 'Tools', 'Other'];
const METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'];

const emptyForm = {
  category: '', amount: 0, description: '',
  payment_method: 'Cash', date: new Date().toISOString().split('T')[0],
};

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(false);

  // Filters
  const [catFilter, setCatFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const d = await req('GET', `/expenses?${params}`);
    setExpenses(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [from, to]);

  const filtered = expenses.filter(e =>
    catFilter === 'all' || e.category === catFilter
  );

  const save = async () => {
    if (!form.category || !form.amount) return toast.error('Category and amount required');
    try {
      if (editingId) {
        await req('PUT', `/expenses/${editingId}`, form);
        toast.success('Expense updated!');
      } else {
        await req('POST', '/expenses', form);
        toast.success('Expense added!');
      }
      setOpen(false); load();
    } catch { toast.error('Failed to save'); }
  };

  const openEdit = (e: any) => {
    setForm({ category: e.category, amount: e.amount, description: e.description || '', payment_method: e.payment_method || 'Cash', date: e.date });
    setEditingId(e.id); setOpen(true);
  };
  const openAdd = () => { setForm(emptyForm); setEditingId(null); setOpen(true); };

  const del = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await req('DELETE', `/expenses/${id}`);
    toast.success('Deleted'); load();
  };

  // Stats
  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const thisMonth = filtered.filter(e => e.date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + (e.amount || 0), 0);

  // Category breakdown
  const byCategory: Record<string, number> = {};
  filtered.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  const topCats = Object.entries(byCategory).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Expenses
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Expense</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="text-2xl font-black text-red-600">₹{thisMonth.toLocaleString('en-IN')}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Filtered Total</p>
            <p className="text-2xl font-black">₹{total.toLocaleString('en-IN')}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Entries</p>
            <p className="text-2xl font-black text-blue-600">{filtered.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Avg / Entry</p>
            <p className="text-2xl font-black text-orange-600">
              ₹{filtered.length ? Math.round(total / filtered.length).toLocaleString('en-IN') : 0}
            </p>
          </div>
        </div>

        {/* Category breakdown bar */}
        {topCats.length > 0 && (
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Top Categories</p>
            {topCats.map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-xs w-28 shrink-0 font-medium">{cat}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (amt / total) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold w-24 text-right">₹{amt.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" className="h-8 text-xs w-32" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" className="h-8 text-xs w-32" value={to} onChange={e => setTo(e.target.value)} />
          {(from || to || catFilter !== 'all') && (
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setFrom(''); setTo(''); setCatFilter('all'); }}>
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs">Date</th>
                <th className="text-left p-3 text-xs">Category</th>
                <th className="text-left p-3 text-xs">Description</th>
                <th className="text-left p-3 text-xs">Method</th>
                <th className="text-right p-3 text-xs">Amount</th>
                <th className="text-center p-3 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 text-xs">{e.date}</td>
                  <td className="p-3">
                    <span className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-700 rounded-full">{e.category}</span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{e.description || '—'}</td>
                  <td className="p-3 text-xs">{e.payment_method}</td>
                  <td className="p-3 text-right text-xs font-bold text-red-600">₹{(e.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(e)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="p-10 text-center text-muted-foreground text-xs">No expenses found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Expense</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Category *</Label>
                <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Amount (₹) *</Label>
                <Input type="number" className="mt-1 h-9" value={form.amount || ''} onChange={e => setForm((f: any) => ({ ...f, amount: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input className="mt-1 h-9" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="What was this for?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Payment Method</Label>
                  <Select value={form.payment_method} onValueChange={v => setForm((f: any) => ({ ...f, payment_method: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input type="date" className="mt-1 h-9" value={form.date} onChange={e => setForm((f: any) => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>💾 Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
