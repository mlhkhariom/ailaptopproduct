import { useState, useEffect } from "react";
import { Mail, Plus, Send, Trash2, Eye } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminEmailCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', recipients: 'all' });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => fetch('/api/crm-tools/campaigns', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setCampaigns(d); });
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.subject || !form.body) return toast.error('Fill all fields');
    await fetch('/api/crm-tools/campaigns', { method: 'POST', headers, body: JSON.stringify(form) });
    toast.success('Campaign created');
    setShowAdd(false);
    setForm({ name: '', subject: '', body: '', recipients: 'all' });
    load();
  };

  const send = async (id: string) => {
    if (!confirm('Send this campaign to all recipients? This cannot be undone.')) return;
    const res = await fetch(`/api/crm-tools/campaigns/${id}/send`, { method: 'POST', headers }).then(r => r.json());
    if (res.success) toast.success(`Sent to ${res.sent} recipients!`);
    else toast.error('Failed');
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/crm-tools/campaigns/${id}`, { method: 'DELETE', headers });
    toast.success('Deleted');
    load();
  };

  const statusColor: Record<string, string> = { draft: 'bg-gray-100 text-gray-700', sent: 'bg-green-100 text-green-700', scheduled: 'bg-blue-100 text-blue-700' };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Mail className="h-6 w-6" /> Email Campaigns</h1>
            <p className="text-sm text-muted-foreground">Send bulk emails to customers and leads</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Campaign</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Email Campaign</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Campaign Name</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Summer Sale Announcement" /></div>
                <div><Label>Subject Line</Label><Input className="mt-1" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="🎉 Flat 20% Off on All Laptops!" /></div>
                <div><Label>Recipients</Label>
                  <Select value={form.recipients} onValueChange={v => setForm(f => ({ ...f, recipients: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customers">Customers Only</SelectItem>
                      <SelectItem value="leads">CRM Leads Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Email Body (HTML)</Label>
                  <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[150px] font-mono" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="<h1>Hello!</h1><p>Check out our latest deals...</p>" />
                </div>
                <Button onClick={create} className="w-full">Create Campaign</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {campaigns.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No campaigns yet. Create one to send bulk emails to your customers.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{c.name}</p>
                      <Badge className={statusColor[c.status] || 'bg-gray-100'}>{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Subject: {c.subject} • To: {c.recipients}</p>
                    {c.sent_count > 0 && <p className="text-xs text-muted-foreground">Sent: {c.sent_count} • Opens: {c.open_count}</p>}
                  </div>
                  {c.status === 'draft' && <Button size="sm" className="gap-1" onClick={() => send(c.id)}><Send className="h-3 w-3" /> Send</Button>}
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
