import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ArrowLeft, Send, Smile, Paperclip, Phone, MoreVertical, Check, CheckCheck, Users, RefreshCw, Sparkles, Star, Copy, Reply, Download, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AckIcon = ({ ack }: { ack: number }) => {
  if (ack >= 3) return <CheckCheck className="h-3.5 w-3.5 text-blue-400" />;
  if (ack >= 2) return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
  return <Check className="h-3.5 w-3.5 text-gray-400" />;
};

// Media message renderer
const MediaMessage = ({ msg, chatId, token }: { msg: any; chatId: string; token: string | null }) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const downloadMedia = async () => {
    if (mediaUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/media/download`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msg.id, chatId }),
      });
      const data = await res.json();
      if (data.data) setMediaUrl(`data:${data.mimetype};base64,${data.data}`);
    } catch {}
    finally { setLoading(false); }
  };

  if (msg.type === 'image' || msg.type === 'sticker') {
    return (
      <div className="cursor-pointer" onClick={downloadMedia}>
        {mediaUrl ? (
          <img src={mediaUrl} alt="image" className="max-w-[220px] rounded-lg" />
        ) : msg.jpegThumbnail ? (
          <div className="relative">
            <img src={`data:image/jpeg;base64,${msg.jpegThumbnail}`} alt="thumbnail" className="max-w-[220px] rounded-lg blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              {loading ? <RefreshCw className="h-6 w-6 animate-spin text-white" /> : <Download className="h-6 w-6 text-white" />}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>📷 {loading ? 'Loading...' : 'Tap to load image'}</span>
          </div>
        )}
        {msg.body && <p className="text-xs mt-1 text-gray-600">{msg.body}</p>}
      </div>
    );
  }

  if (msg.type === 'video') {
    return (
      <div className="cursor-pointer" onClick={downloadMedia}>
        {mediaUrl ? (
          <video src={mediaUrl} controls className="max-w-[220px] rounded-lg" />
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>🎥 {loading ? 'Loading...' : 'Tap to load video'}</span>
          </div>
        )}
      </div>
    );
  }

  if (msg.type === 'audio' || msg.type === 'ptt') {
    return (
      <div className="cursor-pointer" onClick={downloadMedia}>
        {mediaUrl ? (
          <audio src={mediaUrl} controls className="max-w-[220px]" />
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>🎤 {msg.type === 'ptt' ? 'Voice message' : 'Audio'} — {loading ? 'Loading...' : 'Tap to play'}</span>
          </div>
        )}
      </div>
    );
  }

  if (msg.type === 'document') {
    return (
      <div className="cursor-pointer" onClick={downloadMedia}>
        {mediaUrl ? (
          <a href={mediaUrl} download={msg.body || 'document'} className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
            <Download className="h-4 w-4" /> {msg.body || 'Download document'}
          </a>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>📄 {msg.body || 'Document'} — {loading ? 'Loading...' : 'Tap to download'}</span>
          </div>
        )}
      </div>
    );
  }

  return <p className="text-xs text-gray-400 italic">[{msg.type}]</p>;
};

interface Props {
  socket: any;
  status: string;
  aiSettings?: any;
  contactAI: Record<string, boolean>;
  onToggleAI: (id: string, v: boolean) => void;
  onOpenContactInfo: (chat: any) => void;
}

export const WhatsAppChatPanel = ({ socket, status, aiSettings, contactAI, onToggleAI, onOpenContactInfo }: Props) => {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [msgSearch, setMsgSearch] = useState('');
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const activeChatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('ailaptopwala_token');

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // Socket.IO real-time events
  useEffect(() => {
    if (!socket) return;
    const onChats = (list: any[]) => { if (list.length > 0) setChats(list); };
    const onMsg = (msg: any) => {
      const chatId = msg.fromMe ? msg.to : msg.from;
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMsg: msg.body, lastMsgTime: msg.time, unread: msg.fromMe ? c.unread : (c.unread || 0) + 1 } : c));
      if (activeChatRef.current?.id === chatId) {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    };
    const onSent = (msg: any) => {
      if (activeChatRef.current?.id === msg.to) {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, fromMe: true }]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    };
    const onAck = ({ id, ack }: any) => setMessages(prev => prev.map(m => m.id === id ? { ...m, ack } : m));
    const onRevoked = ({ id }: any) => setMessages(prev => prev.map(m => m.id === id ? { ...m, body: '🚫 This message was deleted', revoked: true } : m));
    const onReaction = ({ msgId, reaction }: any) => setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction } : m));

    socket.on('whatsapp:chats', onChats);
    socket.on('whatsapp:message', onMsg);
    socket.on('whatsapp:message_sent', onSent);
    socket.on('whatsapp:ack', onAck);
    socket.on('whatsapp:message_revoked', onRevoked);
    socket.on('whatsapp:reaction', onReaction);
    return () => {
      socket.off('whatsapp:chats', onChats);
      socket.off('whatsapp:message', onMsg);
      socket.off('whatsapp:message_sent', onSent);
      socket.off('whatsapp:ack', onAck);
      socket.off('whatsapp:message_revoked', onRevoked);
      socket.off('whatsapp:reaction', onReaction);
    };
  }, [socket]);

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/chats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setChats(data);
    } catch {}
    finally { setLoadingChats(false); }
  }, [token]);

  useEffect(() => { if (status === 'ready') loadChats(); }, [status]);

  // Also load on mount if already ready
  useEffect(() => { loadChats(); }, []);

  const openChat = async (chat: any) => {
    setActiveChat(chat);
    setMessages([]);
    setShowMobile(true);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    fetch(`${API_URL}/api/whatsapp/chats/${encodeURIComponent(chat.id)}/seen`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/chats/${encodeURIComponent(chat.id)}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const msgs = await res.json();
      if (Array.isArray(msgs)) {
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch {}
    finally { setLoadingMsgs(false); }
  };

  const sendMsg = async () => {
    if (!message.trim() || !activeChat) return;
    const body = message;
    setMessage('');
    try {
      await fetch(`${API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: activeChat.id, message: body }),
      });
    } catch {}
  };

  const filtered = chats.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.id?.includes(search));

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-72 lg:w-80 border-r flex flex-col shrink-0 ${showMobile ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-2 border-b flex gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={loadChats} disabled={loadingChats}>
            <RefreshCw className={`h-4 w-4 ${loadingChats ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm space-y-2">
              <p>{loadingChats ? 'Loading chats...' : 'No chats found'}</p>
              {!loadingChats && <Button size="sm" variant="outline" onClick={loadChats} className="gap-1 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>}
            </div>
          ) : filtered.map(chat => (
            <div key={chat.id} onClick={() => openChat(chat)}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 border-b transition-colors ${activeChat?.id === chat.id ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                {chat.profilePic && <img src={chat.profilePic} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />}
                {!chat.profilePic && (chat.isGroup ? <Users className="h-5 w-5" /> : (chat.name?.charAt(0)?.toUpperCase() || '?'))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{chat.name || chat.id.split('@')[0]}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{chat.lastMsgTime}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
              </div>
              {(chat.unread || 0) > 0 && <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{chat.unread}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col overflow-hidden ${!showMobile ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <span className="text-5xl">💬</span>
            <p className="text-sm">Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-card shrink-0">
              <button onClick={() => setShowMobile(false)} className="md:hidden mr-1"><ArrowLeft className="h-5 w-5" /></button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden cursor-pointer" onClick={() => onOpenContactInfo(activeChat)}>
                {activeChat.profilePic && <img src={activeChat.profilePic} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />}
                {!activeChat.profilePic && (activeChat.name?.charAt(0)?.toUpperCase() || '?')}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => onOpenContactInfo(activeChat)}>
                <p className="font-semibold text-sm">{activeChat.name || activeChat.id.split('@')[0]}</p>
                <p className="text-[10px] text-green-600">{activeChat.about || ''}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-1 shrink-0">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className="text-[10px] font-medium text-purple-700">AI</span>
                <Switch checked={contactAI[activeChat.id] !== false} onCheckedChange={v => onToggleAI(activeChat.id, v)} className="scale-75" />
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowMsgSearch(v => !v)}><Search className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </div>
            {showMsgSearch && (
              <div className="px-3 py-1.5 border-b bg-card">
                <Input placeholder="Search in chat..." className="h-8 text-sm" value={msgSearch} onChange={e => setMsgSearch(e.target.value)} autoFocus />
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5ddd5' opacity='0.3'/%3E%3C/svg%3E\")" }}>
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : messages.filter(m => !msgSearch || m.body?.toLowerCase().includes(msgSearch.toLowerCase())).map((msg, i) => (
                <div key={i} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[72%] rounded-2xl px-3 py-2 shadow-sm text-sm ${msg.fromMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}
                    style={msg.isAI ? { backgroundColor: aiSettings?.agent_bubble_color || '#e8d5ff' } : {}}>
                    {msg.isAI && <p className="text-[9px] text-purple-600 font-semibold mb-0.5 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" />AI Agent</p>}
                    {/* Quoted reply */}
                    {msg.quotedMsg && (
                      <div className="border-l-4 border-green-500 bg-black/5 rounded px-2 py-1 mb-1 text-xs text-gray-500 truncate">
                        {msg.quotedMsg.body || '[media]'}
                      </div>
                    )}
                    {/* Media or text */}
                    {msg.hasMedia ? (
                      <MediaMessage msg={msg} chatId={activeChat.id} token={token} />
                    ) : (
                      <p className={`text-gray-800 whitespace-pre-wrap break-words ${msg.revoked ? 'italic text-gray-400' : ''}`}>{msg.body}</p>
                    )}
                    {msg.reaction && <span className="text-sm">{msg.reaction}</span>}
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {msg.isStarred && <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />}
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                      {msg.fromMe && <AckIcon ack={msg.ack || 1} />}
                    </div>
                  </div>
                  {/* Action buttons on hover */}
                  <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${msg.fromMe ? 'order-first mr-1' : 'ml-1'}`}>
                    <button onClick={() => setReplyTo(msg)} className="p-1 rounded-full hover:bg-gray-200" title="Reply"><Reply className="h-3.5 w-3.5 text-gray-500" /></button>
                    <button onClick={() => { navigator.clipboard.writeText(msg.body || ''); toast.success('Copied!'); }} className="p-1 rounded-full hover:bg-gray-200" title="Copy"><Copy className="h-3.5 w-3.5 text-gray-500" /></button>
                    <button onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: !m.isStarred } : m))} className="p-1 rounded-full hover:bg-gray-200" title="Star"><Star className={`h-3.5 w-3.5 ${msg.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} /></button>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 py-2 border-t bg-[#f0f2f5] flex flex-col gap-1 shrink-0">
              {replyTo && (
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 text-xs border-l-4 border-green-500">
                  <Reply className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span className="flex-1 truncate text-gray-600">{replyTo.body || '[media]'}</span>
                  <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-gray-500"><Smile className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-gray-500"><Paperclip className="h-5 w-5" /></Button>
                <Input value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                  placeholder="Type a message" className="flex-1 h-9 text-sm rounded-full bg-white border-0 shadow-sm" />
                <Button size="icon" className="h-9 w-9 rounded-full shrink-0 bg-green-500 hover:bg-green-600 border-0" onClick={sendMsg} disabled={!message.trim()}>
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
