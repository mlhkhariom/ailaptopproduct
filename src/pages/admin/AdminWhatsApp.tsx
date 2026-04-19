import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  MessageCircle, Send, Search, QrCode, Wifi, WifiOff, RefreshCw,
  ArrowLeft, Check, CheckCheck, Bot, Zap, BarChart3, Plus, Trash2,
  Edit, Users, Phone, MoreVertical, Smile, Paperclip, X, Sparkles, Settings2
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
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";
import { WhatsAppChatPanel } from "@/components/WhatsAppChatPanel";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const isSuperAdmin = (user as any)?.role === 'superadmin';
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
  const [contactAI, setContactAI] = useState<Record<string, boolean>>({});
  // AI Agent settings
  const [aiSettings, setAiSettings] = useState<any>({});
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [savingAI, setSavingAI] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [aiMemory, setAiMemory] = useState<any[]>([]);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<any>(null);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

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
      const msgChatId = msg.fromMe ? msg.to : msg.from;
      // Update chat list
      setChats(prev => prev.map(c => c.id === msgChatId ? { ...c, lastMsg: msg.body, unread: msg.fromMe ? c.unread : (c.unread || 0) + 1 } : c));
      // Only add to messages if belongs to active chat
      if (activeChatRef.current?.id === msgChatId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    });
    s.on('whatsapp:message_sent', (msg: any) => {
      if (activeChatRef.current?.id === msg.to) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
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
      if (st === 'ready') { loadChats(); setQr(null); }
    }).catch(() => {});

    loadRules();
    api.waAnalytics().then(setAnalytics).catch(() => {});
    loadAISettings();
    loadAISettings();

    return () => { s.disconnect(); };
  }, []);

  const loadChats = async () => {
    try { setChats(await api.waChats()); } catch {}
  };

  const loadAIMemory = async (contactId: string) => {
    const mem = await api.getAIMemory(contactId).catch(() => []);
    setAiMemory(mem);
  };

  const loadMessages = async (chat: any) => {
    setActiveChat(chat);
    setMessages([]);
    setShowMobile(true);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    loadContactAI(chat.id);
    const token = localStorage.getItem('ailaptopwala_token');
    fetch(API_URL + '/api/whatsapp/chats/' + encodeURIComponent(chat.id) + '/seen', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }).catch(() => {});
    try {
      const res = await fetch(API_URL + '/api/whatsapp/chats/' + encodeURIComponent(chat.id) + '/messages', { headers: { Authorization: 'Bearer ' + token } });
      const msgs = await res.json();
      if (Array.isArray(msgs) && msgs.length > 0) {
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch {}
  }

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

  // AI Agent handlers
  const loadAISettings = () => api.getAISettings().then(setAiSettings).catch(() => {});

  const loadAIModels = async () => {
    if (!aiSettings.llm_provider || !aiSettings.api_key || aiSettings.api_key.includes('*')) return;
    setLoadingModels(true);
    try {
      const models = await api.getAIModels(aiSettings.llm_provider, aiSettings.api_key);
      setAiModels(models);
    } catch (e: any) { toast.error('Could not load models: ' + e.message); }
    finally { setLoadingModels(false); }
  };

  const saveAISettings = async () => {
    setSavingAI(true);
    try { await api.updateAISettings(aiSettings); toast.success('AI Agent settings saved!'); }
    catch (e: any) { toast.error(e.message); }
    finally { setSavingAI(false); }
  };

  const testAIAgent = async () => {
    if (!testMsg) return;
    try { setTestResult(await api.testAI(testMsg)); }
    catch (e: any) { setTestResult({ error: e.message }); }
  };

  const toggleContactAI = async (contactId: string, enabled: boolean) => {
    await api.updateContactAI(contactId, enabled);
    setContactAI(p => ({ ...p, [contactId]: enabled }));
    toast.success(enabled ? 'AI enabled for this contact' : 'AI disabled for this contact');
  };

  const loadContactAI = async (contactId: string) => {
    const r = await api.getContactAI(contactId).catch(() => ({ agent_enabled: true }));
    setContactAI(p => ({ ...p, [contactId]: r.agent_enabled }));
  };

  const openContactInfo = async () => {
    if (!activeChat) return;
    setShowContactInfo(true);
    try {
      const token = localStorage.getItem('ailaptopwala_token');
      const res = await fetch(`${API_URL}/api/whatsapp/contact/${encodeURIComponent(activeChat.id)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setContactInfo({ ...activeChat, ...data });
    } catch { setContactInfo(activeChat); }
  };

  const clearChat = async () => {
    if (!activeChat || !confirm('Clear all messages for this contact?')) return;
    const token = localStorage.getItem('ailaptopwala_token');
    // Clear from DB
    await fetch(`${API_URL}/api/whatsapp/messages/${encodeURIComponent(activeChat.id)}/clear`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    // Clear AI memory
    await api.clearAIMemory(activeChat.id).catch(() => {});
    setMessages([]);
    toast.success('Chat cleared');
    setShowContactInfo(false);
  };

  const msgAction = async (action: string, msg: any, extra?: any) => {
    const token = localStorage.getItem('ailaptopwala_token');
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
              <TabsTrigger value="agent" className="text-xs h-6 px-2.5 gap-1"><Sparkles className="h-3.5 w-3.5 text-purple-500" />Agent</TabsTrigger>
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
                <div className="flex items-center gap-2 text.xs text-muted-foreground animate-pulse">
                  <RefreshCw className="h-3.5 w-3.5" /> Waiting for scan...
                </div>
              </div>
            )}
            {['initializing','loading','authenticated'].includes(status) && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-10 w-10 text-green-500 animate-spin" />
                <p className="font-medium capitalize">{status}...</p>
              </div>
            )}
            {status === 'disconnected' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-green-500/40" />
                </div>
                <p className="font-semibold">WhatsApp Connected nahi hai</p>
                <Button onClick={connect} className="gap-2 bg-green-600 hover:bg-green-700"><QrCode className="h-4 w-4" /> Connect WhatsApp</Button>
              </div>
            )}
            {(status === 'ready' || status === 'authenticated') && (
              <WhatsAppChatPanel
                socket={socket}
                status={status}
                aiSettings={aiSettings}
                contactAI={contactAI}
                onToggleAI={toggleContactAI}
                onOpenContactInfo={openContactInfo}
              />
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
                  {['Hello', 'Laptop price', 'Order status', 'Repair booking', 'Thanks'].map(t => (
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

          {/* AGENT TAB */}
          <TabsContent value="agent" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="font-semibold">AI Agent Settings</h2>
                {!isSuperAdmin && <span className="text-[10px] text-muted-foreground bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">API Key & Prompt: Super Admin only</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Agent</span>
                <Switch checked={!!aiSettings.enabled} onCheckedChange={v => setAiSettings((s: any) => ({ ...s, enabled: v }))} />
              </div>
            </div>

            {/* LLM Provider */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">LLM Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Provider</Label>
                    <Select value={aiSettings.llm_provider || 'openrouter'} onValueChange={v => setAiSettings((s: any) => ({ ...s, llm_provider: v, llm_model: '' }))} disabled={!isSuperAdmin}>
                      <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openrouter">OpenRouter (GPT-4, Claude, Llama...)</SelectItem>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">API Key {!isSuperAdmin && '🔒'}</Label>
                    <div className="flex gap-1 mt-1">
                      <Input type="password" value={aiSettings.api_key || ''} onChange={e => setAiSettings((s: any) => ({ ...s, api_key: e.target.value }))} className="text-sm" placeholder="sk-..." disabled={!isSuperAdmin} />
                      <Button size="sm" variant="outline" onClick={loadAIModels} disabled={loadingModels || !isSuperAdmin} className="shrink-0 text-xs">
                        {loadingModels ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Load'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Model {aiModels.length > 0 ? `(${aiModels.length} available)` : ''}</Label>
                  {aiModels.length > 0 ? (
                    <Select value={aiSettings.llm_model || ''} onValueChange={v => setAiSettings((s: any) => ({ ...s, llm_model: v }))} disabled={!isSuperAdmin}>
                      <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select model..." /></SelectTrigger>
                      <SelectContent className="max-h-48">
                        {aiModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={aiSettings.llm_model || ''} onChange={e => setAiSettings((s: any) => ({ ...s, llm_model: e.target.value }))} className="mt-1 text-sm" placeholder="openai/gpt-3.5-turbo" disabled={!isSuperAdmin} />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Temperature: {aiSettings.temperature || 0.7}</Label>
                    <Slider value={[aiSettings.temperature || 0.7]} onValueChange={([v]) => setAiSettings((s: any) => ({ ...s, temperature: v }))} min={0} max={1} step={0.1} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs">Max Tokens</Label>
                    <Input type="number" value={aiSettings.max_tokens || 500} onChange={e => setAiSettings((s: any) => ({ ...s, max_tokens: Number(e.target.value) }))} className="mt-1 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Prompt */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">System Prompt {!isSuperAdmin && '🔒 Super Admin only'}</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={aiSettings.system_prompt || ''} onChange={e => setAiSettings((s: any) => ({ ...s, system_prompt: e.target.value }))} className="text-sm resize-none font-mono" rows={5} disabled={!isSuperAdmin} placeholder="You are a helpful assistant..." />
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Agent Features</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: 'feature_product_search', label: '🛍️ Product Search', desc: 'Search products from DB when customer asks' },
                  { key: 'feature_order_status', label: '📦 Order Status', desc: 'Check order status by order ID' },
                  { key: 'feature_greeting', label: '👋 Auto Greeting', desc: 'Welcome new contacts automatically' },
                  { key: 'feature_faq', label: '❓ FAQ Answers', desc: 'Answer common questions' },
                  { key: 'feature_human_handoff', label: '🙋 Human Handoff', desc: 'Alert admin when customer wants human' },
                  { key: 'feature_typing_indicator', label: '⌨️ Typing Indicator', desc: 'Show typing before reply' },
                  { key: 'feature_cart_suggest', label: '🛒 Cart Suggestions', desc: 'Suggest related products' },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/20">
                    <div>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                    </div>
                    <Switch checked={!!aiSettings[f.key]} onCheckedChange={v => setAiSettings((s: any) => ({ ...s, [f.key]: v }))} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Behavior */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Behavior Settings</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Memory (messages)</Label>
                    <Input type="number" value={aiSettings.memory_messages || 20} onChange={e => setAiSettings((s: any) => ({ ...s, memory_messages: Number(e.target.value) }))} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Daily Limit</Label>
                    <Input type="number" value={aiSettings.daily_limit || 50} onChange={e => setAiSettings((s: any) => ({ ...s, daily_limit: Number(e.target.value) }))} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Reply Delay (sec)</Label>
                    <div className="flex gap-1 mt-1">
                      <Input type="number" value={aiSettings.reply_delay_min || 1} onChange={e => setAiSettings((s: any) => ({ ...s, reply_delay_min: Number(e.target.value) }))} className="text-sm w-12" />
                      <span className="self-center text-xs">-</span>
                      <Input type="number" value={aiSettings.reply_delay_max || 3} onChange={e => setAiSettings((s: any) => ({ ...s, reply_delay_max: Number(e.target.value) }))} className="text-sm w-12" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Fallback Message</Label>
                  <Input value={aiSettings.fallback_message || ''} onChange={e => setAiSettings((s: any) => ({ ...s, fallback_message: e.target.value }))} className="mt-1 text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">AI Reply Bubble Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={aiSettings.agent_bubble_color || '#e8d5ff'} onChange={e => setAiSettings((s: any) => ({ ...s, agent_bubble_color: e.target.value }))} className="h-8 w-12 rounded cursor-pointer border" />
                      <div className="flex-1 rounded-xl px-3 py-1.5 text-xs" style={{ backgroundColor: aiSettings.agent_bubble_color || '#e8d5ff' }}>
                        <span className="text-[9px] text-purple-600 font-semibold flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> AI Agent</span>
                        Preview message bubble
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Business Hours Only</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="time" value={aiSettings.business_hours_start || '09:00'} onChange={e => setAiSettings((s: any) => ({ ...s, business_hours_start: e.target.value }))} className="text-xs h-7 w-24" disabled={!aiSettings.business_hours_enabled} />
                      <span className="text-xs">to</span>
                      <Input type="time" value={aiSettings.business_hours_end || '21:00'} onChange={e => setAiSettings((s: any) => ({ ...s, business_hours_end: e.target.value }))} className="text-xs h-7 w-24" disabled={!aiSettings.business_hours_enabled} />
                    </div>
                  </div>
                  <Switch checked={!!aiSettings.business_hours_enabled} onCheckedChange={v => setAiSettings((s: any) => ({ ...s, business_hours_enabled: v }))} />
                </div>
              </CardContent>
            </Card>

            {/* Test Agent */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" /> Test Agent</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={testMsg} onChange={e => setTestMsg(e.target.value)} placeholder="Test message..." className="text-sm" onKeyDown={e => e.key === 'Enter' && testAIAgent()} />
                  <Button size="sm" onClick={testAIAgent}>Test</Button>
                </div>
                {testResult && (
                  <div className={`p-3 rounded-xl text-sm border ${testResult.error ? 'bg-red-50 border-red-200 text-red-700' : 'border-purple-200'}`}
                    style={!testResult.error ? { backgroundColor: aiSettings.agent_bubble_color || '#e8d5ff' } : {}}>
                    {testResult.error ? testResult.error : (
                      <>
                        <p className="text-[9px] text-purple-600 font-semibold mb-1 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> AI Agent Reply</p>
                        <p>{testResult.reply}</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={saveAISettings} disabled={savingAI} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              {savingAI ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {savingAI ? 'Saving...' : 'Save AI Agent Settings'}
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Info Dialog */}
      <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Contact Info</DialogTitle></DialogHeader>
          {(contactInfo || activeChat) && (() => {
            const c = contactInfo || activeChat;
            return (
              <div className="space-y-4">
                {/* DP + Name */}
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {c.profilePic
                      ? <img src={c.profilePic} alt={c.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                      : (c.name?.charAt(0)?.toUpperCase() || '?')
                    }
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{c.name || c.pushname || c.id?.split('@')[0]}</p>
                    {c.formattedNumber && <p className="text-sm text-muted-foreground">{c.formattedNumber}</p>}
                    {c.about && <p className="text-xs text-muted-foreground mt-1 italic">"{c.about}"</p>}
                  </div>
                </div>

                {/* Details */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{c.id?.split('@')[0]}</span></div>
                  {c.isBusiness && <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge className="text-[10px]">Business</Badge></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">AI Agent</span>
                    <Switch checked={contactAI[c.id] !== false} onCheckedChange={v => toggleContactAI(c.id, v)} />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <a href={`https://wa.me/${c.id?.split('@')[0]}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs text-green-600"><Phone className="h-3.5 w-3.5" /> WhatsApp</Button>
                  </a>
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => { api.clearAIMemory(c.id); toast.success('AI memory cleared'); }}>
                    <Sparkles className="h-3.5 w-3.5" /> Clear AI Memory
                  </Button>
                </div>
                <Button variant="destructive" size="sm" className="w-full gap-1.5 text-xs" onClick={clearChat}>
                  <Trash2 className="h-3.5 w-3.5" /> Clear Chat History
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

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
