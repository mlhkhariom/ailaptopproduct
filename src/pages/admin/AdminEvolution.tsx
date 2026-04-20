import { useState, useEffect, useRef } from "react";
import { Settings, MessageCircle, Plus, Trash2, RefreshCw, Wifi, WifiOff, QrCode, Eye, EyeOff, Send, Phone, Loader2, CheckCircle, XCircle, Zap, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = () => localStorage.getItem('ailaptopwala_token');
const req = async (method: string, path: string, body?: any) => {
  const res = await fetch(`${API}/evolution${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: any = { connected: ['bg-green-100 text-green-700', 'Connected'], qr_code: ['bg-yellow-100 text-yellow-700', 'QR Code'], disconnected: ['bg-red-100 text-red-700', 'Disconnected'], unknown: ['bg-gray-100 text-gray-600', 'Unknown'] };
  const [cls, label] = map[status] || map.unknown;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

// ── Settings Tab ──────────────────────────────────────────
const SettingsTab = () => {
  const [settings, setSettings] = useState<any>({});
  const [form, setForm] = useState({ api_url: '', api_key: '', default_instance: 'ailaptopwala', webhook_secret: '' });
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    req('GET', '/settings').then(d => { setSettings(d); setForm({ api_url: d.api_url || '', api_key: '', default_instance: d.default_instance || 'ailaptopwala', webhook_secret: '' }); }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try { await req('PUT', '/settings', form); toast.success('Settings saved!'); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const testConn = async () => {
    setTesting(true); setTestResult(null);
    try { const r = await req('POST', '/settings/test'); setTestResult({ ok: true, msg: `Connected! ${r.instances} instance(s)` }); }
    catch (e: any) { setTestResult({ ok: false, msg: e.message }); }
    finally { setTesting(false); }
  };

  const toggleVisibility = async (v: boolean) => {
    await req('PUT', '/settings/visibility', { visible: v }).catch(() => {});
    setSettings((p: any) => ({ ...p, is_visible_to_admin: v ? 1 : 0 }));
    toast.success(v ? 'Visible to admins' : 'Hidden from admins');
  };

  return (
    <div className="space-y-5 max-w-xl">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Evolution API Connection</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Evolution API Server URL</Label>
            <Input className="mt-1 text-sm font-mono" value={form.api_url} onChange={e => setForm(p => ({ ...p, api_url: e.target.value }))} placeholder="http://your-server:8080" />
            <p className="text-[10px] text-muted-foreground mt-1">Self-hosted Evolution API server URL</p>
          </div>
          <div>
            <Label className="text-xs">Global API Key</Label>
            <div className="relative mt-1">
              <Input className="text-sm font-mono pr-9" type={showKey ? 'text' : 'password'} value={form.api_key} onChange={e => setForm(p => ({ ...p, api_key: e.target.value }))} placeholder={settings.api_key ? '••••••••••••' : 'Enter API key'} />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-2 text-muted-foreground">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs">Default Instance Name</Label>
            <Input className="mt-1 text-sm" value={form.default_instance} onChange={e => setForm(p => ({ ...p, default_instance: e.target.value }))} placeholder="ailaptopwala" />
          </div>
          <div className="flex gap-2">
            <Button onClick={testConn} disabled={testing} variant="outline" size="sm" className="gap-1.5">
              {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />} Test Connection
            </Button>
            <Button onClick={save} disabled={saving} size="sm" className="gap-1.5">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Settings
            </Button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${testResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.ok ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {testResult.msg}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Admin Visibility</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show to other admins</p>
              <p className="text-xs text-muted-foreground">Allow admin role to see Evolution API module</p>
            </div>
            <Switch checked={!!settings.is_visible_to_admin} onCheckedChange={toggleVisibility} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Setup Guide</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p><strong>1. Install Evolution API:</strong></p>
          <code className="block bg-muted p-2 rounded text-[10px]">docker run -d -p 8080:8080 atendai/evolution-api:latest</code>
          <p><strong>2. Get API Key</strong> from Evolution API dashboard</p>
          <p><strong>3. Enter URL + Key above</strong> and test connection</p>
          <p><strong>4. Create instance</strong> in Chats tab → scan QR</p>
          <p><strong>Webhook URL:</strong></p>
          <code className="block bg-muted p-2 rounded text-[10px] break-all">http://your-server:5000/api/evolution/webhook/{'{'}{'{'}instanceName{'}'}{'}'}</code>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Instances + Chats Tab ─────────────────────────────────
const ChatsTab = () => {
  const [instances, setInstances] = useState<any[]>([]);
  const [activeInstance, setActiveInstance] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [qrDialog, setQrDialog] = useState<any>(null);
  const [newInstanceDialog, setNewInstanceDialog] = useState(false);
  const [newForm, setNewForm] = useState({ instance_name: '', connection_type: 'baileys', cloud_phone_id: '', cloud_access_token: '' });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadInstances = () => req('GET', '/instances').then(setInstances).catch(() => {});

  useEffect(() => { loadInstances(); }, []);

  useEffect(() => {
    if (activeInstance) req('GET', `/instances/${activeInstance}/chats`).then(setChats).catch(() => {});
  }, [activeInstance]);

  useEffect(() => {
    if (activeChat && activeInstance) {
      req('GET', `/instances/${activeInstance}/messages/${encodeURIComponent(activeChat.remoteJid || activeChat.remote_jid)}`).then(setMessages).catch(() => {});
    }
  }, [activeChat, activeInstance]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = async () => {
    if (!message.trim() || !activeChat || !activeInstance) return;
    const jid = activeChat.remoteJid || activeChat.remote_jid;
    const number = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
    const body = message;
    setMessage('');
    try {
      await req('POST', `/instances/${activeInstance}/send/text`, { number, text: body });
      setMessages(p => [...p, { id: Date.now(), body, fromMe: true, from_me: 1, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (e: any) { toast.error(e.message); }
  };

  const getQR = async (instanceName: string) => {
    try {
      const data = await req('GET', `/instances/${instanceName}/qr`);
      setQrDialog({ instanceName, qr: data.base64 || data.qrcode?.base64 });
    } catch (e: any) { toast.error(e.message); }
  };

  const createInstance = async () => {
    setLoading(true);
    try {
      await req('POST', '/instances', newForm);
      toast.success('Instance created!');
      setNewInstanceDialog(false);
      loadInstances();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const deleteInst = async (name: string) => {
    if (!confirm(`Delete instance "${name}"?`)) return;
    await req('DELETE', `/instances/${name}`).catch(() => {});
    loadInstances();
    if (activeInstance === name) setActiveInstance('');
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-200px)]">
      {/* Instances sidebar */}
      <div className="w-48 shrink-0 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Instances</p>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setNewInstanceDialog(true)}><Plus className="h-3.5 w-3.5" /></Button>
        </div>
        {instances.map(inst => (
          <div key={inst.id} onClick={() => setActiveInstance(inst.instance_name)}
            className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${activeInstance === inst.instance_name ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold truncate">{inst.instance_name}</p>
              <button onClick={e => { e.stopPropagation(); deleteInst(inst.instance_name); }} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <StatusBadge status={inst.status || inst.remote_status || 'unknown'} />
            <div className="flex gap-1 mt-2">
              {(inst.status === 'disconnected' || inst.status === 'qr_code') && (
                <button onClick={e => { e.stopPropagation(); getQR(inst.instance_name); }} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                  <QrCode className="h-3 w-3" /> QR
                </button>
              )}
            </div>
          </div>
        ))}
        {instances.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No instances</p>}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex gap-3 min-w-0">
        {/* Chat list */}
        <div className="w-56 shrink-0 border rounded-xl overflow-hidden flex flex-col">
          <div className="p-2 border-b bg-muted/30">
            <p className="text-xs font-semibold">{activeInstance || 'Select instance'}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat, i) => {
              const jid = chat.id || chat.remoteJid || chat.remote_jid || '';
              const phone = jid.split('@')[0].split(':')[0];
              const name = String(chat.name || chat.pushName || chat.push_name || chat.verifiedName || phone || 'Unknown');
              const lastMsg = (() => {
                const lm = chat.lastMessage || chat.last_message || chat.lastMsg;
                if (!lm) return '';
                if (typeof lm === 'string') return lm;
                if (typeof lm === 'object') {
                  const msg = lm.message || lm;
                  return msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || msg.documentMessage?.title || (lm.messageType ? `[${lm.messageType}]` : '[media]');
                }
                return '';
              })();
              return (
                <div key={i} onClick={() => setActiveChat({ ...chat, remoteJid: jid })}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/30 ${activeChat?.remoteJid === jid ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{name?.[0]?.toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{lastMsg}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {chats.length === 0 && activeInstance && <p className="text-xs text-muted-foreground text-center py-8">No chats</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 border rounded-xl overflow-hidden flex flex-col bg-[#efeae2]">
          {activeChat ? (
            <>
              <div className="p-3 bg-[#075e54] text-white flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {(activeChat.name || activeChat.pushName || activeChat.remoteJid?.split('@')[0])?.[0]?.toUpperCase()}
                </div>
                <p className="text-sm font-semibold">{activeChat.name || activeChat.pushName || activeChat.remoteJid?.split('@')[0]}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg, i) => {
                  const isMe = msg.fromMe || msg.from_me || msg.key?.fromMe;
                  const msgBody = (() => {
                    const b = msg.body || msg.message;
                    if (!b) {
                      // Evolution API v2 format
                      const m = msg.message || {};
                      return m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || (msg.messageType ? `[${msg.messageType}]` : '[media]');
                    }
                    if (typeof b === 'string') return b;
                    if (typeof b === 'object') return b.conversation || b.extendedTextMessage?.text || b.imageMessage?.caption || '[media]';
                    return String(b);
                  })();
                  const msgTime = msg.time || (msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '');
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                        {msg.isAI && <p className="text-[9px] text-purple-600 font-semibold mb-0.5">🤖 AI Agent</p>}
                        <p className="text-gray-800 break-words">{msgBody}</p>
                        <p className="text-[10px] text-gray-400 text-right mt-0.5">{msgTime}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-2 bg-[#f0f2f5] flex gap-2">
                <Input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Type a message" className="flex-1 h-9 text-sm rounded-full bg-white border-0" />
                <Button size="icon" className="h-9 w-9 rounded-full bg-[#075e54] hover:bg-[#064e45]" onClick={sendMsg} disabled={!message.trim()}>
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={!!qrDialog} onOpenChange={() => setQrDialog(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader><DialogTitle>Scan QR Code — {qrDialog?.instanceName}</DialogTitle></DialogHeader>
          {qrDialog?.qr ? (
            <div>
              <img src={qrDialog.qr.startsWith('data:') ? qrDialog.qr : `data:image/png;base64,${qrDialog.qr}`} alt="QR Code" className="w-64 h-64 mx-auto rounded-xl" />
              <p className="text-xs text-muted-foreground mt-3">Open WhatsApp → Linked Devices → Link a Device → Scan</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => getQR(qrDialog.instanceName)}>
                <RefreshCw className="h-3.5 w-3.5" /> Refresh QR
              </Button>
            </div>
          ) : <p className="text-muted-foreground text-sm py-8">QR code not available. Try connecting first.</p>}
        </DialogContent>
      </Dialog>

      {/* New Instance Dialog */}
      <Dialog open={newInstanceDialog} onOpenChange={setNewInstanceDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create New Instance</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Instance Name</Label><Input className="mt-1 text-sm" value={newForm.instance_name} onChange={e => setNewForm(p => ({ ...p, instance_name: e.target.value }))} placeholder="ailaptopwala" /></div>
            <div>
              <Label className="text-xs">Connection Type</Label>
              <Select value={newForm.connection_type} onValueChange={v => setNewForm(p => ({ ...p, connection_type: v }))}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baileys"><span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-primary" /> Baileys (Free - WhatsApp Web)</span></SelectItem>
                  <SelectItem value="cloud"><span className="flex items-center gap-2"><Cloud className="h-3.5 w-3.5 text-blue-500" /> Cloud API (Meta Official)</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newForm.connection_type === 'cloud' && (
              <>
                <div><Label className="text-xs">Phone Number ID</Label><Input className="mt-1 text-sm" value={newForm.cloud_phone_id} onChange={e => setNewForm(p => ({ ...p, cloud_phone_id: e.target.value }))} /></div>
                <div><Label className="text-xs">Access Token</Label><Input className="mt-1 text-sm" value={newForm.cloud_access_token} onChange={e => setNewForm(p => ({ ...p, cloud_access_token: e.target.value }))} /></div>
              </>
            )}
            <Button onClick={createInstance} disabled={loading || !newForm.instance_name} className="w-full gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create Instance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────
const AdminEvolution = () => {
  const { user } = useAuth();

  if (user?.role !== 'superadmin') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold">Access Denied</p>
            <p className="text-sm text-muted-foreground">Super Admin access required</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Evolution API</h1>
            <p className="text-sm text-muted-foreground">WhatsApp gateway — Baileys & Cloud API</p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs border-primary text-primary">Super Admin Only</Badge>
        </div>

        <Tabs defaultValue="chats">
          <TabsList className="mb-6">
            <TabsTrigger value="chats" className="gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> Chats</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chats"><ChatsTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminEvolution;
