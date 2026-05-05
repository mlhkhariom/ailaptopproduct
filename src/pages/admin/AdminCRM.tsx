import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash2, RefreshCw, Search, Phone, MessageCircle, ClipboardList, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  interested: 'bg-yellow-100 text-yellow-700',
  negotiating: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};
const SOURCES = ['WhatsApp', 'Walk-in', 'Phone', 'Instagram', 'Facebook', 'Referral', 'Website', 'JustDial', 'Google'];

const emptyForm = {
  name: '', phone: '', email: '', source: 'WhatsApp',
  interest: '', budget: 0, status: 'new', priority: 'normal',
  assigned_to: '', notes: '', next_followup: '',
};

export default function AdminCRM() {
  const [leads, setLeads] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followupOpen, setFollowupOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [fuForm, setFuForm] = useState({ type: 'call', notes: '', outcome: '', next_date: '' });
  const [convertForm, setConvertForm] = useState({ device_brand: '', device_model: '', issue_description: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [d, s] = await Promise.all([
      req('GET', `/leads?status=${statusFilter}`),
      req('GET', '/staff'),
    ]);
    setLeads(Array.isArray(d) ? d : []);
    setStaff(Array.isArray(s) ? s : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [statusFilter]);

  const filtered = leads.filter(l =>
    (!search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.interest?.toLowerCase().includes(search.toLowerCase())) &&
    (sourceFilter === 'all' || l.source === sourceFilter)
  );

  // Pipeline counts
  const counts: Record<string, number> = { all: leads.length };
  leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });

  // Won revenue
  const wonRevenue = leads.filter(l => l.status === 'won').reduce((s, l) => s + (l.budget || 0), 0);

  const save = async () => {
    if (!form.name) return toast.error('Name required');
    try {
      if (editingId) await req('PUT', `/leads/${editingId}`, form);
      else await req('POST', '/leads', form);
      toast.success('Lead saved!'); setDialogOpen(false); load();
    } catch { toast.error('Failed to save'); }
  };

  const openFollowup = async (lead: any) => {
    setSelectedLead(lead);
    const d = await req('GET', `/leads/${lead.id}/followups`);
    setFollowups(Array.isArray(d) ? d : []);
    setFuForm({ type: 'call', notes: '', outcome: '', next_date: '' });
    setFollowupOpen(true);
  };

  const saveFollowup = async () => {
    if (!fuForm.notes) return toast.error('Notes required');
    await req('POST', `/leads/${selectedLead.id}/followups`, fuForm);
    toast.success('Follow-up added!');
    const d = await req('GET', `/leads/${selectedLead.id}/followups`);
    setFollowups(Array.isArray(d) ? d : []);
    // Update lead status if outcome provided
    if (fuForm.next_date) load();
  };

  // Convert lead → Job Card
  const openConvert = (lead: any) => {
    setSelectedLead(lead);
    setConvertForm({ device_brand: '', device_model: '', issue_description: lead.interest || '', priority: 'normal' });
    setConvertOpen(true);
  };

  const convertToJobCard = async () => {
    try {
      const res = await req('POST', '/job-cards', {
        customer_name: selectedLead.name,
        customer_phone: selectedLead.phone,
        customer_email: selectedLead.email || '',
        service_name: 'General Repair',
        ...convertForm,
        technician: selectedLead.assigned_to || '',
      });
      // Mark lead as won
      await req('PUT', `/leads/${selectedLead.id}`, { ...selectedLead, status: 'won' });
      toast.success(`Job Card ${res.booking_number} created!`);
      setConvertOpen(false); load();
    } catch { toast.error('Failed to convert'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await req('DELETE', `/leads/${id}`); toast.success('Deleted'); load();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Sales CRM
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" onClick={() => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Lead
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Total Leads</p><p className="text-2xl font-black">{leads.length}</p></div>
          <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Won</p><p className="text-2xl font-black text-green-600">{counts.won || 0}</p></div>
          <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Won Revenue</p><p className="text-xl font-black text-green-600">₹{wonRevenue.toLocaleString('en-IN')}</p></div>
          <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Overdue Follow-ups</p>
            <p className="text-2xl font-black text-red-600">
              {leads.filter(l => l.next_followup && new Date(l.next_followup) < new Date() && l.status !== 'won' && l.status !== 'lost').length}
            </p>
          </div>
        </div>

        {/* Pipeline tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'contacted', 'interested', 'negotiating', 'won', 'lost'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
              {s} {counts[s] ? `(${counts[s]})` : '(0)'}
            </button>
          ))}
        </div>

        {/* Search + Source filter */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, phone, interest..." className="pl-8 h-8 text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs">Name</th>
                <th className="text-left p-3 text-xs">Interest / Budget</th>
                <th className="text-left p-3 text-xs">Source</th>
                <th className="text-left p-3 text-xs">Assigned To</th>
                <th className="text-center p-3 text-xs">Status</th>
                <th className="text-left p-3 text-xs">Next Follow-up</th>
                <th className="text-center p-3 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const overdue = l.next_followup && new Date(l.next_followup) < new Date() && l.status !== 'won' && l.status !== 'lost';
                return (
                  <tr key={l.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <p className="text-xs font-medium">{l.name}</p>
                      <p className="text-[10px] text-muted-foreground">{l.phone}</p>
                    </td>
                    <td className="p-3 text-xs">
                      <p>{l.interest || '—'}</p>
                      {l.budget > 0 && <p className="text-[10px] text-green-600 font-medium">₹{Number(l.budget).toLocaleString('en-IN')}</p>}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{l.source}</td>
                    <td className="p-3 text-xs">{l.assigned_to || '—'}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[l.status] || 'bg-gray-100 text-gray-700'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {l.next_followup
                        ? <span className={overdue ? 'text-red-600 font-bold' : ''}>{overdue ? '⚠️ ' : ''}{l.next_followup}</span>
                        : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-center">
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Follow-up" onClick={() => openFollowup(l)}>
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600" title="Convert to Job Card" onClick={() => openConvert(l)}>
                          <ClipboardList className="h-3.5 w-3.5" />
                        </Button>
                        <a href={`https://wa.me/91${l.phone?.replace(/\D/g, '')}?text=Namaste ${l.name}! AI Laptop Wala se bol raha hoon.${l.interest ? ` Aapne ${l.interest} ke baare mein poochha tha.` : ''} Kya aap available hain?`}
                          target="_blank" rel="noreferrer">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title="WhatsApp">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          </Button>
                        </a>
                        <a href={`tel:${l.phone}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Phone className="h-3.5 w-3.5" /></Button>
                        </a>
                        <Button size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => { setForm({ ...emptyForm, ...l }); setEditingId(l.id); setDialogOpen(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(l.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground text-xs">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Lead Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Lead</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
              <div><Label className="text-xs">Interest</Label><Input className="mt-1 h-9" value={form.interest} onChange={e => setForm((f: any) => ({ ...f, interest: e.target.value }))} placeholder="Dell laptop, Screen repair..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Budget (₹)</Label><Input type="number" className="mt-1 h-9" value={form.budget || ''} onChange={e => setForm((f: any) => ({ ...f, budget: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Source</Label>
                  <Select value={form.source} onValueChange={v => setForm((f: any) => ({ ...f, source: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['new', 'contacted', 'interested', 'negotiating', 'won', 'lost'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm((f: any) => ({ ...f, priority: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="normal">🔵 Normal</SelectItem>
                      <SelectItem value="high">🔴 High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Assigned To</Label>
                <Select value={form.assigned_to || '__none'} onValueChange={v => setForm((f: any) => ({ ...f, assigned_to: v === '__none' ? '' : v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Assign staff" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Unassigned</SelectItem>
                    {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name} ({s.role})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Next Follow-up</Label><Input type="date" className="mt-1 h-9" value={form.next_followup} onChange={e => setForm((f: any) => ({ ...f, next_followup: e.target.value }))} /></div>
              <div><Label className="text-xs">Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>💾 Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Follow-up Dialog */}
        <Dialog open={followupOpen} onOpenChange={setFollowupOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Follow-ups — {selectedLead?.name}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Type</Label>
                  <Select value={fuForm.type} onValueChange={v => setFuForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">📞 Call</SelectItem>
                      <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                      <SelectItem value="visit">🏪 Visit</SelectItem>
                      <SelectItem value="email">📧 Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Next Follow-up</Label>
                  <Input type="date" className="mt-1 h-9" value={fuForm.next_date} onChange={e => setFuForm(f => ({ ...f, next_date: e.target.value }))} />
                </div>
              </div>
              <div><Label className="text-xs">Notes *</Label><Textarea className="mt-1" rows={2} value={fuForm.notes} onChange={e => setFuForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div><Label className="text-xs">Outcome</Label><Input className="mt-1 h-9" value={fuForm.outcome} onChange={e => setFuForm(f => ({ ...f, outcome: e.target.value }))} placeholder="Interested, Will visit tomorrow..." /></div>
              <Button className="w-full" onClick={saveFollowup}>Add Follow-up</Button>
              {followups.length > 0 && (
                <div className="border-t pt-3 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold">History ({followups.length})</p>
                  {followups.map(f => (
                    <div key={f.id} className="text-xs bg-muted/50 rounded p-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{f.type}</span>
                        <span className="text-muted-foreground">{new Date(f.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {f.notes && <p className="text-muted-foreground mt-0.5">{f.notes}</p>}
                      {f.outcome && <p className="text-green-600 mt-0.5 font-medium">→ {f.outcome}</p>}
                      {f.next_date && <p className="text-blue-600 mt-0.5">📅 Next: {f.next_date}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Convert to Job Card Dialog */}
        <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Convert to Job Card — {selectedLead?.name}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                <p><strong>Customer:</strong> {selectedLead?.name}</p>
                <p><strong>Phone:</strong> {selectedLead?.phone}</p>
                <p><strong>Interest:</strong> {selectedLead?.interest || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Device Brand</Label><Input className="mt-1 h-9" value={convertForm.device_brand} onChange={e => setConvertForm(f => ({ ...f, device_brand: e.target.value }))} placeholder="Dell, HP..." /></div>
                <div><Label className="text-xs">Device Model</Label><Input className="mt-1 h-9" value={convertForm.device_model} onChange={e => setConvertForm(f => ({ ...f, device_model: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Issue Description</Label>
                <Textarea className="mt-1" rows={2} value={convertForm.issue_description} onChange={e => setConvertForm(f => ({ ...f, issue_description: e.target.value }))} />
              </div>
              <div><Label className="text-xs">Priority</Label>
                <Select value={convertForm.priority} onValueChange={v => setConvertForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="normal">🔵 Normal</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Lead will be marked as <strong>Won</strong> after conversion.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
              <Button onClick={convertToJobCard}><ClipboardList className="h-4 w-4 mr-1" /> Create Job Card</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
