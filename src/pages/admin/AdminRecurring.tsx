import { useState, useEffect } from "react";
import ERPLayout from "@/components/layout/ERPLayout";
import BranchSelector from "@/components/BranchSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Plus, Calendar, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const emptyForm = {
  customer_name: '', customer_phone: '', customer_email: '',
  items: [{ name: '', qty: 1, price: 0 }],
  discount: 0, notes: '', payment_method: 'cash',
  frequency: 'monthly', next_date: new Date().toISOString().split('T')[0],
};

export default function AdminRecurring() {
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [branchFilter, setBranchFilter] = useState('all');

  const load = async () => { setLoading(true); const d = await req('GET', '/recurring'); setList(Array.isArray(d) ? d : []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.customer_name || !form.next_date) return toast.error('Customer name and next date required');
    const subtotal = form.items.reduce((s: number, i: any) => s + (i.price * i.qty), 0);
    await req('POST', '/recurring', { ...form, subtotal, total: subtotal - (form.discount || 0) });
    toast.success('Recurring invoice created!'); setOpen(false); load();
  };

  const toggle = async (r: any) => {
    await req('PUT', `/recurring/${r.id}`, { ...r, is_active: r.is_active ? 0 : 1 });
    load();
  };

  const processNow = async () => {
    const res = await req('POST', '/recurring/process', {});
    toast.success(`Processed ${res.processed} invoices`); load();
  };

  const subtotal = form.items?.reduce((s: number, i: any) => s + ((i.price || 0) * (i.qty || 1)), 0) || 0;

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Recurring Invoices</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={processNow} className="gap-1.5"><Play className="h-4 w-4" /> Process Due</Button>
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={() => { setForm(emptyForm); setOpen(true); }} className="gap-1.5"><Plus className="h-4 w-4" /> New</Button>
          </div>
        </div>

        <BranchSelector value={branchFilter} onChange={setBranchFilter} className="w-44" />
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs font-semibold">Customer</th>
              <th className="text-left p-3 text-xs font-semibold">Frequency</th>
              <th className="text-right p-3 text-xs font-semibold">Amount</th>
              <th className="text-left p-3 text-xs font-semibold">Next Date</th>
              <th className="text-left p-3 text-xs font-semibold">Last Generated</th>
              <th className="text-center p-3 text-xs font-semibold">Active</th>
            </tr></thead>
            <tbody>
              {list.filter((r: any) => branchFilter === 'all' || r.branch_id === branchFilter).map(r => {
                const overdue = new Date(r.next_date) <= new Date();
                return (
                  <tr key={r.id} className={`border-t hover:bg-muted/30 ${overdue && r.is_active ? 'bg-orange-50/50' : ''}`}>
                    <td className="p-3"><p className="font-medium">{r.customer_name}</p><p className="text-xs text-muted-foreground">{r.customer_phone}</p></td>
                    <td className="p-3 capitalize text-sm">{r.frequency}</td>
                    <td className="p-3 text-right font-bold">₹{(r.total || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-sm">
                      <span className={overdue && r.is_active ? 'text-orange-600 font-bold' : ''}>{r.next_date}</span>
                      {overdue && r.is_active && <span className="text-[10px] text-orange-600 ml-1">Due!</span>}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{r.last_generated || '—'}</td>
                    <td className="p-3 text-center"><Switch checked={!!r.is_active} onCheckedChange={() => toggle(r)} /></td>
                  </tr>
                );
              })}
              {!list.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No recurring invoices yet</td></tr>}
            </tbody>
          </table>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Recurring Invoice</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Customer Name *</Label><Input className="mt-1 h-9" value={form.customer_name} onChange={e => setForm((f: any) => ({ ...f, customer_name: e.target.value }))} /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.customer_phone} onChange={e => setForm((f: any) => ({ ...f, customer_phone: e.target.value }))} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Items</Label>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setForm((f: any) => ({ ...f, items: [...f.items, { name: '', qty: 1, price: 0 }] }))}>+ Add</Button>
                </div>
                {form.items?.map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 gap-1 mb-1">
                    <Input className="col-span-6 h-8 text-xs" placeholder="Item" value={item.name} onChange={e => { const items = [...form.items]; items[i].name = e.target.value; setForm((f: any) => ({ ...f, items })); }} />
                    <Input type="number" className="col-span-2 h-8 text-xs" value={item.qty} onChange={e => { const items = [...form.items]; items[i].qty = Number(e.target.value); setForm((f: any) => ({ ...f, items })); }} />
                    <Input type="number" className="col-span-3 h-8 text-xs" placeholder="Price" value={item.price || ''} onChange={e => { const items = [...form.items]; items[i].price = Number(e.target.value); setForm((f: any) => ({ ...f, items })); }} />
                    <span className="col-span-1 text-xs flex items-center justify-end font-medium">₹{((item.qty || 1) * (item.price || 0)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <p className="text-sm font-black text-right mt-1">Total: ₹{subtotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Frequency</Label>
                  <Select value={form.frequency} onValueChange={v => setForm((f: any) => ({ ...f, frequency: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">First Invoice Date *</Label><Input type="date" className="mt-1 h-9" value={form.next_date} onChange={e => setForm((f: any) => ({ ...f, next_date: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Input className="mt-1 h-9" value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
