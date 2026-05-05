import { useState, useEffect, useRef } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Plus, Edit, Trash2, RefreshCw, Search, Phone, MessageCircle, ClipboardList, TrendingUp, Download, LayoutGrid, List, BarChart3, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { toast } from "sonner";
import CRMKanban from "@/components/CRMKanban";
import CRMLeadDetail from "@/components/CRMLeadDetail";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700', contacted: 'bg-blue-100 text-blue-700',
  interested: 'bg-yellow-100 text-yellow-700', negotiating: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700',
};
const SOURCES = ['WhatsApp', 'Walk-in', 'Phone', 'Instagram', 'Facebook', 'Referral', 'Website', 'JustDial', 'Google'];

const emptyForm = {
  name: '', phone: '', email: '', source: 'WhatsApp',
  interest: '', budget: 0, deal_value: 0, status: 'new', priority: 'normal',
  assigned_to: '', notes: '', next_followup: '', expected_close: '',
};

export default function AdminCRM() {
  const [leads, setLeads] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [convertForm, setConvertForm] = useState({ device_brand: '', device_model: '', issue_description: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [d, s, a] = await Promise.all([
      req('GET', `/leads?status=${statusFilter}`),
      req('GET', '/staff'),
      req('GET', '/leads/analytics'),
    ]);
    setLeads(Array.isArray(d) ? d : []);
    setStaff(Array.isArray(s) ? s : []);
    setAnalytics(a || {});
    setLoading(false);
  };
  useEffect(() => { load(); }, [statusFilter]);

  const filtered = leads.filter(l =>
    (!search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search) || l.interest?.toLowerCase().includes(search.toLowerCase())) &&
    (sourceFilter === 'all' || l.source === sourceFilter)
  );

  const counts: Record<string, number> = { all: leads.length };
  leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });

  const save = async () => {
    if (!form.name) return toast.error('Name required');
    try {
      if (editingId) await req('PUT', `/leads/${editingId}`, form);
      else await req('POST', '/leads', form);
      toast.success('Lead saved!'); setDialogOpen(false); load();
    } catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await req('PATCH', `/leads/${id}/status`, { status });
    load();
  };

  const openDetail = (lead: any) => { setSelectedLead(lead); setDetailOpen(true); };

  const openConvert = (lead: any) => {
    setSelectedLead(lead);
    setConvertForm({ device_brand: '', device_model: '', issue_description: lead.interest || '', priority: 'normal' });
    setConvertOpen(true);
  };

  const convertToJobCard = async () => {
    try {
      const res = await req('POST', '/job-cards', {
        customer_name: selectedLead.name, customer_phone: selectedLead.phone,
        customer_email: selectedLead.email || '', service_name: 'General Repair',
        ...convertForm, technician: selectedLead.assigned_to || '',
      });
      await req('PATCH', `/leads/${selectedLead.id}/status`, { status: 'won' });
      toast.success(`Job Card ${res.booking_number} created!`);
      setConvertOpen(false); load();
    } catch { toast.error('Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await req('DELETE', `/leads/${id}`); load();
  };

  const exportCSV = () => {
    const rows = [['Name','Phone','Email','Source','Interest','Budget','Status','Priority','Assigned','Next Followup']];
    filtered.forEach(l => rows.push([l.name,l.phone,l.email,l.source,l.interest,l.budget,l.status,l.priority,l.assigned_to,l.next_followup]));
    const csv = rows.map(r => r.map(c => `"${c||''}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'leads.csv'; a.click();
  };

  const sf = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <ERPLayout onAction={() => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }}>
      <div className="space-y-5 max-w-7xl mx-auto">

        <Tabs defaultValue="dashboard">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <TabsList className="h-9">
              <TabsTrigger value="dashboard" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Dashboard</TabsTrigger>
              <TabsTrigger value="kanban" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> Pipeline</TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5"><List className="h-3.5 w-3.5" /> List</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 h-8 text-xs"><Download className="h-3.5 w-3.5" /> Export</Button>
              <Button size="sm" variant="outline" onClick={load} disabled={loading} className="h-8"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
              <Button size="sm" className="h-8" onClick={() => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Lead</Button>
            </div>
          </div>

          {/* ── DASHBOARD TAB ── */}
          <TabsContent value="dashboard" className="space-y-5">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Total Leads', value: analytics.total || 0, color: 'text-foreground', icon: Users },
                { label: 'Pipeline Value', value: `₹${(analytics.pipelineValue || 0).toLocaleString('en-IN')}`, color: 'text-blue-600', icon: Target },
                { label: 'Won', value: analytics.byStatus?.won || 0, color: 'text-green-600', icon: CheckCircle },
                { label: 'Conversion Rate', value: `${analytics.conversionRate || 0}%`, color: 'text-primary', icon: TrendingUp },
                { label: 'Overdue', value: analytics.overdue?.length || 0, color: 'text-red-600', icon: AlertTriangle },
              ].map(k => (
                <Card key={k.label}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{k.label}</p>
                        <p className={`text-2xl font-black mt-0.5 ${k.color}`}>{k.value}</p>
                      </div>
                      <k.icon className={`h-8 w-8 opacity-15 ${k.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Overdue Follow-ups */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Overdue Follow-ups</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {(analytics.overdue || []).length === 0
                    ? <p className="text-xs text-muted-foreground text-center py-6">All caught up!</p>
                    : (analytics.overdue || []).map((l: any) => (
                      <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 border-t first:border-t-0 hover:bg-muted/30 cursor-pointer" onClick={() => openDetail(l)}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{l.name}</p>
                          <p className="text-xs text-red-600">{l.next_followup}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                      </div>
                    ))
                  }
                </CardContent>
              </Card>

              {/* Source Performance */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Source Performance</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {(analytics.bySource || []).slice(0, 6).map((s: any) => (
                    <div key={s.source} className="flex items-center gap-2">
                      <span className="text-xs w-20 shrink-0 truncate">{s.source}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (s.count / (analytics.total || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{s.count}</span>
                      <span className="text-xs text-green-600 w-8 text-right">{s.won}W</span>
                    </div>
                  ))}
                  {!(analytics.bySource || []).length && <p className="text-xs text-muted-foreground text-center py-4">No data</p>}
                </CardContent>
              </Card>

              {/* Staff Leaderboard */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Staff Leaderboard</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {(analytics.byStaff || []).length === 0
                    ? <p className="text-xs text-muted-foreground text-center py-6">No assigned leads</p>
                    : (analytics.byStaff || []).map((s: any, i: number) => (
                      <div key={s.assigned_to} className="flex items-center gap-3 px-4 py-2.5 border-t first:border-t-0">
                        <span className="text-sm font-black text-muted-foreground w-5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.assigned_to}</p>
                          <p className="text-xs text-muted-foreground">{s.total} leads · {s.won} won</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">{s.total ? Math.round((s.won / s.total) * 100) : 0}%</span>
                      </div>
                    ))
                  }
                </CardContent>
              </Card>
            </div>

            {/* Pipeline funnel */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pipeline Funnel</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 items-end h-24">
                  {['new','contacted','interested','negotiating','won'].map(s => {
                    const count = analytics.byStatus?.[s] || 0;
                    const max = Math.max(...['new','contacted','interested','negotiating','won'].map(k => analytics.byStatus?.[k] || 0), 1);
                    const pct = Math.max(10, (count / max) * 100);
                    return (
                      <div key={s} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold">{count}</span>
                        <div className={`w-full rounded-t-lg ${STATUS_COLORS[s]}`} style={{ height: `${pct}%` }} />
                        <span className="text-[10px] text-muted-foreground capitalize">{s}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── KANBAN TAB ── */}
          <TabsContent value="kanban">
            <CRMKanban leads={leads} onStatusChange={handleStatusChange} onOpenDetail={openDetail} onConvert={openConvert} />
          </TabsContent>

          {/* ── LIST TAB ── */}
          <TabsContent value="list" className="space-y-3">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search name, phone, interest..." className="pl-8 h-9"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-9 w-36 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Status pills */}
            <div className="flex gap-2 flex-wrap">
              {['all','new','contacted','interested','negotiating','won','lost'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
                  {s} ({counts[s] || 0})
                </button>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="border rounded-xl overflow-x-auto hidden md:block">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3.5 text-xs font-semibold">Name</th>
                    <th className="text-left p-3.5 text-xs font-semibold">Interest / Value</th>
                    <th className="text-left p-3.5 text-xs font-semibold">Source</th>
                    <th className="text-left p-3.5 text-xs font-semibold">Assigned</th>
                    <th className="text-center p-3.5 text-xs font-semibold">Status</th>
                    <th className="text-left p-3.5 text-xs font-semibold">Follow-up</th>
                    <th className="text-center p-3.5 text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => {
                    const overdue = l.next_followup && new Date(l.next_followup) < new Date() && !['won','lost'].includes(l.status);
                    return (
                      <tr key={l.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => openDetail(l)}>
                        <td className="p-3.5">
                          <p className="font-medium">{l.name}</p>
                          <p className="text-xs text-muted-foreground">{l.phone}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="text-sm">{l.interest || '—'}</p>
                          {(l.deal_value || l.budget) > 0 && <p className="text-xs text-green-600 font-medium">₹{(l.deal_value || l.budget).toLocaleString('en-IN')}</p>}
                        </td>
                        <td className="p-3.5 text-sm text-muted-foreground">{l.source}</td>
                        <td className="p-3.5 text-sm">{l.assigned_to || '—'}</td>
                        <td className="p-3.5 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                        </td>
                        <td className="p-3.5">
                          {l.next_followup
                            ? <span className={`text-sm ${overdue ? 'text-red-600 font-bold' : ''}`}>{overdue && <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />}{l.next_followup}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-3.5" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1 justify-center">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="Convert" onClick={() => openConvert(l)}><ClipboardList className="h-3.5 w-3.5" /></Button>
                            <a href={`https://wa.me/91${l.phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600"><MessageCircle className="h-3.5 w-3.5" /></Button>
                            </a>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setForm({ ...emptyForm, ...l }); setEditingId(l.id); setDialogOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => del(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filtered.length && <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No leads found</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
              {filtered.map(l => {
                const overdue = l.next_followup && new Date(l.next_followup) < new Date() && !['won','lost'].includes(l.status);
                return (
                  <div key={l.id} className="border rounded-xl p-4 bg-card space-y-2" onClick={() => openDetail(l)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{l.name}</p>
                        <p className="text-sm text-muted-foreground">{l.phone}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                    </div>
                    {l.interest && <p className="text-sm text-muted-foreground">{l.interest}</p>}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{l.source}</span>
                        {overdue && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{l.next_followup}</span>}
                      </div>
                      {(l.deal_value || l.budget) > 0 && <p className="text-sm font-bold text-green-600">₹{(l.deal_value || l.budget).toLocaleString('en-IN')}</p>}
                    </div>
                    <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1" onClick={() => openConvert(l)}><ClipboardList className="h-3.5 w-3.5" /> Job Card</Button>
                      <a href={`https://wa.me/91${l.phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1 text-green-600"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</Button>
                      </a>
                    </div>
                  </div>
                );
              })}
              {!filtered.length && <p className="text-center text-muted-foreground py-10">No leads found</p>}
            </div>
          </TabsContent>
        </Tabs>

        {/* Lead Detail Drawer */}
        <CRMLeadDetail lead={selectedLead} open={detailOpen} onClose={() => setDetailOpen(false)} onUpdate={load} staff={staff} onConvert={openConvert} />

        {/* Add/Edit Lead Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Lead</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => sf('name')(e.target.value)} /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.phone} onChange={e => sf('phone')(e.target.value)} /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={form.email} onChange={e => sf('email')(e.target.value)} /></div>
              <div><Label className="text-xs">Interest</Label><Input className="mt-1 h-9" value={form.interest} onChange={e => sf('interest')(e.target.value)} placeholder="Dell laptop, Screen repair..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Deal Value (₹)</Label><Input type="number" className="mt-1 h-9" value={form.deal_value || form.budget || ''} onChange={e => { sf('deal_value')(Number(e.target.value)); sf('budget')(Number(e.target.value)); }} /></div>
                <div><Label className="text-xs">Source</Label>
                  <Select value={form.source} onValueChange={sf('source')}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={sf('status')}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{['new','contacted','interested','negotiating','won','lost'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Priority</Label>
                  <Select value={form.priority} onValueChange={sf('priority')}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Assigned To</Label>
                  <Select value={form.assigned_to || '__none'} onValueChange={v => sf('assigned_to')(v === '__none' ? '' : v)}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Assign" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Unassigned</SelectItem>
                      {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Next Follow-up</Label><Input type="date" className="mt-1 h-9" value={form.next_followup} onChange={e => sf('next_followup')(e.target.value)} /></div>
                <div><Label className="text-xs">Expected Close</Label><Input type="date" className="mt-1 h-9" value={form.expected_close} onChange={e => sf('expected_close')(e.target.value)} /></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => sf('notes')(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save Lead</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert to Job Card */}
        <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Convert to Job Card</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p><strong>{selectedLead?.name}</strong> · {selectedLead?.phone}</p>
                {selectedLead?.interest && <p className="text-muted-foreground">{selectedLead.interest}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Device Brand</Label><Input className="mt-1 h-9" value={convertForm.device_brand} onChange={e => setConvertForm(f => ({ ...f, device_brand: e.target.value }))} /></div>
                <div><Label className="text-xs">Device Model</Label><Input className="mt-1 h-9" value={convertForm.device_model} onChange={e => setConvertForm(f => ({ ...f, device_model: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Issue</Label><Textarea className="mt-1" rows={2} value={convertForm.issue_description} onChange={e => setConvertForm(f => ({ ...f, issue_description: e.target.value }))} /></div>
              <div><Label className="text-xs">Priority</Label>
                <Select value={convertForm.priority} onValueChange={v => setConvertForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Lead will be marked as <strong>Won</strong>.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
              <Button onClick={convertToJobCard}><ClipboardList className="h-4 w-4 mr-1" /> Create Job Card</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
