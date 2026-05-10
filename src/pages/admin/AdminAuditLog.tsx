import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, RefreshCw } from "lucide-react";

const req = (path: string) =>
  fetch(`/api/erp${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json()).catch(() => []);

const MODULES = ['all','job_cards','billing','staff','inventory','crm','payroll','expenses'];
const ACTION_COLOR: Record<string, string> = {
  created: 'bg-green-100 text-green-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
  status_changed: 'bg-orange-100 text-orange-700',
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [module, setModule] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (module !== 'all') params.set('module', module);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('limit', '200');
    const d = await req(`/audit-log?${params}`);
    setLogs(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [module]);

  const getActionColor = (action: string) => {
    const key = Object.keys(ACTION_COLOR).find(k => action?.includes(k));
    return key ? ACTION_COLOR[key] : 'bg-gray-100 text-gray-600';
  };

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Audit Log</h1>
          <div className="flex gap-2 flex-wrap">
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{MODULES.map(m => <SelectItem key={m} value={m} className="capitalize">{m === 'all' ? 'All Modules' : m.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" className="h-9 w-36" value={from} onChange={e => setFrom(e.target.value)} placeholder="From" />
            <Input type="date" className="h-9 w-36" value={to} onChange={e => setTo(e.target.value)} placeholder="To" />
            <Button size="sm" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs font-semibold">Time</th>
              <th className="text-left p-3 text-xs font-semibold">User</th>
              <th className="text-left p-3 text-xs font-semibold">Module</th>
              <th className="text-left p-3 text-xs font-semibold">Action</th>
              <th className="text-left p-3 text-xs font-semibold">Record ID</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t hover:bg-muted/20">
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-sm font-medium">{l.user_name || l.user_id || 'system'}</td>
                  <td className="p-3 text-xs capitalize">{l.module?.replace('_', ' ')}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getActionColor(l.action)}`}>{l.action}</span></td>
                  <td className="p-3 text-xs font-mono text-muted-foreground truncate max-w-[120px]">{l.record_id || '—'}</td>
                </tr>
              ))}
              {!logs.length && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No audit logs yet. Actions will appear here as users make changes.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </ERPLayout>
  );
}
