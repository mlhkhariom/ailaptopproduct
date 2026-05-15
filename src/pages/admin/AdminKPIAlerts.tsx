import { useState, useEffect } from "react";
import ERPLayout from "@/components/layout/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const METRICS = [
  { value: 'daily_revenue', label: 'Daily Revenue (₹)' },
  { value: 'monthly_revenue', label: 'Monthly Revenue (₹)' },
  { value: 'pending_jobs', label: 'Pending Jobs (count)' },
  { value: 'sla_breached', label: 'SLA Breached Jobs (count)' },
];

export default function AdminKPIAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ metric: 'daily_revenue', operator: 'lt', threshold: 0, message: '' });

  const load = async () => { const d = await req('GET', '/kpi-alerts/config'); setAlerts(Array.isArray(d) ? d : []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.threshold) return toast.error('Threshold required');
    await req('POST', '/kpi-alerts/config', form);
    toast.success('Alert created'); setOpen(false); load();
  };

  const del = async (id: string) => { await req('DELETE', `/kpi-alerts/config/${id}`, {}); load(); };

  const checkNow = async () => {
    const res = await req('POST', '/kpi-alerts/check', {});
    toast.success(`Checked ${res.checked} alerts, fired ${res.fired}`);
  };

  const metricLabel = (m: string) => METRICS.find(x => x.value === m)?.label || m;

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> KPI Alerts</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={checkNow} className="gap-1.5"><Play className="h-4 w-4" /> Check Now</Button>
            <Button size="sm" onClick={() => { setForm({ metric: 'daily_revenue', operator: 'lt', threshold: 0, message: '' }); setOpen(true); }} className="gap-1.5"><Plus className="h-4 w-4" /> New Alert</Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">Alerts send WhatsApp to owner when KPI threshold is crossed. Set OWNER_PHONE in backend .env to enable.</p>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs font-semibold">Metric</th>
              <th className="text-center p-3 text-xs font-semibold">Condition</th>
              <th className="text-left p-3 text-xs font-semibold">Message</th>
              <th className="text-center p-3 text-xs font-semibold">Delete</th>
            </tr></thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{metricLabel(a.metric)}</td>
                  <td className="p-3 text-center"><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{a.operator === 'lt' ? '<' : a.operator === 'gt' ? '>' : '='} {a.threshold}</span></td>
                  <td className="p-3 text-sm text-muted-foreground truncate max-w-xs">{a.message || '(default message)'}</td>
                  <td className="p-3 text-center"><Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => del(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                </tr>
              ))}
              {!alerts.length && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">No alerts configured</td></tr>}
            </tbody>
          </table>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>New KPI Alert</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Metric</Label>
                <Select value={form.metric} onValueChange={v => setForm(f => ({ ...f, metric: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{METRICS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Condition</Label>
                  <Select value={form.operator} onValueChange={v => setForm(f => ({ ...f, operator: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lt">Less than (&lt;)</SelectItem>
                      <SelectItem value="gt">Greater than (&gt;)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Threshold</Label><Input type="number" className="mt-1 h-9" value={form.threshold || ''} onChange={e => setForm(f => ({ ...f, threshold: Number(e.target.value) }))} /></div>
              </div>
              <div><Label className="text-xs">Custom Message (optional)</Label><Input className="mt-1 h-9" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Leave blank for default" /></div>
              <p className="text-xs text-muted-foreground">Example: Daily Revenue &lt; ₹5000 → WhatsApp alert to owner</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Create Alert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
