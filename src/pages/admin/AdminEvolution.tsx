import { useState, useEffect, useRef } from "react";
import { Settings, MessageCircle, Plus, Trash2, RefreshCw, Wifi, WifiOff, QrCode, Eye, EyeOff, Send, Phone, Loader2, CheckCircle, XCircle, Zap, Cloud, Search, CheckCheck } from "lucide-react";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [qrDialog, setQrDialog] = useState<any>(null);
  const [newInstanceDialog, setNewInstanceDialog] = useState(false);
  const [newForm, setNewForm] = useState({ instance_name: '', connection_type: 'baileys', cloud_phone_id: '', cloud_access_token: '' });
  const [loading, setLoading] = useState(false);
  const [searchChat, setSearchChat] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadInstances = () => req('GET', '/instances').then(d => { setInstances(d); if (d.length > 0 && !activeInstance) setActiveInstance(d[0].instance_name); }).catch(() => {});
  useEffect(() => { loadInstances(); }, []);
  useEffect(() => { if (activeInstance) req('GET', `/instances/${activeInstance}/chats`).then(setChats).catch(() => {}); }, [activeInstance]);
  useEffect(() => {
    if (activeChat && activeInstance) {
      req('GET', `/instances/${activeInstance}/messages/${encodeURIComponent(activeChat.remoteJid)}`).then(setMessages).catch(() => {});
    }
  }, [activeChat?.remoteJid, activeInstance]);
  useEffect(() => { setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); }, [messages]);

  const typeLabels: Record<string,string> = { imageMessage:'📷 Image', videoMessage:'🎥 Video', audioMessage:'🎵 Audio', documentMessage:'📄 Document', stickerMessage:'🎭 Sticker', protocolMessage:'🔄 System', reactionMessage:'👍 Reaction', locationMessage:'📍 Location', contactMessage:'👤 Contact' };

  const extractBody = (msg: any): string => {
    const b = msg.body || msg.message;
    if (typeof b === 'string' && b) return b;
    const m = (typeof b === 'object' ? b : msg.message) || {};
    const type = msg.messageType || Object.keys(m).find(k => k !== 'messageContextInfo') || '';
    return m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || typeLabels[type] || (type ? `[${type}]` : '');
  };

  const parseChat = (chat: any) => {
    const jid = chat.remoteJid || chat.id || '';
    const realJid = chat.lastMessage?.key?.remoteJidAlt || jid;
    const phone = realJid.replace('@s.whatsapp.net','').replace('@lid','').replace(/[^0-9]/g,'');
    const displayPhone = phone ? `+${phone}` : '';
    const name = chat.pushName || chat.lastMessage?.pushName || chat.name || displayPhone || 'Unknown';
    const lm = chat.lastMessage;
    const lastMsg = lm ? extractBody({ body: null, message: lm.message, messageType: lm.messageType }) : '';
    const lastTime = lm?.messageTimestamp ? new Date(lm.messageTimestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
    return { jid, realJid, phone, displayPhone, name, pic: chat.profilePicUrl, lastMsg, lastTime, unread: chat.unreadCount || 0 };
  };

  const sendMsg = async () => {
    if (!message.trim() || !activeChat || !activeInstance) return;
    const number = (activeChat.realJid || activeChat.remoteJid).replace('@s.whatsapp.net','').replace('@lid','').replace(/[^0-9]/g,'');
    const body = message; setMessage('');
    const tmpMsg = { id: Date.now(), body, fromMe: true, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(p => [...p, tmpMsg]);
    try { await req('POST', `/instances/${activeInstance}/send/text`, { number, text: body }); }
    catch (e: any) { toast.error(e.message); }
  };

  const getQR = async (name: string) => {
    try { const d = await req('GET', `/instances/${name}/qr`); setQrDialog({ name, qr: d.base64 || d.qrcode?.base64 }); }
    catch (e: any) { toast.error(e.message); }
  };

  const filteredChats = chats.filter(c => {
    const p = parseChat(c);
    return p.name.toLowerCase().includes(searchChat.toLowerCase()) || p.phone.includes(searchChat);
  });

  const instStatus = instances.find(i => i.instance_name === activeInstance);
  const isConnected = instStatus?.connectionStatus === 'open' || instStatus?.status === 'connected';

  return (
    <div className="flex h-[calc(100vh-180px)] rounded-xl overflow-hidden border shadow-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>

      {/* ── LEFT: Instance + Chat List ── */}
      <div className="w-[340px] shrink-0 flex flex-col bg-white border-r">
        {/* Instance selector */}
        <div className="px-3 py-2 bg-[#f0f2f5] border-b flex items-center gap-2">
          <select value={activeInstance} onChange={e => setActiveInstance(e.target.value)}
            className="flex-1 text-sm bg-transparent font-semibold text-[#111b21] outline-none cursor-pointer">
            {instances.map(i => <option key={i.id} value={i.instance_name}>{i.instance_name} {i.connectionStatus === 'open' ? '🟢' : '🔴'}</option>)}
          </select>
          <button onClick={() => setNewInstanceDialog(true)} className="text-[#54656f] hover:text-[#111b21]"><Plus className="h-4 w-4" /></button>
          <button onClick={loadInstances} className="text-[#54656f] hover:text-[#111b21]"><RefreshCw className="h-3.5 w-3.5" /></button>
          {!isConnected && <button onClick={() => getQR(activeInstance)} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><QrCode className="h-3 w-3" />QR</button>}
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-[#f0f2f5]">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5">
            <Search className="h-4 w-4 text-[#54656f]" />
            <input value={searchChat} onChange={e => setSearchChat(e.target.value)} placeholder="Search or start new chat"
              className="flex-1 text-sm outline-none text-[#111b21] placeholder:text-[#8696a0]" />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat, i) => {
            const p = parseChat(chat);
            const isActive = activeChat?.remoteJid === p.jid;
            return (
              <div key={i} onClick={() => setActiveChat({ ...chat, ...p, remoteJid: p.jid })}
                className={`flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-[#f0f2f5] transition-colors ${isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}>
                <div className="relative shrink-0">
                  {p.pic
                    ? <img src={p.pic} alt="" className="h-12 w-12 rounded-full object-cover" onError={e => { (e.target as any).src = ''; }} />
                    : <div className="h-12 w-12 rounded-full bg-[#dfe5e7] flex items-center justify-center text-lg font-bold text-[#54656f]">{p.name[0]?.toUpperCase()}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[15px] font-normal text-[#111b21] truncate">{p.name}</p>
                    <p className={`text-[11px] shrink-0 ml-2 ${p.unread > 0 ? 'text-[#25d366] font-medium' : 'text-[#667781]'}`}>{p.lastTime}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-[#667781] truncate">{p.lastMsg}</p>
                    {p.unread > 0 && <span className="ml-2 shrink-0 h-5 min-w-5 rounded-full bg-[#25d366] text-white text-[11px] font-medium flex items-center justify-center px-1.5">{p.unread}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredChats.length === 0 && <p className="text-sm text-[#8696a0] text-center py-10">No chats found</p>}
        </div>
      </div>

      {/* ── RIGHT: Chat Window ── */}
      {activeChat ? (
        <div className="flex-1 flex flex-col" style={{ background: '#efeae2' }}>
          {/* Header */}
          <div className="px-4 py-2 bg-[#f0f2f5] border-b flex items-center gap-3 cursor-pointer" onClick={() => setProfileOpen(true)}>
            {activeChat.pic
              ? <img src={activeChat.pic} alt="" className="h-10 w-10 rounded-full object-cover" />
              : <div className="h-10 w-10 rounded-full bg-[#dfe5e7] flex items-center justify-center text-base font-bold text-[#54656f]">{activeChat.name?.[0]?.toUpperCase()}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-[#111b21]">{activeChat.name}</p>
              <p className="text-xs text-[#667781]">{activeChat.displayPhone || activeChat.phone}</p>
            </div>
            <div className="flex items-center gap-3 text-[#54656f]">
              <button onClick={e => { e.stopPropagation(); req('GET', `/instances/${activeInstance}/messages/${encodeURIComponent(activeChat.remoteJid)}`).then(setMessages).catch(() => {}); }}>
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {messages.map((msg, i) => {
              const isMe = msg.fromMe || msg.from_me || msg.key?.fromMe;
              const body = extractBody(msg);
              const time = msg.time || (msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '');
              const senderName = !isMe ? (msg.pushName || activeChat.name) : '';
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative ${isMe ? 'bg-[#d9fdd3]' : 'bg-white'}`}
                    style={{ borderRadius: isMe ? '8px 0 8px 8px' : '0 8px 8px 8px' }}>
                    {msg.isAI && <p className="text-[10px] text-purple-600 font-semibold mb-0.5 flex items-center gap-1"><Zap className="h-3 w-3" />AI Agent</p>}
                    {senderName && <p className="text-[11px] font-semibold text-[#06cf9c] mb-0.5">{senderName}</p>}
                    <p className="text-[14px] text-[#111b21] break-words leading-relaxed">{body}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[11px] text-[#667781]">{time}</span>
                      {isMe && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 bg-[#f0f2f5] flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg flex items-center px-3 gap-2">
              <input value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                placeholder="Type a message" className="flex-1 py-2.5 text-[15px] outline-none text-[#111b21] placeholder:text-[#8696a0]" />
            </div>
            <button onClick={sendMsg} disabled={!message.trim()}
              className="h-10 w-10 rounded-full bg-[#00a884] hover:bg-[#017561] flex items-center justify-center disabled:opacity-40 transition-colors">
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]">
          <MessageCircle className="h-16 w-16 text-[#8696a0] mb-4" />
          <p className="text-xl text-[#41525d] font-light">WhatsApp Web</p>
          <p className="text-sm text-[#8696a0] mt-2">Select a chat to start messaging</p>
        </div>
      )}

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Contact Info</DialogTitle></DialogHeader>
          {activeChat && (
            <div className="text-center space-y-3">
              {activeChat.pic
                ? <img src={activeChat.pic} alt="" className="h-24 w-24 rounded-full mx-auto object-cover" />
                : <div className="h-24 w-24 rounded-full bg-[#dfe5e7] flex items-center justify-center text-3xl font-bold text-[#54656f] mx-auto">{activeChat.name?.[0]?.toUpperCase()}</div>
              }
              <div>
                <p className="text-lg font-semibold">{activeChat.name}</p>
                <p className="text-sm text-muted-foreground">{activeChat.displayPhone || activeChat.phone}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{activeChat.realJid || activeChat.remoteJid}</p>
              </div>
              <div className="flex justify-center gap-3">
                <a href={`tel:+${activeChat.phone}`}>
                  <Button size="sm" variant="outline" className="gap-1.5"><Phone className="h-3.5 w-3.5" /> Call</Button>
                </a>
                <a href={`https://wa.me/${activeChat.phone}`} target="_blank" rel="noreferrer">
                  <Button size="sm" className="gap-1.5 bg-[#25d366] hover:bg-[#20b858]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={!!qrDialog} onOpenChange={() => setQrDialog(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader><DialogTitle>Scan QR — {qrDialog?.name}</DialogTitle></DialogHeader>
          {qrDialog?.qr
            ? <div><img src={qrDialog.qr.startsWith('data:') ? qrDialog.qr : `data:image/png;base64,${qrDialog.qr}`} alt="QR" className="w-64 h-64 mx-auto rounded-xl" />
              <p className="text-xs text-muted-foreground mt-3">Open WhatsApp → Linked Devices → Link a Device</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => getQR(qrDialog.name)}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button></div>
            : <p className="text-muted-foreground py-8">QR not available</p>}
        </DialogContent>
      </Dialog>

      {/* New Instance Dialog */}
      <Dialog open={newInstanceDialog} onOpenChange={setNewInstanceDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create Instance</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Instance Name</Label><Input className="mt-1 text-sm" value={newForm.instance_name} onChange={e => setNewForm(p => ({ ...p, instance_name: e.target.value }))} placeholder="ailaptopwala" /></div>
            <div><Label className="text-xs">Type</Label>
              <Select value={newForm.connection_type} onValueChange={v => setNewForm(p => ({ ...p, connection_type: v }))}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baileys"><Zap className="h-3.5 w-3.5 inline mr-1 text-primary" />Baileys (Free)</SelectItem>
                  <SelectItem value="cloud"><Cloud className="h-3.5 w-3.5 inline mr-1 text-blue-500" />Cloud API (Meta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newForm.connection_type === 'cloud' && <>
              <div><Label className="text-xs">Phone Number ID</Label><Input className="mt-1 text-sm" value={newForm.cloud_phone_id} onChange={e => setNewForm(p => ({ ...p, cloud_phone_id: e.target.value }))} /></div>
              <div><Label className="text-xs">Access Token</Label><Input className="mt-1 text-sm" value={newForm.cloud_access_token} onChange={e => setNewForm(p => ({ ...p, cloud_access_token: e.target.value }))} /></div>
            </>}
            <Button onClick={async () => { setLoading(true); try { await req('POST', '/instances', newForm); toast.success('Created!'); setNewInstanceDialog(false); loadInstances(); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); } }} disabled={loading || !newForm.instance_name} className="w-full gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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
