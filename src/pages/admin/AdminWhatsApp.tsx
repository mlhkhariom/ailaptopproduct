import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Send, Search, MoreVertical, Phone, Video, Smile, Paperclip,
  Mic, Check, CheckCheck, Image, FileText, Camera, Star, Archive, Pin,
  Clock, ArrowLeft, QrCode, Wifi, WifiOff, Settings, Users, Bell, BellOff,
  Copy, Trash2, Forward, Reply, Plus, Download, Filter, ChevronDown, X, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminLayout from "@/components/AdminLayout";
import { whatsappTemplates, products } from "@/data/mockData";

interface ChatContact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  lastMsg: string;
  lastMsgTime: string;
  unread: number;
  online: boolean;
  typing: boolean;
  pinned: boolean;
  muted: boolean;
  lastSeen?: string;
  label?: "customer" | "new" | "vip" | "supplier";
}

interface ChatMessage {
  id: number;
  text: string;
  time: string;
  fromMe: boolean;
  status: "sent" | "delivered" | "read";
  replyTo?: string;
  media?: { type: "image" | "document"; name?: string; url?: string };
  starred?: boolean;
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
  { id: 9, name: "Deepa Iyer", phone: "+91 44332 21100", avatar: "DI", lastMsg: "Photo bhej rahi hun skin condition ki", lastMsgTime: "Sun", unread: 0, online: false, typing: false, pinned: false, muted: false, lastSeen: "Sunday" },
  { id: 10, name: "Ravi Kumar", phone: "+91 33221 10099", avatar: "RK", lastMsg: "Chyawanprash ghar pe deliver ho gaya 👍", lastMsgTime: "Sat", unread: 0, online: false, typing: false, pinned: false, muted: false, lastSeen: "Saturday" },
];

const chatMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, text: "Namaste Doctor! 🙏", time: "2:10 PM", fromMe: false, status: "read" },
    { id: 2, text: "Mujhe Ashwagandha powder lena hai, kya ye stress ke liye kaam karega?", time: "2:11 PM", fromMe: false, status: "read" },
    { id: 3, text: "Namaste Priya ji! 🌿 Haan bilkul, Ashwagandha stress relief ke liye bahut effective hai. Ye adaptogen hai jo cortisol levels ko naturally kam karta hai.", time: "2:15 PM", fromMe: true, status: "read" },
    { id: 4, text: "Aapko din mein 2 baar, subah aur raat ko, aadha chammach garam doodh ke saath lena hai.", time: "2:16 PM", fromMe: true, status: "read" },
    { id: 5, text: "Kitne din mein result dikhega?", time: "2:20 PM", fromMe: false, status: "read" },
    { id: 6, text: "Generally 2-3 hafte mein noticeable difference aata hai. Consistent use important hai. 😊", time: "2:22 PM", fromMe: true, status: "read" },
    { id: 7, text: "Aur kya koi side effects hain?", time: "2:30 PM", fromMe: false, status: "read" },
    { id: 8, text: "Normal dose mein koi side effect nahi hai. Agar aap pregnant hain ya thyroid medication le rahi hain toh pehle consult karein.", time: "2:32 PM", fromMe: true, status: "delivered" },
    { id: 9, text: "Ashwagandha ka dose kitna lena chahiye?", time: "2:34 PM", fromMe: false, status: "delivered" },
  ],
  2: [
    { id: 1, text: "Hello, mera order APC-002 ka status kya hai?", time: "12:30 PM", fromMe: false, status: "read" },
    { id: 2, text: "Rahul ji, aapka order ship ho chuka hai! BlueDart tracking: BLUEDART987654 🚚", time: "12:45 PM", fromMe: true, status: "read" },
    { id: 3, text: "Estimated delivery 2-3 din mein ho jayegi.", time: "12:46 PM", fromMe: true, status: "read" },
    { id: 4, text: "Order APC-002 kab deliver hoga?", time: "1:15 PM", fromMe: false, status: "read" },
  ],
  4: [
    { id: 1, text: "Doctor sahab, mujhe Triphala capsules chahiye digestion ke liye", time: "9:50 AM", fromMe: false, status: "read" },
    { id: 2, text: "Aur Tulsi Green Tea bhi order karni hai", time: "9:51 AM", fromMe: false, status: "read" },
    { id: 3, text: "Vikram ji! Bahut acha combination hai ye! 🌿 Triphala digestion ke liye best hai aur Tulsi Tea immunity boost karti hai.", time: "10:00 AM", fromMe: true, status: "read" },
    { id: 4, text: "Main aapke liye order create kar deta hun. Total hoga ₹798 (Triphala ₹449 + Tulsi Tea ₹349)", time: "10:02 AM", fromMe: true, status: "read" },
    { id: 5, text: "Free shipping bhi mil jayegi ₹499 se upar hai toh 😊", time: "10:03 AM", fromMe: true, status: "read" },
    { id: 6, text: "Triphala aur Tulsi Tea dono chahiye", time: "10:20 AM", fromMe: false, status: "read" },
  ],
};

const labelColors: Record<string, string> = {
  customer: "bg-blue-500",
  new: "bg-green-500",
  vip: "bg-yellow-500",
  supplier: "bg-purple-500",
};

const AdminWhatsApp = () => {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chats");
  const [chatFilter, setChatFilter] = useState("all");
  const [isConnected, setIsConnected] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappTemplates[0]);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat]);

  const activeContact = contacts.find((c) => c.id === activeChat);
  const messages = activeChat ? chatMessages[activeChat] || [] : [];

  const filteredContacts = contacts
    .filter((c) => {
      if (chatFilter === "unread") return c.unread > 0;
      if (chatFilter === "pinned") return c.pinned;
      return true;
    })
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  const getTemplatePreview = () => {
    let msg = selectedTemplate.message;
    selectedTemplate.variables.forEach((v) => {
      msg = msg.replace(`{{${v}}}`, previewValues[v] || `[${v}]`);
    });
    return msg;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessage("");
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
            {totalUnread > 0 && (
              <Badge className="bg-green-500 text-white border-0 text-[10px] h-5">{totalUnread} unread</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showQR} onOpenChange={setShowQR}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <QrCode className="h-3.5 w-3.5" /> {isConnected ? "Reconnect" : "Scan QR"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle className="text-center">Scan QR Code</DialogTitle></DialogHeader>
                <div className="flex flex-col items-center py-6">
                  <div className="h-52 w-52 border-2 border-dashed border-green-300 rounded-2xl flex items-center justify-center bg-green-50 dark:bg-green-950/20 mb-4">
                    <div className="text-center">
                      <QrCode className="h-20 w-20 text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">QR Code from<br />whatsapp-web.js</p>
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground max-w-xs">
                    Open WhatsApp on your phone → Settings → Linked Devices → Link a Device → Scan this QR code
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5">
                      <Wifi className="h-3.5 w-3.5" /> Connect
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsConnected(!isConnected)}>
                      {isConnected ? "Disconnect" : "Simulate Connect"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setShowTemplatePanel(!showTemplatePanel)}>
              <FileText className="h-3.5 w-3.5" /> Templates
            </Button>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex rounded-xl border overflow-hidden bg-background shadow-sm min-h-0">

          {/* Left Sidebar — Contact List */}
          <div className="w-[340px] border-r flex flex-col bg-card shrink-0">
            {/* Sidebar Header */}
            <div className="p-3 border-b bg-[#f0f2f5] dark:bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">DP</div>
                  <div>
                    <p className="text-sm font-medium">Dr. Prachi</p>
                    <p className="text-[10px] text-green-600">Apsoncure PHC</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="text-xs"><Plus className="h-3 w-3 mr-2" /> New Chat</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Users className="h-3 w-3 mr-2" /> New Group</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Star className="h-3 w-3 mr-2" /> Starred Messages</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Archive className="h-3 w-3 mr-2" /> Archived</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs"><Settings className="h-3 w-3 mr-2" /> Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search or start new chat"
                  className="pl-9 h-9 text-xs bg-white dark:bg-background rounded-lg border-0 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1.5 mt-2">
                {[
                  { key: "all", label: "All" },
                  { key: "unread", label: "Unread" },
                  { key: "pinned", label: "Pinned" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setChatFilter(f.key)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      chatFilter === f.key
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-white dark:bg-muted text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact List */}
            <ScrollArea className="flex-1">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setActiveChat(contact.id)}
                  className={`flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-colors ${
                    activeChat === contact.id
                      ? "bg-[#f0f2f5] dark:bg-muted/40"
                      : "hover:bg-[#f5f6f6] dark:hover:bg-muted/20"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      contact.label === "vip" ? "bg-yellow-500" : contact.label === "new" ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"
                    }`}>
                      {contact.avatar}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{contact.name}</span>
                        {contact.label && (
                          <span className={`h-2 w-2 rounded-full ${labelColors[contact.label]}`} />
                        )}
                        {contact.muted && <BellOff className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <span className={`text-[11px] shrink-0 ${contact.unread > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                        {contact.lastMsgTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate pr-2">
                        {contact.typing ? (
                          <span className="text-green-600 italic">typing...</span>
                        ) : (
                          <>
                            {contact.pinned && <Pin className="h-2.5 w-2.5 inline mr-1 text-muted-foreground/60" />}
                            {contact.lastMsg}
                          </>
                        )}
                      </p>
                      {contact.unread > 0 && (
                        <span className="h-5 min-w-[20px] rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Right Side — Chat Window */}
          {activeContact ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="h-14 px-4 border-b bg-[#f0f2f5] dark:bg-muted/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                      activeContact.label === "vip" ? "bg-yellow-500" : "bg-gray-400 dark:bg-gray-600"
                    }`}>
                      {activeContact.avatar}
                    </div>
                    {activeContact.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#f0f2f5] dark:border-muted/30" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activeContact.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {activeContact.typing ? (
                        <span className="text-green-600">typing...</span>
                      ) : activeContact.online ? (
                        <span className="text-green-600">online</span>
                      ) : (
                        `last seen ${activeContact.lastSeen || "recently"}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Video className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Phone className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Search className="h-5 w-5" /></Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><MoreVertical className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="text-xs"><Users className="h-3 w-3 mr-2" /> Contact Info</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Star className="h-3 w-3 mr-2" /> Starred Messages</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Search className="h-3 w-3 mr-2" /> Search in Chat</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><BellOff className="h-3 w-3 mr-2" /> Mute</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs"><Bot className="h-3 w-3 mr-2" /> Send Template</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><FileText className="h-3 w-3 mr-2" /> Send Product</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" /> Clear Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                className="flex-1 overflow-y-auto px-16 py-4 min-h-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundColor: "#efeae2",
                }}
              >
                {/* Date Header */}
                <div className="flex justify-center mb-4">
                  <span className="bg-white/80 dark:bg-muted/80 text-[11px] text-muted-foreground px-3 py-1 rounded-lg shadow-sm">
                    Today
                  </span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex mb-1 group ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`relative max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm ${
                        msg.fromMe
                          ? "bg-[#d9fdd3] dark:bg-green-900/40 rounded-tr-none"
                          : "bg-white dark:bg-muted rounded-tl-none"
                      }`}
                    >
                      {msg.replyTo && (
                        <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded px-2 py-1 mb-1 text-[11px] text-muted-foreground">
                          {msg.replyTo}
                        </div>
                      )}
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
                        <span className="text-[10px] text-muted-foreground/70">{msg.time}</span>
                        {msg.fromMe && (
                          msg.status === "read" ? (
                            <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/50" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-muted-foreground/50" />
                          )
                        )}
                      </div>

                      {/* Hover actions */}
                      <div className="absolute -top-1 right-0 hidden group-hover:flex bg-white dark:bg-muted rounded shadow-md">
                        <button className="p-1 hover:bg-muted/50"><Reply className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button className="p-1 hover:bg-muted/50"><Forward className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button className="p-1 hover:bg-muted/50"><Star className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button className="p-1 hover:bg-muted/50"><ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-3 py-2 border-t bg-[#f0f2f5] dark:bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground shrink-0">
                    <Smile className="h-6 w-6" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground shrink-0">
                        <Paperclip className="h-6 w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="w-40">
                      <DropdownMenuItem className="text-xs"><Image className="h-3 w-3 mr-2" /> Photos & Videos</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><FileText className="h-3 w-3 mr-2" /> Document</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Camera className="h-3 w-3 mr-2" /> Camera</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs" onClick={() => setShowTemplatePanel(true)}><Bot className="h-3 w-3 mr-2" /> Template</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Input
                    placeholder="Type a message"
                    className="flex-1 h-10 rounded-lg border-0 bg-white dark:bg-background shadow-sm text-sm"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />

                  {message.trim() ? (
                    <Button size="icon" className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 shrink-0" onClick={handleSendMessage}>
                      <Send className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground shrink-0">
                      <Mic className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] dark:bg-muted/10">
              <div className="text-center max-w-md">
                <div className="h-40 w-40 mx-auto mb-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <MessageCircle className="h-20 w-20 text-green-200" />
                </div>
                <h2 className="text-2xl font-light text-foreground/80 mb-2">WhatsApp Web</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Send and receive messages with your customers. Connected via whatsapp-web.js backend.
                </p>
                <p className="text-xs text-muted-foreground mt-4">🔒 End-to-end encrypted</p>
              </div>
            </div>
          )}

          {/* Template Panel (Slide-in) */}
          {showTemplatePanel && (
            <div className="w-[320px] border-l bg-card flex flex-col shrink-0">
              <div className="p-3 border-b flex items-center justify-between bg-[#f0f2f5] dark:bg-muted/30">
                <h3 className="text-sm font-medium">Quick Templates</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowTemplatePanel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {whatsappTemplates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTemplate(t); setPreviewValues({}); }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-left ${
                        selectedTemplate.id === t.id ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20" : "hover:bg-muted/30"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{t.message}</p>
                      <div className="flex gap-1 mt-1.5">
                        {t.variables.map((v) => (
                          <Badge key={v} variant="secondary" className="text-[8px] h-4">{`{{${v}}}`}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Template Preview */}
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-medium">Fill Variables</p>
                  {selectedTemplate.variables.map((v) => (
                    <div key={v}>
                      <Label className="text-[10px] capitalize">{v.replace(/_/g, " ")}</Label>
                      {v === "product_name" ? (
                        <Select value={previewValues[v] || ""} onValueChange={(val) => setPreviewValues({ ...previewValues, [v]: val })}>
                          <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.name} className="text-xs">{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <Input className="h-8 text-xs mt-0.5" placeholder={v.replace(/_/g, " ")} value={previewValues[v] || ""} onChange={(e) => setPreviewValues({ ...previewValues, [v]: e.target.value })} />
                      )}
                    </div>
                  ))}

                  {/* Preview Bubble */}
                  <div className="rounded-lg overflow-hidden border shadow-sm">
                    <div className="bg-[#d9fdd3] dark:bg-green-900/30 p-3">
                      <p className="text-[12px] leading-relaxed">{getTemplatePreview()}</p>
                      <p className="text-[9px] text-green-600/60 text-right mt-1">Now ✓✓</p>
                    </div>
                  </div>

                  <Button className="w-full gap-1.5 bg-green-600 hover:bg-green-700 text-xs h-8" onClick={() => { setMessage(getTemplatePreview()); setShowTemplatePanel(false); }}>
                    <Send className="h-3.5 w-3.5" /> Use Template
                  </Button>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
