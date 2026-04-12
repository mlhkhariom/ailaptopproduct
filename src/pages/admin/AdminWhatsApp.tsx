import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  MessageCircle, Send, Search, QrCode, Wifi, WifiOff, RefreshCw,
  ArrowLeft, Check, CheckCheck, Bot, Zap, BarChart3, Plus, Trash2,
  Edit, Users, Phone, MoreVertical, Smile, Paperclip, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_COLOR: Record<string, string> = {
  disconnected: 'bg-red-500', initializing: 'bg-yellow-500',
  qr: 'bg-blue-500', loading: 'bg-yellow-500',
  authenticated: 'bg-yellow-500', ready: 'bg-green-500',
};

const AckIcon = ({ ack }: { ack: number }) => {
  if (ack >= 3) return <CheckCheck className="h-3.5 w-3.5 text-blue-400" />;
  if (ack >= 2) return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
  return <Check className="h-3.5 w-3.5 text-gray-400" />;
};

const AdminWhatsApp = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState('disconnected');
  const [qr, setQr] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showMobile, setShowMobile] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({ name: '', keywords: '', response_template: '', type: 'custom', is_active: true });
  const [simInput, setSimInput] = useState('');
  const [simResult, setSimResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io(API_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('whatsapp:status', ({ status: st }: any) => {
      setStatus(st);
      if (st === 'ready') { loadChats(); setQr(null); }
    });
    s.on('whatsapp:qr', ({ qr: qrData }: any) => { setQr(qrData); setStatus('qr'); });
    s.on('whatsapp:chats', (chatList: any[]) => { setChats(chatList); });
    s.on('whatsapp:message', (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setChats(prev => prev.map(c => c.id === msg.from ? { ...c, lastMsg: msg.body, unread: (c.unread || 0) + 1 } : c));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    s.on('whatsapp:message_sent', (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    s.on('whatsapp:ack', ({ id, ack }: any) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, ack } : m));
    });
    s.on('whatsapp:reaction', ({ msgId, reaction }: any) => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction } : m));
    });
    s.on('whatsapp:message_revoked', ({ id }: any) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, body: '🚫 This message was deleted', revoked: true } : m));
    });
    s.on('whatsapp:message_edit', ({ id, newBody }: any) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, body: newBody, edited: true } : m));
    });
    s.on('whatsapp:call', ({ from, isVideo }: any) => {
      toast.info(`📞 Incoming ${isVideo ? 'video' : 'voice'} call from ${from}`);
    });

    api.waStatus().then(({ status: st, qr: qrData }: any) => {
      setStatus(st);
      if (qrData) setQr(qrData);
      if (st === 'ready') loadChats();
    }).catch(() => {});

    loadRules();
    api.waAnalytics().then(setAnalytics).catch(() => {});

    return () => { s.disconnect(); };
  }, []);

  const loadChats = async () => {
    try { setChats(await api.waChats()); } catch {}
  };

  const loadMessages = async (chat: any) => {
    setActiveChat(chat);
    setMessages([]);
    setShowMobile(true);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    // Mark as seen
    const token = localStorage.getItem('apsoncure_token');
    fetch(`${API_URL}/api/whatsapp/chats/${encodeURIComponent(chat.id)}/seen`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/chats/${encodeURIComponent(chat.id)}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const msgs = await res.json();
      setMessages(Array.isArray(msgs) ? msgs : []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  };

  const sendMsg = async () => {
    if (!message.trim() || !activeChat) return;
    try { await api.waSend(activeChat.id, message); setMessage(''); }
    catch (e: any) { toast.error(e.message); }
  };

  const connect = () => api.waConnect().then(() => toast.info('Connecting...')).catch(e => toast.error(e.message));
  const disconnect = () => api.waDisconnect().then(() => { setStatus('disconnected'); setQr(null); setChats([]); setActiveChat(null); }).catch(() => {});

  const loadRules = () => api.waRules().then(setRules).catch(() => {});
  const openAddRule = () => { setEditingRule(null); setRuleForm({ name: '', keywords: '', response_template: '', type: 'custom', is_active: true }); setRuleDialog(true); };
  const openEditRule = (r: any) => { setEditingRule(r); setRuleForm({ name: r.name, keywords: r.keywords.join(', '), response_template: r.response_template, type: r.type, is_active: r.is_active }); setRuleDialog(true); };

  const saveRule = async () => {
    const payload = { ...ruleForm, keywords: ruleForm.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) };
    try {
      if (editingRule) await api.waUpdateRule(editingRule.id, payload);
      else await api.waCreateRule(payload);
      toast.success(editingRule ? 'Updated!' : 'Rule added!');
      setRuleDialog(false); loadRules();
    } catch (e: any) { toast.error(e.message); }
  };

  const simulate = async () => {
    if (!simInput) return;
    setSimResult(await api.waSimulate(simInput));
  };

  const msgAction = async (action: string, msg: any, extra?: any) => {
    const token = localStorage.getItem('apsoncure_token');
    const base = `${API_URL}/api/whatsapp/message/${encodeURIComponent(msg.id)}`;
    try {
      if (action === 'react') await fetch(`${base}/react`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji: extra }) });
      if (action === 'delete') { await fetch(base, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ everyone: msg.fromMe }) }); setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, body: '🚫 This message was deleted', revoked: true } : m)); }
      if (action === 'star') await fetch(`${base}/star`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ star: true }) });
      if (action === 'reply') setMessage(`> ${msg.body}\n`);
    } catch (e: any) { toast.error(e.message); }
  };

  const filteredChats = chats.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.id?.includes(search)
  );

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        <Tabs defaultValue="chats" className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b shrink-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">WhatsApp</h1>
              <div className={`h-2 w-2 rounded-full ${STATUS_COLOR[status] || 'bg-gray-400'}`} />
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
            <div className="flex items-center gap-2">
              {status === 'ready'
                ? <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 border-red-200" onClick={disconnect}><WifiOff className="h-3 w-3" /> Disconnect</Button>
                : <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={connect} disabled={['initializing','loading','authenticated'].includes(status)}><Wifi className="h-3 w-3" /> Connect</Button>
              }
              <TabsList className="h-7">
                <TabsTrigger value="chats" className="text-xs h-6 px-2.5"><MessageCircle className="h-3.5 w-3.5" /></TabsTrigger>
                <TabsTrigger value="automation" className="text-xs h-6 px-2.5"><Bot className="h-3.5 w-3.5" /></TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs h-6 px-2.5"><BarChart3 className="h-3.5 w-3.5" /></TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* CHATS */}
          <TabsContent value="chats" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col">
            {/* QR */}
            {status === 'qr' && qr && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                <div className="bg-white p-4 rounded-2xl shadow-xl border">
                  <img src={qr} alt="QR" className="h-56 w-56" />
                </div>
                <p className="font-semibold">WhatsApp pe QR scan karo</p>
                <p className="text-sm text-muted-foreground text-center">WhatsApp → Linked Devices → Link a Device → Scan QR</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                  <RefreshCw className="h-3.5 w-3.5" /> Waiting for scan...
                </div>
              </div>
            )}
            {/* Loading */}
            {['initializing','loading','authenticated'].includes(status) && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-10 w-10 text-green-500 animate-spin" />
                <p className="font-medium capitalize">{status}...</p>
              </div>
            )}
            {/* Disconnected */}
            {status === 'disconnected' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-green-500/40" />
                </div>
                <p className="font-semibold">WhatsApp Connected nahi hai</p>
                <p className="text-sm text-muted-foreground">Connect karo aur QR scan karo</p>
                <Button onClick={connect} className="gap-2 bg-green-600 hover:bg-green-700"><QrCode className="h-4 w-4" /> Connect WhatsApp</Button>
              </div>
            )}
            {/* Ready */}
            {status === 'ready' && (
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={`w-full md:w-72 lg:w-80 border-r flex flex-col shrink-0 ${showMobile ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredChats.length === 0 ? (
                      <div className="text-center py-8">
                        <Button size="sm" variant="outline" onClick={loadChats} className="gap-1 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Load Chats</Button>
                      </div>
                    ) : filteredChats.map(chat => (
                      <div key={chat.id} onClick={() => loadMessages(chat)}
                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 border-b transition-colors ${activeChat?.id === chat.id ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                          {chat.profilePic
                            ? <img src={chat.profilePic} alt={chat.name} className="w-full h-full object-cover"
                                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.removeAttribute('style'); }}
                              />
                            : null}
                          <span style={chat.profilePic ? {display:'none'} : {}}>
                            {chat.isGroup ? <Users className="h-5 w-5" /> : (chat.name?.charAt(0)?.toUpperCase() || '?')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{chat.name || chat.id.split('@')[0]}</p>
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {chat.pinned && <span className="text-[9px] text-muted-foreground">📌</span>}
                              {chat.isMuted && <span className="text-[9px] text-muted-foreground">🔇</span>}
                              <span className="text-[10px] text-muted-foreground">{chat.lastMsgTime}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
                        </div>
                        {chat.unread > 0 && (
                          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{chat.unread}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Window */}
                <div className={`flex-1 flex flex-col overflow-hidden ${!showMobile ? 'hidden md:flex' : 'flex'}`}>
                  {!activeChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <MessageCircle className="h-16 w-16 opacity-10" />
                      <p className="text-sm">Select a chat to start messaging</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-card shrink-0">
                        <button onClick={() => setShowMobile(false)} className="md:hidden mr-1"><ArrowLeft className="h-5 w-5" /></button>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                          {activeChat.profilePic
                            ? <img src={activeChat.profilePic} alt={activeChat.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                            : (activeChat.name?.charAt(0)?.toUpperCase() || '?')
                          }
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{activeChat.name || activeChat.id.split('@')[0]}</p>
                          <p className="text-[10px] text-green-600">{activeChat.about || (status === 'ready' ? 'Online' : '')}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-1.5"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5ddd5' opacity='0.3'/%3E%3C/svg%3E\")" }}>
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[72%] rounded-2xl px-3 py-2 shadow-sm text-sm ${msg.fromMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                              {msg.media?.mimetype?.startsWith('image') && (
                                <img src={`data:${msg.media.mimetype};base64,${msg.media.data}`} alt="media" className="rounded-lg max-w-full mb-1 max-h-48 object-cover" />
                              )}
                              {msg.media?.mimetype?.startsWith('video') && (
                                <video controls className="rounded-lg max-w-full mb-1 max-h-48"><source src={`data:${msg.media.mimetype};base64,${msg.media.data}`} /></video>
                              )}
                              {msg.media?.mimetype && !msg.media.mimetype.startsWith('image') && !msg.media.mimetype.startsWith('video') && (
                                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 mb-1 text-xs"><span>📎</span><span>{msg.media.filename || 'File'}</span></div>
                              )}
                              <p className={`text-gray-800 whitespace-pre-wrap break-words ${msg.revoked ? 'italic text-gray-400' : ''}`}>{msg.body}</p>
                              {msg.edited && <span className="text-[9px] text-gray-400 italic"> (edited)</span>}
                              {msg.reaction && <span className="text-sm ml-1">{msg.reaction}</span>}
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <span className="text-[10px] text-gray-500">{msg.time}</span>
                                {msg.fromMe && <AckIcon ack={msg.ack || 1} />}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="px-3 py-2 border-t bg-[#f0f2f5] flex items-center gap-2 shrink-0">
                        <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-gray-500"><Smile className="h-5 w-5" /></Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-gray-500"><Paperclip className="h-5 w-5" /></Button>
                        <Input value={message} onChange={e => {
                          setMessage(e.target.value);
                          if (activeChat) {
                            const token = localStorage.getItem('apsoncure_token');
                            fetch(`${API_URL}/api/whatsapp/chats/${encodeURIComponent(activeChat.id)}/typing`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ typing: e.target.value.length > 0 }) }).catch(() => {});
                          }
                        }}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                          placeholder="Type a message" className="flex-1 h-9 text-sm rounded-full bg-white border-0 shadow-sm" />
                        <Button size="icon" className="h-9 w-9 rounded-full shrink-0 bg-green-500 hover:bg-green-600 border-0" onClick={sendMsg} disabled={!message.trim()}>
                          <Send className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* AUTOMATION */}
          <TabsContent value="automation" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Auto-Reply Rules ({rules.length})</h2>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAddRule}><Plus className="h-3.5 w-3.5" /> Add Rule</Button>
            </div>
            <div className="space-y-2">
              {rules.map(r => (
                <Card key={r.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${r.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">🔑 {r.keywords.join(', ')}</p>
                      <p className="text-xs text-muted-foreground truncate">💬 {r.response_template.slice(0, 70)}...</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{r.match_count}</Badge>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditRule(r)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={async () => { await api.waDeleteRule(r.id); loadRules(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" /> Message Simulator</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={simInput} onChange={e => setSimInput(e.target.value)} placeholder="Test message..." className="text-sm" onKeyDown={e => e.key === 'Enter' && simulate()} />
                  <Button size="sm" onClick={simulate} className="shrink-0">Test</Button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['Hello', 'Ashwagandha price', 'Order status', 'Stock check', 'Thanks'].map(t => (
                    <button key={t} onClick={() => setSimInput(t)} className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">{t}</button>
                  ))}
                </div>
                {simResult && (
                  <div className={`p-3 rounded-xl text-sm border ${simResult.matched ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {simResult.matched
                      ? <><p className="text-xs text-green-600 font-medium mb-1">✓ Matched: {simResult.rule}</p><p className="text-gray-700 whitespace-pre-wrap">{simResult.reply}</p></>
                      : <p className="text-red-600">{simResult.reply}</p>
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="flex-1 overflow-y-auto p-4 space-y-4">
            {analytics ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Messages', value: analytics.totalMessages, color: 'text-blue-500' },
                    { label: 'Bot Replies', value: analytics.botReplies, color: 'text-green-500' },
                    { label: 'Contacts', value: analytics.totalContacts, color: 'text-purple-500' },
                    { label: 'Unread', value: analytics.unread, color: 'text-orange-500' },
                  ].map(s => (
                    <Card key={s.label}><CardContent className="p-4 text-center">
                      <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </CardContent></Card>
                  ))}
                </div>
                {(analytics.topRules || []).length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Rule Performance</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {analytics.topRules.map((r: any) => {
                        const max = Math.max(...analytics.topRules.map((x: any) => x.match_count), 1);
                        return (
                          <div key={r.name} className="flex items-center gap-3">
                            <p className="text-sm w-32 truncate">{r.name}</p>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(r.match_count / max) * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-6 text-right">{r.match_count}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Button variant="outline" onClick={() => api.waAnalytics().then(setAnalytics)}>Load Analytics</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rule Dialog */}
      <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Rule Name</Label><Input value={ruleForm.name} onChange={e => setRuleForm(f => ({ ...f, name: e.target.value }))} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Keywords (comma separated)</Label><Input value={ruleForm.keywords} onChange={e => setRuleForm(f => ({ ...f, keywords: e.target.value }))} className="mt-1 text-sm" placeholder="hello, hi, namaste" /></div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={ruleForm.type} onValueChange={v => setRuleForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="greeting">Greeting</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Response Template</Label>
              <Textarea value={ruleForm.response_template} onChange={e => setRuleForm(f => ({ ...f, response_template: e.target.value }))} className="mt-1 text-sm resize-none" rows={4} placeholder="Use {{product_name}}, {{price}}, {{stock_status}}" />
            </div>
            <div className="flex items-center gap-2"><Switch checked={ruleForm.is_active} onCheckedChange={v => setRuleForm(f => ({ ...f, is_active: v }))} /><Label className="text-xs">Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialog(false)}>Cancel</Button>
            <Button onClick={saveRule}>{editingRule ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
