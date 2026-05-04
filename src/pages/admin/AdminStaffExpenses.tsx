import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, ...(body ? { body: JSON.stringify(body) } : {}) }).then(r => r.json());

const CATEGORIES = ['Rent', 'Salary', 'Electricity', 'Internet', 'Supplies', 'Marketing', 'Transport', 'Maintenance', 'Other'];

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: '', amount: 0, description: '', payment_method: 'cash', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  const load = async () => { setLoading(true); const d = await req('GET', '/expenses'); setExpenses(Array.isArray(d) ? d : []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.category || !form.amount) return toast.error('Category and amount required');
    await req('POST', '/expenses', form);
    toast.success('Expense added!'); setOpen(false); load();
  };

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const thisMonth = expenses.filter(e => e.date?.startsWith(new Date().toISOString().slice(0,7))).reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Expenses</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Expense</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">This Month</p><p className="text-2xl font-black text-red-600">₹{thisMonth.toLocaleString('en-IN')}</p></div>
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-black">₹{total.toLocaleString('en-IN')}</p></div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs">Date</th>
              <th className="text-left p-3 text-xs">Category</th>
              <th className="text-left p-3 text-xs">Description</th>
              <th className="text-left p-3 text-xs">Method</th>
              <th className="text-right p-3 text-xs">Amount</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 text-xs">{e.date}</td>
                  <td className="p-3 text-xs font-medium">{e.category}</td>
                  <td className="p-3 text-xs text-muted-foreground">{e.description}</td>
                  <td className="p-3 text-xs">{e.payment_method}</td>
                  <td className="p-3 text-right text-xs font-bold text-red-600">₹{(e.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3"><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={async () => { await req('DELETE', `/expenses/${e.id}`); load(); }}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                </tr>
              ))}
              {!expenses.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">No expenses yet</td></tr>}
            </tbody>
          </table>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Amount (₹) *</Label><Input type="number" className="mt-1 h-9" value={form.amount || ''} onChange={e => setForm(f => ({...f, amount: Number(e.target.value)}))} /></div>
              <div><Label className="text-xs">Description</Label><Input className="mt-1 h-9" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Payment Method</Label>
                  <Select value={form.payment_method} onValueChange={v => setForm(f => ({...f, payment_method: v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="bank">Bank</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Date</Label><Input type="date" className="mt-1 h-9" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
