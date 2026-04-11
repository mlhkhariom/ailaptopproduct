import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Send, Search, Phone, Video, Smile, Mic, CheckCheck,
  Clock, ArrowLeft, QrCode, Wifi, WifiOff, Plus, Trash2, Play, Edit,
  Zap, Bot, Sparkles, X, Users, BarChart3, Tag, Globe, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminLayout from "@/components/AdminLayout";
import { whatsappTemplates } from "@/data/mockData";
import { useProductStore } from "@/store/productStore";
import { useWhatsAppStore, type AutoReplyRule } from "@/store/whatsappStore";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContact {
  id: number; name: string; phone: string; avatar: string; lastMsg: string;
  lastMsgTime: string; unread: number; online: boolean; typing: boolean;
  pinned: boolean; muted: boolean; lastSeen?: string; label?: "customer" | "new" | "vip" | "supplier";
}

interface ChatMessage {
  id: number; text: string; time: string; fromMe: boolean;
  status: "sent" | "delivered" | "read"; replyTo?: string;
  media?: { type: "image" | "document"; name?: string; url?: string }; starred?: boolean;
}

const contacts: ChatContact[] = [
  { id: 1, name: "Priya Sharma", phone: "+91 98765 43210", avatar: "PS", lastMsg: "Ashwagandha ka dose kitna lena chahiye?", lastMsgTime: "2:34 PM", unread: 3, online: true, typing: false, pinned: true, muted: false, label: "vip" },
  { id: 2, name: "Rahul Verma", phone: "+91 87654 32109", avatar: "RV", lastMsg: "Order APC-002 kab deliver hoga?", lastMsgTime: "1:15 PM", unread: 1, online: false, typing: false, pinned: true, muted: false, lastSeen: "12:45 PM", label: "customer" },
  { id: 3, name: "Anita Desai", phone: "+91 76543 21098", avatar: "AD", lastMsg: "Thank you doctor! Product is amazing 🙏", lastMsgTime: "11:30 AM", unread: 0, online: false, typing: false, pinned: false, muted: false, lastSeen: "11:28 AM" },
  { id: 4, name: "Vikram Singh", phone: "+91 99887 76655", avatar: "VS", lastMsg: "Triphala aur Tulsi Tea dono chahiye", lastMsgTime: "10:20 AM", unread: 0, online: true, typing: true, pinned: false, muted: false, label: "customer" },
  { id: 5, name: "Meera Patel", phone: "+91 88776 65544", avatar: "MP", lastMsg: "Brahmi Tonic ka result bahut acha hai", lastMsgTime: "Yesterday", unread: 0, online: false, typing: false, pinned: false, muted: true, lastSeen: "Yesterday" },
  { id: 6, name: "Arjun Nair", phone: "+91 77665 54433", avatar: "AN", lastMsg: "Bhringraj Oil ka stock kab aayega?", lastMsgTime: "Yesterday", unread: 0, online: false, typing: false, pinned: false, muted: false, lastSeen: "Yesterday", label: "customer" },
  { id: 7, name: "Sunita Gupta", phone: "+91 66554 43322", avatar: "SG", lastMsg: "Payment fail ho gaya, dobara try karun?", lastMsgTime: "Mon", unread: 0, online: false, typing: false, pinned: false, muted: false, lastSeen: "Monday" },
  { id: 8, name: "Karan Mehta", phone: "+91 55443 32211", avatar: "KM", lastMsg: "Bulk order ke liye discount milega?", lastMsgTime: "Mon", unread: 2, online: false, typing: false, pinned: false, muted: false, label: "new" },
];

const chatMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, text: "Namaste Doctor! 🙏", time: "2:10 PM", fromMe: false, status: "read" },
    { id: 2, text: "Mujhe Ashwagandha powder lena hai, kya ye stress ke liye kaam karega?", time: "2:11 PM", fromMe: false, status: "read" },
    { id: 3, text: "Namaste Priya ji! 🌿 Haan bilkul, Ashwagandha stress relief ke liye bahut effective hai.", time: "2:15 PM", fromMe: true, status: "read" },
    { id: 4, text: "Aapko din mein 2 baar, subah aur raat ko, aadha chammach garam doodh ke saath lena hai.", time: "2:16 PM", fromMe: true, status: "read" },
    { id: 5, text: "Ashwagandha ka dose kitna lena chahiye?", time: "2:34 PM", fromMe: false, status: "delivered" },
  ],
  2: [
    { id: 1, text: "Hello, mera order APC-002 ka status kya hai?", time: "12:30 PM", fromMe: false, status: "read" },
    { id: 2, text: "Rahul ji, aapka order ship ho chuka hai! BlueDart tracking: BLUEDART987654 🚚", time: "12:45 PM", fromMe: true, status: "read" },
    { id: 3, text: "Order APC-002 kab deliver hoga?", time: "1:15 PM", fromMe: false, status: "read" },
  ],
  4: [
    { id: 1, text: "Hello ji, mujhe 2 products chahiye", time: "10:00 AM", fromMe: false, status: "read" },
    { id: 2, text: "Triphala aur Tulsi Tea dono chahiye", time: "10:20 AM", fromMe: false, status: "read" },
  ],
  8: [
    { id: 1, text: "Namaste, hum Ayurvedic store hain Delhi mein", time: "Mon", fromMe: false, status: "read" },
    { id: 2, text: "Bulk order ke liye discount milega?", time: "Mon", fromMe: false, status: "delivered" },
  ],
};

const AdminWhatsApp = () => {
  const isMobile = useIsMobile();
  const [activeChat, setActiveChat] = useState<number | null>(isMobile ? null : 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [mainTab, setMainTab] = useState<"chats" | "automation" | "analytics">("chats");
  const [chatFilter, setChatFilter] = useState("all");
  const [isConnected, setIsConnected] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { rules, addRule, updateRule, deleteRule, toggleRule, matchMessage, simulatedMessages, addSimulatedMessage, clearSimulation } = useWhatsAppStore();
  const { products } = useProductStore();
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [ruleForm, setRuleForm] = useState({ name: "", keywords: "", responseTemplate: "", type: "custom" as AutoReplyRule["type"], isActive: true });
  const [simInput, setSimInput] = useState("");

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [activeChat, simulatedMessages]);

  const activeContact = contacts.find((c) => c.id === activeChat);
  const messages = activeChat ? chatMessages[activeChat] || [] : [];
  const filteredContacts = contacts.filter((c) => {
    if (chatFilter === "unread") return c.unread > 0;
    if (chatFilter === "pinned") return c.pinned;
    return true;
  }).filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
    .sort((a, b) => (a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : 0));

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  const handleSendMessage = () => { if (!message.trim()) return; toast.success("Message sent!"); setMessage(""); };

  const handleSelectChat = (id: number) => {
    setActiveChat(id);
    if (isMobile) setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setActiveChat(null);
  };

  const openAddRule = () => {
    setEditingRule(null);
    setRuleForm({ name: "", keywords: "", responseTemplate: "", type: "custom", isActive: true });
    setRuleDialog(true);
  };

  const openEditRule = (rule: AutoReplyRule) => {
    setEditingRule(rule);
    setRuleForm({ name: rule.name, keywords: rule.keywords.join(", "), responseTemplate: rule.responseTemplate, type: rule.type, isActive: rule.isActive });
    setRuleDialog(true);
  };

  const saveRule = () => {
    if (!ruleForm.name || !ruleForm.keywords || !ruleForm.responseTemplate) {
      toast.error("All fields required!"); return;
    }
    const keywords = ruleForm.keywords.split(",").map(k => k.trim()).filter(Boolean);
    if (editingRule) {
      updateRule(editingRule.id, { ...ruleForm, keywords });
      toast.success("Rule updated!");
    } else {
      addRule({ ...ruleForm, keywords });
      toast.success("Rule added!");
    }
    setRuleDialog(false);
  };

  const handleSimulate = () => {
    if (!simInput.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    addSimulatedMessage({ text: simInput, time: now, fromMe: false });

    const matchedRule = matchMessage(simInput);
    if (matchedRule) {
      let response = matchedRule.responseTemplate;
      const productMatch = products.find(p =>
        simInput.toLowerCase().includes(p.name.toLowerCase()) ||
        (p.nameHi && simInput.includes(p.nameHi))
      );
      if (productMatch) {
        response = response
          .replace("{{product_name}}", productMatch.name)
          .replace("{{price}}", `₹${productMatch.price}`)
          .replace("{{original_price_info}}", productMatch.originalPrice ? `(MRP: ₹${productMatch.originalPrice})` : "")
          .replace("{{slug}}", productMatch.slug)
          .replace("{{stock_status}}", productMatch.inStock ? "उपलब्ध ✅" : "Out of Stock ❌")
          .replace("{{stock_info}}", productMatch.inStock ? `Stock: ${productMatch.stock} units` : "जल्द आ रहा है!");
      }
      response = response.replace(/\{\{[^}]+\}\}/g, "[N/A]");
      setTimeout(() => {
        addSimulatedMessage({ text: `🤖 ${response}`, time: now, fromMe: true, isBot: true });
      }, 600);
    } else {
      setTimeout(() => {
        addSimulatedMessage({ text: "🤖 कोई matching rule नहीं मिला। Manual reply needed.", time: now, fromMe: true, isBot: true });
      }, 600);
    }
    setSimInput("");
  };

  // Stats for analytics tab
  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.isActive).length;
  const totalMatches = rules.reduce((s, r) => s + r.matchCount, 0);
  const topRule = [...rules].sort((a, b) => b.matchCount - a.matchCount)[0];

  // === Contact list sidebar ===
  const ContactList = () => (
    <div className={`flex flex-col bg-card ${isMobile ? "w-full" : "w-[300px] lg:w-[340px] border-r shrink-0"}`}>
      {/* Profile header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-primary-foreground font-bold text-xs">DP</div>
            <div>
              <p className="text-sm font-medium">Dr. Prachi</p>
              <p className="text-[10px] text-green-600">Apsoncure PHC</p>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1 text-[9px] h-5">
            {isConnected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {isConnected ? "Live" : "Off"}
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search or start new chat" className="pl-9 h-9 text-xs rounded-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: `Unread${totalUnread > 0 ? ` (${totalUnread})` : ""}` },
            { key: "pinned", label: "Pinned" },
          ].map((f) => (
            <button key={f.key} onClick={() => setChatFilter(f.key)} className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${chatFilter === f.key ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredContacts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No chats found</p>
        )}
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => handleSelectChat(contact.id)}
            className={`flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-all active:scale-[0.98] ${activeChat === contact.id && !isMobile ? "bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-600" : "hover:bg-muted/30"}`}
          >
            <div className="relative shrink-0">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-xs ${contact.label === "vip" ? "bg-amber-500" : contact.label === "new" ? "bg-emerald-500" : contact.label === "supplier" ? "bg-purple-500" : "bg-slate-400"}`}>
                {contact.avatar}
              </div>
              {contact.online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{contact.name}</span>
                  {contact.label && (
                    <Badge variant="outline" className="text-[8px] h-4 px-1 capitalize">{contact.label}</Badge>
                  )}
                </div>
                <span className={`text-[10px] shrink-0 ${contact.unread > 0 ? "text-green-600 font-semibold" : "text-muted-foreground"}`}>{contact.lastMsgTime}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-muted-foreground truncate pr-2">
                  {contact.typing ? <span className="text-green-600 italic">typing...</span> : contact.lastMsg}
                </p>
                {contact.unread > 0 && <span className="h-5 min-w-[20px] rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">{contact.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  // === Chat window ===
  const ChatWindow = () => (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Chat header */}
      <div className="h-14 px-3 sm:px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleBackToList}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${activeContact?.label === "vip" ? "bg-amber-500" : "bg-slate-400"}`}>
            {activeContact?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{activeContact?.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeContact?.typing ? <span className="text-green-600">typing...</span> : activeContact?.online ? <span className="text-green-600">online</span> : `last seen ${activeContact?.lastSeen || "recently"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hidden sm:flex"><Phone className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hidden sm:flex"><Video className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-12 py-4 min-h-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}>
        <div className="flex justify-center mb-4">
          <span className="bg-muted/80 text-[10px] text-muted-foreground px-3 py-1 rounded-lg shadow-sm">Today</span>
        </div>
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No messages yet</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-2 ${msg.fromMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] sm:max-w-[65%] px-3 py-2 rounded-xl shadow-sm ${msg.fromMe ? "bg-green-100 dark:bg-green-900/40 rounded-tr-sm" : "bg-card rounded-tl-sm border"}`}>
              <p className="text-[13px] leading-relaxed break-words">{msg.text}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[10px] text-muted-foreground/70">{msg.time}</span>
                {msg.fromMe && (msg.status === "read" ? <CheckCheck className="h-3.5 w-3.5 text-blue-500" /> : <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/50" />)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-2 sm:px-3 py-2 border-t bg-muted/30 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground shrink-0 hidden sm:flex"><Smile className="h-5 w-5" /></Button>
          <Input
            placeholder="Type a message"
            className="flex-1 h-10 rounded-xl text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          {message.trim() ? (
            <Button size="icon" className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 shrink-0" onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground shrink-0"><Mic className="h-5 w-5" /></Button>
          )}
        </div>
      </div>
    </div>
  );

  const EmptyChat = () => (
    <div className="flex-1 flex items-center justify-center bg-muted/5">
      <div className="text-center px-4">
        <div className="h-24 w-24 rounded-full bg-green-50 dark:bg-green-950/20 mx-auto mb-4 flex items-center justify-center">
          <MessageCircle className="h-12 w-12 text-green-600/40" />
        </div>
        <h2 className="text-lg font-light text-foreground/80 mb-1">WhatsApp Business</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">Send and receive messages. Connect your WhatsApp Business account to get started.</p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground">WhatsApp Business</h1>
            {totalUnread > 0 && <Badge className="bg-green-600 text-white text-[10px] h-5">{totalUnread} new</Badge>}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="flex-1 sm:flex-none">
              <TabsList className="h-8 w-full sm:w-auto grid grid-cols-3 sm:flex">
                <TabsTrigger value="chats" className="text-[10px] sm:text-xs h-7 gap-1"><MessageCircle className="h-3 w-3" /> <span className="hidden xs:inline">Chats</span></TabsTrigger>
                <TabsTrigger value="automation" className="text-[10px] sm:text-xs h-7 gap-1"><Zap className="h-3 w-3" /> <span className="hidden xs:inline">Auto</span></TabsTrigger>
                <TabsTrigger value="analytics" className="text-[10px] sm:text-xs h-7 gap-1"><BarChart3 className="h-3 w-3" /> <span className="hidden xs:inline">Stats</span></TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="gap-1 text-[10px] h-8 shrink-0" onClick={() => setShowQR(true)}>
              <QrCode className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isConnected ? "Reconnect" : "Scan QR"}</span>
            </Button>
          </div>
        </div>

        {/* CHATS TAB */}
        {mainTab === "chats" && (
          <div className="flex-1 flex rounded-xl border overflow-hidden bg-background shadow-sm min-h-0">
            {/* Mobile: show list or chat */}
            {isMobile ? (
              showMobileChat && activeContact ? <ChatWindow /> : <ContactList />
            ) : (
              <>
                <ContactList />
                {activeContact ? <ChatWindow /> : <EmptyChat />}
              </>
            )}
          </div>
        )}

        {/* AUTOMATION TAB */}
        {mainTab === "automation" && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Rules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2"><Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" /> Auto-Reply Rules</h2>
                  <Button size="sm" className="gap-1 text-[10px] sm:text-xs h-7 sm:h-8" onClick={openAddRule}><Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Add</Button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {rules.map((rule) => (
                    <Card key={rule.id} className={`transition-all ${!rule.isActive ? "opacity-50" : ""}`}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <Badge variant={rule.type === "greeting" ? "default" : rule.type === "product" ? "secondary" : "outline"} className="text-[9px] sm:text-[10px] shrink-0">
                              {rule.type}
                            </Badge>
                            <span className="font-medium text-xs sm:text-sm truncate">{rule.name}</span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} className="scale-75 sm:scale-100" />
                            <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={() => openEditRule(rule)}><Edit className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" onClick={() => { deleteRule(rule.id); toast.success("Deleted!"); }}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {rule.keywords.slice(0, isMobile ? 3 : 5).map((kw) => (
                            <Badge key={kw} variant="outline" className="text-[9px] sm:text-[10px]">{kw}</Badge>
                          ))}
                          {rule.keywords.length > (isMobile ? 3 : 5) && <Badge variant="outline" className="text-[9px]">+{rule.keywords.length - (isMobile ? 3 : 5)}</Badge>}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{rule.responseTemplate}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Matched {rule.matchCount}×</p>
                          <Badge variant={rule.isActive ? "default" : "secondary"} className="text-[8px] h-4">
                            {rule.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Simulator + Product Bot */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Simulator</h2>
                    <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={clearSimulation}>Clear</Button>
                  </div>

                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Test auto-reply rules:</p>
                      <div className="flex gap-2 mb-3">
                        <Input placeholder="e.g. Ashwagandha price kya hai?" value={simInput} onChange={(e) => setSimInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSimulate()} className="h-9 text-xs sm:text-sm" />
                        <Button size="sm" className="gap-1 h-9 bg-green-600 hover:bg-green-700 shrink-0" onClick={handleSimulate}><Play className="h-3.5 w-3.5" /></Button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {["Hello", "Ashwagandha price", "Order status", "Stock?", "Thanks"].map((q) => (
                          <Button key={q} variant="outline" size="sm" className="text-[9px] sm:text-[10px] h-5 sm:h-6 px-2" onClick={() => setSimInput(q)}>{q}</Button>
                        ))}
                      </div>

                      {/* Chat simulation area */}
                      <div className="bg-muted/20 rounded-lg p-2 sm:p-3 min-h-[160px] max-h-[350px] overflow-y-auto space-y-2 border">
                        {simulatedMessages.length === 0 && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground text-center py-6">Send a test message above!</p>
                        )}
                        {simulatedMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs ${msg.fromMe ? (msg.isBot ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" : "bg-primary text-primary-foreground") : "bg-card border"}`}>
                              <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                              <p className="text-[8px] sm:text-[9px] text-right mt-0.5 opacity-60">{msg.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Product Lookup */}
                <Card>
                  <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2"><Bot className="h-4 w-4" /> Product Lookup Bot</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Generate auto-reply from product data:</p>
                    <Select onValueChange={(v) => {
                      const p = products.find(pr => pr.id === v);
                      if (p) {
                        const msg = `🌿 *${p.name}*${p.nameHi ? ` (${p.nameHi})` : ""}\n\n💰 Price: ₹${p.price}${p.originalPrice ? ` (MRP: ₹${p.originalPrice})` : ""}\n📦 ${p.inStock ? `In Stock (${p.stock} units)` : "Out of Stock"}\n\n${p.description}\n\n🔗 apsoncure.com/products/${p.slug}`;
                        setMessage(msg);
                        setMainTab("chats");
                        toast.success("Product loaded in chat!");
                      }
                    }}>
                      <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue placeholder="Select product..." /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{p.name}</span>
                              <span className="text-muted-foreground shrink-0">₹{p.price}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {mainTab === "analytics" && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total Contacts</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold">{contacts.length}</p>
                  <p className="text-[10px] text-green-600">{contacts.filter(c => c.online).length} online</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Auto Rules</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold">{totalRules}</p>
                  <p className="text-[10px] text-green-600">{activeRules} active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-4 w-4 text-green-500" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Bot Replies</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold">{totalMatches}</p>
                  <p className="text-[10px] text-muted-foreground">auto-matched</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Unread</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold">{totalUnread}</p>
                  <p className="text-[10px] text-orange-500">pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Top rules performance */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rule Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="space-y-3">
                  {[...rules].sort((a, b) => b.matchCount - a.matchCount).map((rule, i) => (
                    <div key={rule.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium truncate">{rule.name}</span>
                          <span className="text-xs font-bold text-foreground shrink-0">{rule.matchCount}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${topRule ? (rule.matchCount / topRule.matchCount) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <Badge variant={rule.isActive ? "default" : "secondary"} className="text-[8px] h-4 shrink-0">
                        {rule.isActive ? "On" : "Off"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact labels */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Tag className="h-4 w-4" /> Contact Labels</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "VIP", count: contacts.filter(c => c.label === "vip").length, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
                    { label: "Customer", count: contacts.filter(c => c.label === "customer").length, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
                    { label: "New", count: contacts.filter(c => c.label === "new").length, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
                    { label: "Unlabeled", count: contacts.filter(c => !c.label).length, color: "bg-muted text-muted-foreground" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-3 text-center ${item.color}`}>
                      <p className="text-lg sm:text-xl font-bold">{item.count}</p>
                      <p className="text-[10px] sm:text-xs">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-center">Scan QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="h-44 w-44 sm:h-52 sm:w-52 border-2 border-dashed border-green-300 rounded-2xl flex items-center justify-center bg-green-50 dark:bg-green-950/20 mb-4">
              <QrCode className="h-16 w-16 sm:h-20 sm:w-20 text-green-600" />
            </div>
            <p className="text-xs sm:text-sm text-center text-muted-foreground">Open WhatsApp → Linked Devices → Scan</p>
            <Button size="sm" className="mt-4" onClick={() => { setIsConnected(!isConnected); setShowQR(false); toast.success(isConnected ? "Disconnected" : "Connected!"); }}>
              {isConnected ? "Disconnect" : "Simulate Connect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rule Dialog */}
      <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader><DialogTitle className="text-sm sm:text-base">{editingRule ? "Edit Rule" : "Add Auto-Reply Rule"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-[10px] sm:text-xs">Rule Name</Label>
              <Input className="mt-1 h-9 text-sm" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="e.g. Price Inquiry" />
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs">Type</Label>
              <Select value={ruleForm.type} onValueChange={(v) => setRuleForm({ ...ruleForm, type: v as any })}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["greeting", "product", "order", "custom"].map(t => (
                    <SelectItem key={t} value={t} className="capitalize text-sm">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs">Keywords (comma separated)</Label>
              <Input className="mt-1 h-9 text-sm" value={ruleForm.keywords} onChange={(e) => setRuleForm({ ...ruleForm, keywords: e.target.value })} placeholder="price, rate, कीमत" />
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs">Response Template</Label>
              <Textarea className="mt-1 text-sm" rows={3} value={ruleForm.responseTemplate} onChange={(e) => setRuleForm({ ...ruleForm, responseTemplate: e.target.value })} placeholder="Use {{product_name}}, {{price}} etc." />
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">Variables: {"{{product_name}} {{price}} {{stock_status}} {{order_id}} {{tracking_id}}"}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRuleDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={saveRule}>{editingRule ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
