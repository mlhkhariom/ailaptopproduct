import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import BranchSelector from "@/components/BranchSelector";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

export default function AdminShifts() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', start_time: '09:00', end_time: '18:00', branch_id: '' });

  const load = async () => {
    const [s, st] = await Promise.all([req('GET', '/shifts'), req('GET', '/staff?include_inactive=0')]);
    setShifts(Array.isArray(s) ? s : []);
    setStaff(Array.isArray(st) ? st : []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.start_time || !form.end_time) return toast.error('All fields required');
    await req('POST', '/shifts', form);
    toast.success('Shift created'); setOpen(false); load();
  };

  const del = async (id: string) => { await req('DELETE', `/shifts/${id}`, {}); load(); };

  const assignShift = async (staffId: string, shiftId: string) => {
    await req('PATCH', `/staff/${staffId}/shift`, { shift_id: shiftId || null });
    toast.success('Shift assigned'); load();
  };

  const getHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  };

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Shift Management</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
            <Button size="sm" onClick={() => { setForm({ name: '', start_time: '09:00', end_time: '18:00', branch_id: '' }); setOpen(true); }} className="gap-1.5"><Plus className="h-4 w-4" /> New Shift</Button>
          </div>
        </div>

        {/* Shifts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {shifts.map(s => (
            <div key={s.id} className="border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold">{s.name}</p>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => del(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">{s.start_time}</span>
                <span className="text-muted-foreground">→</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">{s.end_time}</span>
                <span className="text-xs text-muted-foreground ml-auto">{getHours(s.start_time, s.end_time)}h</span>
              </div>
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground mb-1">Staff on this shift:</p>
                <div className="flex flex-wrap gap-1">
                  {staff.filter(st => st.shift_id === s.id).map(st => (
                    <span key={st.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{st.name}</span>
                  ))}
                  {!staff.filter(st => st.shift_id === s.id).length && <span className="text-xs text-muted-foreground">No staff assigned</span>}
                </div>
              </div>
            </div>
          ))}
          {!shifts.length && <p className="text-muted-foreground col-span-3 text-center py-10">No shifts created yet. Add Morning/Evening shifts.</p>}
        </div>

        {/* Staff Assignment */}
        {shifts.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2"><p className="text-sm font-semibold">Assign Shifts to Staff</p></div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left p-3 text-xs">Staff</th>
                <th className="text-left p-3 text-xs">Role</th>
                <th className="text-left p-3 text-xs">Current Shift</th>
                <th className="text-center p-3 text-xs">Change</th>
              </tr></thead>
              <tbody>
                {staff.map(st => (
                  <tr key={st.id} className="border-t hover:bg-muted/20">
                    <td className="p-3 font-medium">{st.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{st.role}</td>
                    <td className="p-3 text-sm">{shifts.find(s => s.id === st.shift_id)?.name || <span className="text-muted-foreground">Unassigned</span>}</td>
                    <td className="p-3 text-center">
                      <select className="text-xs border rounded px-2 py-1" value={st.shift_id || ''} onChange={e => assignShift(st.id, e.target.value)}>
                        <option value="">No Shift</option>
                        {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time}-{s.end_time})</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>New Shift</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Shift Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Morning Shift" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Start Time *</Label><Input type="time" className="mt-1 h-9" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} /></div>
                <div><Label className="text-xs">End Time *</Label><Input type="time" className="mt-1 h-9" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Branch (optional)</Label><BranchSelector value={form.branch_id || 'all'} onChange={v => setForm(f => ({ ...f, branch_id: v === 'all' ? '' : v }))} allLabel="All Branches" className="mt-1 w-full" /></div>
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
