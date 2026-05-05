import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, RefreshCw, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const STATUS_CFG = {
  present:  { label: 'Present',  icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-100' },
  absent:   { label: 'Absent',   icon: XCircle,     color: 'text-red-600',    bg: 'bg-red-100' },
  half_day: { label: 'Half Day', icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-100' },
  leave:    { label: 'Leave',    icon: Calendar,    color: 'text-blue-600',   bg: 'bg-blue-100' },
};

export default function AdminAttendance() {
  const [staff, setStaff] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [view, setView] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, a, st] = await Promise.all([
      req('GET', '/staff'),
      req('GET', `/attendance?date=${date}`),
      req('GET', `/attendance/stats?month=${month}`),
    ]);
    setStaff(Array.isArray(s) ? s : []);
    setAttendance(Array.isArray(a) ? a : []);
    setStats(Array.isArray(st) ? st : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [date, month]);

  const mark = async (staffId: string, status: string) => {
    await req('POST', '/attendance', { staff_id: staffId, date, status });
    toast.success('Marked!'); load();
  };

  const getStatus = (staffId: string) => attendance.find(a => a.staff_id === staffId)?.status || 'absent';

  const presentCount = staff.filter(s => getStatus(s.id) === 'present').length;

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" /> Attendance</h1>
          <div className="flex gap-2 items-center">
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setView('daily')} className={`px-3 py-1.5 text-xs font-medium ${view === 'daily' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Daily</button>
              <button onClick={() => setView('monthly')} className={`px-3 py-1.5 text-xs font-medium ${view === 'monthly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Monthly</button>
            </div>
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
          </div>
        </div>

        {view === 'daily' ? (
          <>
            <div className="flex gap-3 items-center flex-wrap">
              <Input type="date" className="h-9 w-40 text-sm" value={date} onChange={e => setDate(e.target.value)} />
              <div className="flex gap-3">
                {[
                  { label: 'Present', value: presentCount, color: 'text-green-600' },
                  { label: 'Absent', value: staff.length - presentCount, color: 'text-red-600' },
                  { label: 'Total', value: staff.length, color: 'text-foreground' },
                ].map(k => (
                  <div key={k.label} className="border rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {staff.map(s => {
                const status = getStatus(s.id);
                const cfg = STATUS_CFG[status as keyof typeof STATUS_CFG] || STATUS_CFG.absent;
                const Icon = cfg.icon;
                return (
                  <div key={s.id} className="border rounded-xl p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.role || 'Staff'}</p>
                    </div>
                    <Select value={status} onValueChange={v => mark(s.id, v)}>
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                        <SelectItem value="leave">Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
              {!staff.length && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No staff added yet</p>}
            </div>
          </>
        ) : (
          <>
            <Input type="month" className="h-9 w-40 text-sm" value={month} onChange={e => setMonth(e.target.value)} />
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold">Staff</th>
                    <th className="text-center p-3 text-xs font-semibold text-green-600">Present</th>
                    <th className="text-center p-3 text-xs font-semibold text-red-600">Absent</th>
                    <th className="text-center p-3 text-xs font-semibold text-yellow-600">Half Day</th>
                    <th className="text-center p-3 text-xs font-semibold text-blue-600">Leave</th>
                    <th className="text-center p-3 text-xs font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(s => {
                    const total = s.present + s.absent + s.half_day + s.leave;
                    const pct = total ? Math.round(((s.present + s.half_day * 0.5) / total) * 100) : 0;
                    return (
                      <tr key={s.id} className="border-t hover:bg-muted/30">
                        <td className="p-3"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.role}</p></td>
                        <td className="p-3 text-center font-bold text-green-600">{s.present}</td>
                        <td className="p-3 text-center font-bold text-red-600">{s.absent}</td>
                        <td className="p-3 text-center font-bold text-yellow-600">{s.half_day}</td>
                        <td className="p-3 text-center font-bold text-blue-600">{s.leave}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 bg-muted rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!stats.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No data</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ERPLayout>
  );
}
