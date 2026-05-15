import { useState } from "react";
import { Send, Users, MessageCircle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminBroadcast() {
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all_leads');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const send = async () => {
    if (!message.trim()) return toast.error('Enter message');
    if (!confirm(`Send this message to ${filter.replace('_', ' ')}? This cannot be undone.`)) return;
    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/broadcast', { method: 'POST', headers, body: JSON.stringify({ message, filter }) }).then(r => r.json());
      if (res.success) { setResult(res); toast.success(`Queued ${res.queued} messages!`); }
      else toast.error(res.error || 'Failed');
    } catch { toast.error('Failed'); }
    setSending(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2"><MessageCircle className="h-6 w-6" /> WhatsApp Broadcast</h1>
          <p className="text-sm text-muted-foreground">Send bulk WhatsApp messages to leads or customers</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Compose Broadcast</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_leads">All CRM Leads</SelectItem>
                  <SelectItem value="all_customers">All Registered Customers</SelectItem>
                  <SelectItem value="recent_orders">Recent Orders (30 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[120px]" value={message} onChange={e => setMessage(e.target.value)}
                placeholder={"🎉 *Special Offer!*\n\nFlat 20% off on all laptops this weekend!\n\n🛒 Shop now: ailaptopwala.com/products\n📞 Call: +91 98934 96163\n\n— AI Laptop Wala"} />
              <p className="text-[10px] text-muted-foreground mt-1">Use *bold*, _italic_, ~strikethrough~ for formatting. Max 1000 chars.</p>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-[#e5ddd5] border">
              <div className="bg-white rounded-lg p-3 max-w-[280px] shadow-sm">
                <p className="text-sm whitespace-pre-wrap">{message || 'Preview will appear here...'}</p>
                <p className="text-[9px] text-right text-muted-foreground mt-1">12:00 PM ✓✓</p>
              </div>
            </div>

            <Button onClick={send} disabled={sending || !message.trim()} className="w-full gap-2">
              <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Broadcast'}
            </Button>

            {result && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm font-medium text-green-700">✅ Broadcast queued!</p>
                <p className="text-xs text-green-600">Queued: {result.queued} / Total: {result.total}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Messages will be sent with 30s delay between each to avoid spam detection.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">⚠️ Best Practices</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Send max 1 broadcast per day to avoid WhatsApp ban</li>
              <li>• Keep messages short and valuable (offers, updates)</li>
              <li>• Include opt-out option: "Reply STOP to unsubscribe"</li>
              <li>• Messages are queued and sent with delays (not instant)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
