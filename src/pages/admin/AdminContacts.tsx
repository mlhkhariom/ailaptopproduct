import { useState, useEffect } from "react";
import { Mail, Phone, Eye, Trash2, MessageCircle, CheckCircle, AlertCircle, Search, Reply, Star, RefreshCw, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new:      { label: 'New',      color: 'bg-blue-100 text-blue-700',   icon: AlertCircle },
  read:     { label: 'Read',     color: 'bg-gray-100 text-gray-600',   icon: Eye },
  replied:  { label: 'Replied',  color: 'bg-green-100 text-green-700', icon: Reply },
  resolved: { label: 'Resolved', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
};

const PRIORITY_COLOR: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const AdminContacts = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewContact, setViewContact] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      setContacts(await api.getContacts(params));
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const update = async (id: string, data: any) => {
    await api.updateContact(id, data);
    load();
  };

  const openView = async (c: any) => {
    setViewContact(c);
    setReplyText('');
    if (c.status === 'new') await update(c.id, { status: 'read', priority: c.priority, starred: c.starred });
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await update(viewContact.id, { status: 'replied', reply: replyText, priority: viewContact.priority, starred: viewContact.starred });
      toast.success('Reply saved!');
      setViewContact(null);
    } finally { setReplying(false); }
  };

  const toggleStar = async (c: any) => {
    await update(c.id, { status: c.status, priority: c.priority, starred: !c.starred, reply: c.reply });
    load();
  };

  const convertToLead = async (c: any) => {
    try {
      await fetch('/api/erp/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
        body: JSON.stringify({ name: c.name, phone: c.phone || '', email: c.email, source: 'Website', interest: c.subject || '', notes: c.message, status: 'new' }),
      });
      await update(c.id, { status: 'resolved', priority: c.priority, starred: c.starred, reply: c.reply });
      toast.success('Converted to CRM lead!');
      setViewContact(null); load();
    } catch { toast.error('Failed to convert'); }
  };

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
    resolved: contacts.filter(c => c.status === 'resolved').length,
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold">Contact Queries</h1>
            <p className="text-sm text-muted-foreground">{counts.new} new · {counts.replied} replied</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={load}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="h-8">
            {Object.entries(counts).map(([k, v]) => (
              <TabsTrigger key={k} value={k} className="text-xs h-7 px-3 capitalize">{k === 'all' ? 'All' : k} ({v})</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, subject..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-12"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No queries found</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => {
              const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.new;
              const Icon = st.icon;
              return (
                <Card key={c.id} className={`hover:shadow-md transition-shadow cursor-pointer ${c.status === 'new' ? 'border-blue-200 bg-blue-50/30' : ''}`} onClick={() => openView(c)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{c.name}</p>
                          <Badge className={`text-[10px] ${st.color}`}><Icon className="h-3 w-3 mr-1" />{st.label}</Badge>
                          <Badge className={`text-[10px] ${PRIORITY_COLOR[c.priority] || PRIORITY_COLOR.medium}`}>{c.priority}</Badge>
                          {c.starred ? <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> : null}
                        </div>
                        <p className="text-sm font-medium mt-0.5">{c.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.message}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                          {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); toggleStar(c); }} className="shrink-0 p-1">
                        <Star className={`h-4 w-4 ${c.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View + Reply Dialog */}
      <Dialog open={!!viewContact} onOpenChange={() => setViewContact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Query from {viewContact?.name}</DialogTitle></DialogHeader>
          {viewContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{viewContact.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{viewContact.phone || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Subject</p><p className="font-medium">{viewContact.subject}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{new Date(viewContact.created_at).toLocaleString('en-IN')}</p></div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm">{viewContact.message}</p>
              </div>
              {viewContact.reply && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">Previous Reply</p>
                  <p className="text-sm">{viewContact.reply}</p>
                </div>
              )}
              <div>
                <Label className="text-xs font-semibold">Reply</Label>
                <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="mt-1.5 text-sm resize-none" rows={3} placeholder="Type your reply..." />
              </div>
              <div className="flex gap-2">
                <Select value={viewContact.status} onValueChange={v => update(viewContact.id, { status: v, priority: viewContact.priority, starred: viewContact.starred, reply: viewContact.reply }).then(() => setViewContact({ ...viewContact, status: v }))}>
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={viewContact.priority} onValueChange={v => update(viewContact.id, { status: viewContact.status, priority: v, starred: viewContact.starred, reply: viewContact.reply }).then(() => setViewContact({ ...viewContact, priority: v }))}>
                  <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/${viewContact.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs text-green-600"><Phone className="h-3.5 w-3.5" /> WhatsApp</Button>
                </a>
                <a href={`mailto:${viewContact.email}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" /> Email</Button>
                </a>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewContact(null)}>Close</Button>
            <Button variant="outline" className="gap-1.5 text-blue-600 border-blue-200" onClick={() => convertToLead(viewContact)}>
              <Users className="h-4 w-4" /> Convert to Lead
            </Button>
            <Button onClick={sendReply} disabled={replying || !replyText.trim()} className="gap-2"><Reply className="h-4 w-4" />{replying ? 'Saving...' : 'Save Reply'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminContacts;
