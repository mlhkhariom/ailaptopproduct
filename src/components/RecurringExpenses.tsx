import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const CATEGORIES = ['Rent', 'Electricity', 'Internet', 'Salary', 'Maintenance', 'Insurance', 'Subscription', 'Other'];

export default function RecurringExpenses() {
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Rent', amount: 0, description: '', payment_method: 'cash', frequency: 'monthly', next_date: new Date().toISOString().split('T')[0] });

  const load = async () => { const d = await req('GET', '/recurring-expenses'); setList(Array.isArray(d) ? d : []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.amount || !form.next_date) return toast.error('Amount and next date required');
    await req('POST', '/recurring-expenses', form);
    toast.success('Recurring expense added'); setOpen(false); load();
  };

  const toggle = async (r: any) => { await req('PUT', `/recurring-expenses/${r.id}`, { is_active: r.is_active ? 0 : 1 }); load(); };

  if (!list.length && !open) return (
    <div className="border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Recurring Expenses</p>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 h-7 text-xs"><Plus className="h-3 w-3" /> Add</Button>
      </div>
      <p className="text-xs text-muted-foreground">No recurring expenses. Add rent, electricity, internet etc.</p>
      {open && renderDialog()}
    </div>
  );

  function renderDialog() {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Recurring Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Amount (₹)</Label><Input type="number" className="mt-1 h-9" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
              <div><Label className="text-xs">Frequency</Label>
                <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">First Date</Label><Input type="date" className="mt-1 h-9" value={form.next_date} onChange={e => setForm(f => ({ ...f, next_date: e.target.value }))} /></div>
            <div><Label className="text-xs">Description</Label><Input className="mt-1 h-9" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Shop rent" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" /> Recurring Expenses</p>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1 h-7 text-xs"><Plus className="h-3 w-3" /> Add</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/30"><tr>
          <th className="text-left p-3 text-xs">Category</th>
          <th className="text-right p-3 text-xs">Amount</th>
          <th className="text-left p-3 text-xs">Frequency</th>
          <th className="text-left p-3 text-xs">Next Date</th>
          <th className="text-left p-3 text-xs">Last Run</th>
          <th className="text-center p-3 text-xs">Active</th>
        </tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.id} className={`border-t hover:bg-muted/20 ${!r.is_active ? 'opacity-50' : ''}`}>
              <td className="p-3 font-medium">{r.category}<br/><span className="text-xs text-muted-foreground">{r.description}</span></td>
              <td className="p-3 text-right font-bold">₹{(r.amount || 0).toLocaleString('en-IN')}</td>
              <td className="p-3 capitalize text-sm">{r.frequency}</td>
              <td className="p-3 text-sm">{r.next_date}</td>
              <td className="p-3 text-sm text-muted-foreground">{r.last_generated || '—'}</td>
              <td className="p-3 text-center"><Switch checked={!!r.is_active} onCheckedChange={() => toggle(r)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {renderDialog()}
    </div>
  );
}
