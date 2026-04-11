import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Send, Search, MoreVertical, Phone, Video, Smile, Paperclip,
  Mic, Check, CheckCheck, Image, FileText, Camera, Star, Archive, Pin,
  Clock, ArrowLeft, QrCode, Wifi, WifiOff, Settings, Users, Bell, BellOff,
  Copy, Trash2, Forward, Reply, Plus, Download, Filter, ChevronDown, X, Bot,
  Zap, Play, Edit, ToggleLeft, ToggleRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminLayout from "@/components/AdminLayout";
import { whatsappTemplates } from "@/data/mockData";
import { useProductStore } from "@/store/productStore";
import { useWhatsAppStore, type AutoReplyRule } from "@/store/whatsappStore";
import { toast } from "sonner";

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
};

const labelColors: Record<string, string> = { customer: "bg-blue-500", new: "bg-green-500", vip: "bg-yellow-500", supplier: "bg-purple-500" };

const AdminWhatsApp = () => {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [mainTab, setMainTab] = useState<"chats" | "automation">("chats");
  const [chatFilter, setChatFilter] = useState("all");
  const [isConnected, setIsConnected] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappTemplates[0]);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automation state
  const { rules, addRule, updateRule, deleteRule, toggleRule, matchMessage, simulatedMessages, addSimulatedMessage, clearSimulation } = useWhatsAppStore();
  const { products } = useProductStore();
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [ruleForm, setRuleForm] = useState({ name: "", keywords: "", responseTemplate: "", type: "custom" as AutoReplyRule["type"], isActive: true });
  const [simInput, setSimInput] = useState("");

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [activeChat]);

  const activeContact = contacts.find((c) => c.id === activeChat);
  const messages = activeChat ? chatMessages[activeChat] || [] : [];
  const filteredContacts = contacts.filter((c) => {
    if (chatFilter === "unread") return c.unread > 0;
    if (chatFilter === "pinned") return c.pinned;
    return true;
  }).filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
    .sort((a, b) => (a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : 0));

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  const getTemplatePreview = () => {
    let msg = selectedTemplate.message;
    selectedTemplate.variables.forEach((v) => { msg = msg.replace(`{{${v}}}`, previewValues[v] || `[${v}]`); });
    return msg;
  };

  const handleSendMessage = () => { if (!message.trim()) return; setMessage(""); };

  // Automation handlers
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
      toast.error("All fields are required!"); return;
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
      // Smart product lookup
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
      }, 500);
    } else {
      setTimeout(() => {
        addSimulatedMessage({ text: "🤖 कोई matching rule नहीं मिला। Manual reply needed.", time: now, fromMe: true, isBot: true });
      }, 500);
    }
    setSimInput("");
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-serif font-bold">WhatsApp</h1>
            <Badge variant={isConnected ? "default" : "destructive"} className="gap-1 text-[10px] h-5">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="chats" className="text-xs h-7 gap-1"><MessageCircle className="h-3 w-3" /> Chats</TabsTrigger>
                <TabsTrigger value="automation" className="text-xs h-7 gap-1"><Zap className="h-3 w-3" /> Automation</TabsTrigger>
              </TabsList>
            </Tabs>
            <Dialog open={showQR} onOpenChange={setShowQR}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setShowQR(true)}>
                <QrCode className="h-3.5 w-3.5" /> {isConnected ? "Reconnect" : "Scan QR"}
              </Button>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle className="text-center">Scan QR Code</DialogTitle></DialogHeader>
                <div className="flex flex-col items-center py-6">
                  <div className="h-52 w-52 border-2 border-dashed border-green-300 rounded-2xl flex items-center justify-center bg-green-50 dark:bg-green-950/20 mb-4">
                    <QrCode className="h-20 w-20 text-green-600" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">Open WhatsApp → Linked Devices → Scan</p>
                  <Button size="sm" className="mt-4" onClick={() => { setIsConnected(!isConnected); setShowQR(false); }}>
                    {isConnected ? "Disconnect" : "Simulate Connect"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* CHATS TAB */}
        {mainTab === "chats" && (
          <div className="flex-1 flex rounded-xl border overflow-hidden bg-background shadow-sm min-h-0">
            {/* Left Sidebar */}
            <div className="w-[320px] border-r flex flex-col bg-card shrink-0">
              <div className="p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-primary-foreground font-bold text-xs">DP</div>
                  <div><p className="text-sm font-medium">Dr. Prachi</p><p className="text-[10px] text-green-600">Apsoncure PHC</p></div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search chats..." className="pl-9 h-9 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {["all", "unread", "pinned"].map((f) => (
                    <button key={f} onClick={() => setChatFilter(f)} className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${chatFilter === f ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <ScrollArea className="flex-1">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} onClick={() => setActiveChat(contact.id)} className={`flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-colors ${activeChat === contact.id ? "bg-muted/40" : "hover:bg-muted/20"}`}>
                    <div className="relative shrink-0">
                      <div className={`h-11 w-11 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs ${contact.label === "vip" ? "bg-yellow-500" : contact.label === "new" ? "bg-green-500" : "bg-muted-foreground/50"}`}>{contact.avatar}</div>
                      {contact.online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{contact.name}</span>
                        <span className={`text-[11px] shrink-0 ${contact.unread > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}`}>{contact.lastMsgTime}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground truncate pr-2">
                          {contact.typing ? <span className="text-green-600 italic">typing...</span> : contact.lastMsg}
                        </p>
                        {contact.unread > 0 && <span className="h-5 min-w-[20px] rounded-full bg-green-500 text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">{contact.unread}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Chat Window */}
            {activeContact ? (
              <div className="flex-1 flex flex-col min-w-0">
                <div className="h-14 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs ${activeContact.label === "vip" ? "bg-yellow-500" : "bg-muted-foreground/50"}`}>{activeContact.avatar}</div>
                    <div>
                      <p className="text-sm font-medium">{activeContact.name}</p>
                      <p className="text-[11px] text-muted-foreground">{activeContact.typing ? <span className="text-green-600">typing...</span> : activeContact.online ? <span className="text-green-600">online</span> : `last seen ${activeContact.lastSeen || "recently"}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Phone className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Video className="h-5 w-5" /></Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-12 py-4 min-h-0 bg-muted/10">
                  <div className="flex justify-center mb-4">
                    <span className="bg-muted/80 text-[11px] text-muted-foreground px-3 py-1 rounded-lg">Today</span>
                  </div>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex mb-1 ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm ${msg.fromMe ? "bg-green-100 dark:bg-green-900/40 rounded-tr-none" : "bg-card rounded-tl-none"}`}>
                        <p className="text-[13px] leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground/70">{msg.time}</span>
                          {msg.fromMe && (msg.status === "read" ? <CheckCheck className="h-3.5 w-3.5 text-blue-500" /> : <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/50" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-3 py-2 border-t bg-muted/30 shrink-0">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Smile className="h-6 w-6" /></Button>
                    <Input placeholder="Type a message" className="flex-1 h-10 rounded-lg text-sm" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} />
                    {message.trim() ? (
                      <Button size="icon" className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 shrink-0" onClick={handleSendMessage}><Send className="h-5 w-5" /></Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Mic className="h-6 w-6" /></Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/10">
                <div className="text-center">
                  <MessageCircle className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
                  <h2 className="text-xl font-light text-foreground/80 mb-2">WhatsApp Web</h2>
                  <p className="text-sm text-muted-foreground">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUTOMATION TAB */}
        {mainTab === "automation" && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Rules List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Auto-Reply Rules</h2>
                  <Button size="sm" className="gap-1.5 text-xs h-8" onClick={openAddRule}><Plus className="h-3.5 w-3.5" /> Add Rule</Button>
                </div>

                <div className="space-y-3">
                  {rules.map((rule) => (
                    <Card key={rule.id} className={`transition-all ${!rule.isActive ? "opacity-60" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={rule.type === "greeting" ? "default" : rule.type === "product" ? "secondary" : rule.type === "order" ? "outline" : "secondary"} className="text-[10px]">
                              {rule.type}
                            </Badge>
                            <span className="font-medium text-sm">{rule.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRule(rule)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteRule(rule.id); toast.success("Rule deleted!"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {rule.keywords.map((kw) => (
                            <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{rule.responseTemplate}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">Matched {rule.matchCount} times</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Simulator */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Message Simulator</h2>
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={clearSimulation}>Clear</Button>
                </div>

                <Card className="mb-4">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">Test your auto-reply rules. Type a message as if a customer sent it:</p>
                    <div className="flex gap-2 mb-4">
                      <Input placeholder="e.g. Ashwagandha ka price kya hai?" value={simInput} onChange={(e) => setSimInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSimulate()} className="h-9 text-sm" />
                      <Button size="sm" className="gap-1 h-9 bg-green-600 hover:bg-green-700" onClick={handleSimulate}><Play className="h-3.5 w-3.5" /> Send</Button>
                    </div>

                    {/* Quick test buttons */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <p className="text-[10px] text-muted-foreground w-full mb-1">Quick test:</p>
                      {["Hello", "Ashwagandha price", "Order status APC-001", "Stock available?", "Thank you"].map((q) => (
                        <Button key={q} variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => { setSimInput(q); }}>
                          {q}
                        </Button>
                      ))}
                    </div>

                    {/* Chat simulation */}
                    <div className="bg-muted/30 rounded-lg p-3 min-h-[200px] max-h-[400px] overflow-y-auto space-y-2">
                      {simulatedMessages.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Send a test message above!</p>
                      )}
                      {simulatedMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${msg.fromMe ? (msg.isBot ? "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700" : "bg-primary text-primary-foreground") : "bg-card border"}`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <p className="text-[9px] text-right mt-1 opacity-60">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Lookup */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Bot className="h-4 w-4" /> Product Lookup Bot</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground mb-3">Select a product to generate an auto-reply message:</p>
                    <Select onValueChange={(v) => {
                      const p = products.find(pr => pr.id === v);
                      if (p) {
                        const msg = `🌿 *${p.name}*${p.nameHi ? ` (${p.nameHi})` : ""}\n\n💰 Price: ₹${p.price}${p.originalPrice ? ` (MRP: ₹${p.originalPrice})` : ""}\n📦 ${p.inStock ? `In Stock (${p.stock} units)` : "Out of Stock"}\n\n${p.description}\n\n🔗 apsoncure.com/products/${p.slug}`;
                        setMessage(msg);
                        setMainTab("chats");
                        toast.success("Product info loaded in chat!");
                      }
                    }}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select product..." /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-muted-foreground">₹{p.price}</span>
                              <Badge variant={p.inStock ? "default" : "destructive"} className="text-[8px] h-4">{p.inStock ? "In Stock" : "Out"}</Badge>
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
      </div>

      {/* Rule Add/Edit Dialog */}
      <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingRule ? "Edit Rule" : "Add Auto-Reply Rule"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Rule Name</Label>
              <Input className="mt-1 h-9" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="e.g. Price Inquiry" />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={ruleForm.type} onValueChange={(v) => setRuleForm({ ...ruleForm, type: v as any })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="greeting">Greeting</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Keywords (comma separated)</Label>
              <Input className="mt-1 h-9" value={ruleForm.keywords} onChange={(e) => setRuleForm({ ...ruleForm, keywords: e.target.value })} placeholder="price, rate, kitna, कीमत" />
            </div>
            <div>
              <Label className="text-xs">Response Template</Label>
              <Textarea className="mt-1" rows={4} value={ruleForm.responseTemplate} onChange={(e) => setRuleForm({ ...ruleForm, responseTemplate: e.target.value })} placeholder="Use {{product_name}}, {{price}} etc." />
              <p className="text-[10px] text-muted-foreground mt-1">Variables: {"{{product_name}}, {{price}}, {{stock_status}}, {{order_id}}, {{tracking_id}}"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialog(false)}>Cancel</Button>
            <Button onClick={saveRule}>{editingRule ? "Update" : "Add"} Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
