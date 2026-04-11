import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, Send, Search, Phone, Video, Smile, Mic, CheckCheck, Check,
  ArrowLeft, QrCode, Wifi, WifiOff, Plus, Trash2, Play, Edit,
  Zap, Bot, Sparkles, Users, BarChart3, Tag, Star, Copy, Forward, Reply,
  Pin, BellOff, Archive, Image, Paperclip, Camera, MoreVertical, X,
  ChevronDown, Lock, Clock, Info, FileText, UserCircle, AtSign,
  MicOff, Download, Share2, Ban, Flag, Timer, Link2, ImageIcon
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/AdminLayout";
import { useProductStore } from "@/store/productStore";
import { useWhatsAppStore, type AutoReplyRule } from "@/store/whatsappStore";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Types ── */
interface ChatContact {
  id: number; name: string; phone: string; avatar: string; lastMsg: string;
  lastMsgTime: string; unread: number; online: boolean; typing: boolean;
  pinned: boolean; muted: boolean; archived: boolean; lastSeen?: string;
  label?: "customer" | "new" | "vip" | "supplier";
  about?: string;
}

interface ChatMessage {
  id: number; text: string; time: string; fromMe: boolean;
  status: "sent" | "delivered" | "read"; replyTo?: number; replyText?: string;
  starred?: boolean; forwarded?: boolean; reactions?: string[];
  deleted?: boolean; type?: "text" | "image" | "document" | "voice";
  fileName?: string;
}

/* ── Initial Data ── */
const initialContacts: ChatContact[] = [
  { id: 1, name: "Priya Sharma", phone: "+91 98765 43210", avatar: "PS", lastMsg: "Ashwagandha ka dose kitna lena chahiye?", lastMsgTime: "2:34 PM", unread: 3, online: true, typing: false, pinned: true, muted: false, archived: false, label: "vip", about: "🌿 Ayurveda lover" },
  { id: 2, name: "Rahul Verma", phone: "+91 87654 32109", avatar: "RV", lastMsg: "Order APC-002 kab deliver hoga?", lastMsgTime: "1:15 PM", unread: 1, online: false, typing: false, pinned: true, muted: false, archived: false, lastSeen: "12:45 PM", label: "customer", about: "Regular customer" },
  { id: 3, name: "Anita Desai", phone: "+91 76543 21098", avatar: "AD", lastMsg: "Thank you doctor! Product is amazing 🙏", lastMsgTime: "11:30 AM", unread: 0, online: false, typing: false, pinned: false, muted: false, archived: false, lastSeen: "11:28 AM", about: "Hey there! I am using WhatsApp." },
  { id: 4, name: "Vikram Singh", phone: "+91 99887 76655", avatar: "VS", lastMsg: "Triphala aur Tulsi Tea dono chahiye", lastMsgTime: "10:20 AM", unread: 0, online: true, typing: true, pinned: false, muted: false, archived: false, label: "customer", about: "Wellness enthusiast 🧘" },
  { id: 5, name: "Meera Patel", phone: "+91 88776 65544", avatar: "MP", lastMsg: "Brahmi Tonic ka result bahut acha hai", lastMsgTime: "Yesterday", unread: 0, online: false, typing: false, pinned: false, muted: true, archived: false, lastSeen: "Yesterday", about: "Mom | Yoga | Organic living" },
  { id: 6, name: "Arjun Nair", phone: "+91 77665 54433", avatar: "AN", lastMsg: "Bhringraj Oil ka stock kab aayega?", lastMsgTime: "Yesterday", unread: 0, online: false, typing: false, pinned: false, muted: false, archived: false, lastSeen: "Yesterday", label: "customer" },
  { id: 7, name: "Sunita Gupta", phone: "+91 66554 43322", avatar: "SG", lastMsg: "Payment fail ho gaya, dobara try karun?", lastMsgTime: "Mon", unread: 0, online: false, typing: false, pinned: false, muted: false, archived: false, lastSeen: "Monday" },
  { id: 8, name: "Karan Mehta", phone: "+91 55443 32211", avatar: "KM", lastMsg: "Bulk order ke liye discount milega?", lastMsgTime: "Mon", unread: 2, online: false, typing: false, pinned: false, muted: false, archived: false, label: "new", about: "Business inquiries" },
];

const initialChatMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, text: "Namaste Doctor! 🙏", time: "2:10 PM", fromMe: false, status: "read" },
    { id: 2, text: "Mujhe Ashwagandha powder lena hai, kya ye stress ke liye kaam karega?", time: "2:11 PM", fromMe: false, status: "read" },
    { id: 3, text: "Namaste Priya ji! 🌿 Haan bilkul, Ashwagandha stress relief ke liye bahut effective hai.", time: "2:15 PM", fromMe: true, status: "read" },
    { id: 4, text: "Aapko din mein 2 baar, subah aur raat ko, aadha chammach garam doodh ke saath lena hai.", time: "2:16 PM", fromMe: true, status: "read" },
    { id: 5, text: "Thank you doctor! Aur koi precaution lena chahiye?", time: "2:20 PM", fromMe: false, status: "read" },
    { id: 6, text: "Haan, pregnant ladies aur diabetes patients pehle doctor se consult karein. Baaki sabke liye safe hai 🌿", time: "2:22 PM", fromMe: true, status: "read" },
    { id: 7, text: "Ashwagandha ka dose kitna lena chahiye?", time: "2:34 PM", fromMe: false, status: "delivered" },
  ],
  2: [
    { id: 1, text: "Hello, mera order APC-002 ka status kya hai?", time: "12:30 PM", fromMe: false, status: "read" },
    { id: 2, text: "Rahul ji, aapka order ship ho chuka hai! 🚚", time: "12:45 PM", fromMe: true, status: "read" },
    { id: 3, text: "BlueDart tracking: BLUEDART987654", time: "12:45 PM", fromMe: true, status: "read" },
    { id: 4, text: "Estimated delivery: 2-3 working days", time: "12:46 PM", fromMe: true, status: "read" },
    { id: 5, text: "Order APC-002 kab deliver hoga?", time: "1:15 PM", fromMe: false, status: "read" },
  ],
  3: [
    { id: 1, text: "Namaste! Maine last week Triphala Churna order kiya tha", time: "11:00 AM", fromMe: false, status: "read" },
    { id: 2, text: "Bohot accha product hai! Digestion mein bahut improvement hua 😊", time: "11:05 AM", fromMe: false, status: "read" },
    { id: 3, text: "Thank you Anita ji! Hum khush hain aapko accha laga 🙏", time: "11:20 AM", fromMe: true, status: "read" },
    { id: 4, text: "Thank you doctor! Product is amazing 🙏", time: "11:30 AM", fromMe: false, status: "read" },
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

/* ── Colors ── */
const C = {
  headerBg: "#f0f2f5",
  sidebarBg: "#ffffff",
  chatBg: "#efeae2",
  inputBg: "#f0f2f5",
  sentBubble: "#d9fdd3",
  recvBubble: "#ffffff",
  green: "#008069",
  greenLight: "#25d366",
  greenDark: "#065f46",
  textPrimary: "#111b21",
  textSecondary: "#667781",
  textTertiary: "#8696a0",
  border: "#e9edef",
  hoverBg: "#f5f6f6",
  activeBg: "#f0f2f5",
  contextBg: "#ffffff",
  unreadBadge: "#25d366",
  ticks: "#53bdeb",
  ticksGrey: "#8696a0",
  wallpaper: "#efeae2",
  replyBg: "#f5f6f6",
  infoPanelBg: "#ffffff",
  searchBg: "#f0f2f5",
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
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: ChatMessage } | null>(null);
  const [contactContextMenu, setContactContextMenu] = useState<{ x: number; y: number; contact: ChatContact } | null>(null);
  const [starredFilter, setStarredFilter] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<number, ChatMessage[]>>(initialChatMessages);
  const [localContacts, setLocalContacts] = useState<ChatContact[]>(initialContacts);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [forwardDialog, setForwardDialog] = useState<ChatMessage | null>(null);
  const [newContactDialog, setNewContactDialog] = useState(false);
  const [newContactForm, setNewContactForm] = useState({ name: "", phone: "", label: "customer" as ChatContact["label"] });
  const [searchInChat, setSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [msgInfoDialog, setMsgInfoDialog] = useState<ChatMessage | null>(null);
  const [infoTab, setInfoTab] = useState<"media" | "links" | "docs">("media");
  const [disappearingMsgs, setDisappearingMsgs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const { rules, addRule, updateRule, deleteRule, toggleRule, matchMessage, simulatedMessages, addSimulatedMessage, clearSimulation } = useWhatsAppStore();
  const { products } = useProductStore();
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [ruleForm, setRuleForm] = useState({ name: "", keywords: "", responseTemplate: "", type: "custom" as AutoReplyRule["type"], isActive: true });
  const [simInput, setSimInput] = useState("");

  const scrollToBottom = useCallback(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => { scrollToBottom(); }, [activeChat, localMessages, scrollToBottom]);

  // Close menus on click outside
  useEffect(() => {
    const handler = () => { setContextMenu(null); setContactContextMenu(null); setShowAttachMenu(false); };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // Scroll detection
  useEffect(() => {
    const el = chatAreaRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollBtn(el.scrollTop < el.scrollHeight - el.clientHeight - 100);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeChat]);

  const activeContact = localContacts.find((c) => c.id === activeChat);
  const messages = activeChat ? localMessages[activeChat] || [] : [];
  const filteredContacts = localContacts
    .filter(c => !c.archived)
    .filter((c) => {
      if (chatFilter === "unread") return c.unread > 0;
      if (chatFilter === "pinned") return c.pinned;
      if (chatFilter === "groups") return false;
      return true;
    })
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
    .sort((a, b) => (a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : 0));

  const totalUnread = localContacts.reduce((s, c) => s + c.unread, 0);

  /* ── Handlers ── */
  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: Date.now(), text: message, time: now, fromMe: true, status: "sent",
      replyTo: replyingTo?.id, replyText: replyingTo?.text,
    };
    setLocalMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setLocalContacts(prev => prev.map(c => c.id === activeChat ? { ...c, lastMsg: message, lastMsgTime: now } : c));
    setMessage(""); setReplyingTo(null);
    setTimeout(() => {
      setLocalMessages(prev => ({ ...prev, [activeChat]: (prev[activeChat] || []).map(m => m.id === newMsg.id ? { ...m, status: "delivered" as const } : m) }));
    }, 1000);
    setTimeout(() => {
      setLocalMessages(prev => ({ ...prev, [activeChat]: (prev[activeChat] || []).map(m => m.id === newMsg.id ? { ...m, status: "read" as const } : m) }));
    }, 2500);
  };

  const handleSelectChat = (id: number) => {
    setActiveChat(id); setShowContactInfo(false); setReplyingTo(null); setStarredFilter(false);
    setSearchInChat(false); setChatSearchQuery("");
    setLocalContacts(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    if (isMobile) setShowMobileChat(true);
  };

  const handleBackToList = () => { setShowMobileChat(false); setActiveChat(null); setShowContactInfo(false); };

  const handleContextMenu = (e: React.MouseEvent, msg: ChatMessage) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ x: Math.min(e.clientX, window.innerWidth - 200), y: Math.min(e.clientY, window.innerHeight - 300), msg });
  };

  const handleContactContextMenu = (e: React.MouseEvent, contact: ChatContact) => {
    e.preventDefault(); e.stopPropagation();
    setContactContextMenu({ x: Math.min(e.clientX, window.innerWidth - 200), y: Math.min(e.clientY, window.innerHeight - 250), contact });
  };

  const handleReply = (msg: ChatMessage) => { setReplyingTo(msg); setContextMenu(null); };
  const handleCopyMsg = (msg: ChatMessage) => { navigator.clipboard.writeText(msg.text); toast.success("Copied!"); setContextMenu(null); };
  const handleStarMsg = (msg: ChatMessage) => {
    if (!activeChat) return;
    setLocalMessages(prev => ({ ...prev, [activeChat]: (prev[activeChat] || []).map(m => m.id === msg.id ? { ...m, starred: !m.starred } : m) }));
    toast.success(msg.starred ? "Unstarred" : "Starred ⭐"); setContextMenu(null);
  };
  const handleDeleteMsg = (msg: ChatMessage, forEveryone?: boolean) => {
    if (!activeChat) return;
    if (forEveryone) {
      setLocalMessages(prev => ({ ...prev, [activeChat]: (prev[activeChat] || []).map(m => m.id === msg.id ? { ...m, deleted: true, text: "🚫 This message was deleted" } : m) }));
    } else {
      setLocalMessages(prev => ({ ...prev, [activeChat]: (prev[activeChat] || []).filter(m => m.id !== msg.id) }));
    }
    toast.success("Message deleted"); setContextMenu(null);
  };
  const handleForwardMsg = (msg: ChatMessage) => { setForwardDialog(msg); setContextMenu(null); };
  const handleForwardTo = (contactId: number) => {
    if (!forwardDialog) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const fwd: ChatMessage = { id: Date.now(), text: forwardDialog.text, time: now, fromMe: true, status: "sent", forwarded: true };
    setLocalMessages(prev => ({ ...prev, [contactId]: [...(prev[contactId] || []), fwd] }));
    const contact = localContacts.find(c => c.id === contactId);
    toast.success(`Forwarded to ${contact?.name}`); setForwardDialog(null);
  };
  const handleReactToMsg = (msg: ChatMessage, emoji: string) => {
    if (!activeChat) return;
    setLocalMessages(prev => ({
      ...prev, [activeChat]: (prev[activeChat] || []).map(m =>
        m.id === msg.id ? { ...m, reactions: m.reactions?.includes(emoji) ? m.reactions.filter(r => r !== emoji) : [...(m.reactions || []), emoji] } : m
      ),
    }));
  };

  const handlePinContact = (id: number) => {
    setLocalContacts(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    setContactContextMenu(null);
  };
  const handleMuteContact = (id: number) => {
    setLocalContacts(prev => prev.map(c => c.id === id ? { ...c, muted: !c.muted } : c));
    setContactContextMenu(null);
  };
  const handleArchiveContact = (id: number) => {
    setLocalContacts(prev => prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c));
    if (activeChat === id) { setActiveChat(null); setShowMobileChat(false); }
    toast.success("Chat archived"); setContactContextMenu(null);
  };
  const handleDeleteChat = (id: number) => {
    setLocalMessages(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (activeChat === id) { setActiveChat(null); setShowMobileChat(false); }
    toast.success("Chat deleted"); setContactContextMenu(null);
  };
  const handleMarkUnread = (id: number) => {
    setLocalContacts(prev => prev.map(c => c.id === id ? { ...c, unread: c.unread > 0 ? 0 : 1 } : c));
    setContactContextMenu(null);
  };
  const handleAddContact = () => {
    if (!newContactForm.name || !newContactForm.phone) { toast.error("Name & phone required"); return; }
    const id = Date.now();
    const initials = newContactForm.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    setLocalContacts(prev => [...prev, {
      id, name: newContactForm.name, phone: newContactForm.phone, avatar: initials,
      lastMsg: "", lastMsgTime: "Now", unread: 0, online: false, typing: false,
      pinned: false, muted: false, archived: false, label: newContactForm.label,
    }]);
    setNewContactDialog(false); setNewContactForm({ name: "", phone: "", label: "customer" });
    toast.success("Contact added!");
  };

  const handleLabelChange = (contactId: number, label: ChatContact["label"]) => {
    setLocalContacts(prev => prev.map(c => c.id === contactId ? { ...c, label } : c));
    toast.success("Label updated");
  };

  const emojis = ["😊", "❤️", "👍", "🙏", "😂", "🔥", "🎉", "💯", "🌿", "✅", "😍", "🤔", "👏", "🙌", "💪", "🌸"];
  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  // Automation handlers
  const openAddRule = () => { setEditingRule(null); setRuleForm({ name: "", keywords: "", responseTemplate: "", type: "custom", isActive: true }); setRuleDialog(true); };
  const openEditRule = (rule: AutoReplyRule) => { setEditingRule(rule); setRuleForm({ name: rule.name, keywords: rule.keywords.join(", "), responseTemplate: rule.responseTemplate, type: rule.type, isActive: rule.isActive }); setRuleDialog(true); };
  const saveRule = () => {
    if (!ruleForm.name || !ruleForm.keywords || !ruleForm.responseTemplate) { toast.error("All fields required!"); return; }
    const keywords = ruleForm.keywords.split(",").map(k => k.trim()).filter(Boolean);
    if (editingRule) { updateRule(editingRule.id, { ...ruleForm, keywords }); toast.success("Updated!"); }
    else { addRule({ ...ruleForm, keywords }); toast.success("Added!"); }
    setRuleDialog(false);
  };
  const handleSimulate = () => {
    if (!simInput.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    addSimulatedMessage({ text: simInput, time: now, fromMe: false });
    const matchedRule = matchMessage(simInput);
    if (matchedRule) {
      let response = matchedRule.responseTemplate;
      const productMatch = products.find(p => simInput.toLowerCase().includes(p.name.toLowerCase()) || (p.nameHi && simInput.includes(p.nameHi)));
      if (productMatch) {
        response = response.replace("{{product_name}}", productMatch.name).replace("{{price}}", `₹${productMatch.price}`)
          .replace("{{original_price_info}}", productMatch.originalPrice ? `(MRP: ₹${productMatch.originalPrice})` : "")
          .replace("{{slug}}", productMatch.slug).replace("{{stock_status}}", productMatch.inStock ? "उपलब्ध ✅" : "Out of Stock ❌")
          .replace("{{stock_info}}", productMatch.inStock ? `Stock: ${productMatch.stock} units` : "जल्द आ रहा है!");
      }
      response = response.replace(/\{\{[^}]+\}\}/g, "[N/A]");
      setTimeout(() => addSimulatedMessage({ text: `🤖 ${response}`, time: now, fromMe: true, isBot: true }), 600);
    } else {
      setTimeout(() => addSimulatedMessage({ text: "🤖 No matching rule found. Manual reply needed.", time: now, fromMe: true, isBot: true }), 600);
    }
    setSimInput("");
  };

  const totalRules = rules.length;
  const activeRulesCount = rules.filter(r => r.isActive).length;
  const totalMatches = rules.reduce((s, r) => s + r.matchCount, 0);
  const topRule = [...rules].sort((a, b) => b.matchCount - a.matchCount)[0];

  const wallpaperStyle = {
    backgroundColor: C.wallpaper,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='20' cy='20' r='1.2' fill='%23d6cfc4' opacity='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23p)' width='200' height='200'/%3E%3C/svg%3E")`,
  };

  const labelColors: Record<string, string> = { vip: "#d97706", customer: "#008069", new: "#059669", supplier: "#7c3aed" };

  const displayMessages = (() => {
    let msgs = starredFilter ? messages.filter(m => m.starred) : messages;
    if (chatSearchQuery) msgs = msgs.filter(m => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()));
    return msgs;
  })();

  /* ═══════ CONTACT LIST ═══════ */
  const ContactList = () => (
    <div className={`flex flex-col ${isMobile ? "w-full h-full" : "w-[320px] lg:w-[360px] border-r shrink-0"}`} style={{ backgroundColor: C.sidebarBg, borderColor: C.border }}>
      {/* Header */}
      <div className="h-[59px] px-4 flex items-center justify-between" style={{ backgroundColor: C.headerBg }}>
        <span className="text-base font-bold" style={{ color: C.textPrimary }}>Chats</span>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-10 w-10" style={{ color: C.textSecondary }} onClick={() => setNewContactDialog(true)}>
            <Plus className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10" style={{ color: C.textSecondary }}><MoreVertical className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setNewContactDialog(true)}>New chat</DropdownMenuItem>
              <DropdownMenuItem>New group</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStarredFilter(!starredFilter)}>Starred messages</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowQR(true)}>Linked devices</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-3 py-2" style={{ backgroundColor: C.sidebarBg }}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: C.textTertiary }} />
          <input
            placeholder="Search or start new chat"
            className="w-full h-[35px] pl-10 pr-4 rounded-lg text-[13px] outline-none"
            style={{ backgroundColor: C.searchBg, color: C.textPrimary, border: "none" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "pinned", label: "Pinned" },
            { key: "groups", label: "Groups" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setChatFilter(f.key)}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: chatFilter === f.key ? C.green : C.searchBg,
                color: chatFilter === f.key ? "#fff" : C.textSecondary,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => handleSelectChat(contact.id)}
            onContextMenu={(e) => handleContactContextMenu(e, contact)}
            className="flex items-center gap-3 px-3 py-[10px] cursor-pointer transition-colors"
            style={{
              backgroundColor: activeChat === contact.id && !isMobile ? C.activeBg : "transparent",
              borderBottom: `1px solid ${C.border}`,
            }}
            onMouseEnter={(e) => { if (activeChat !== contact.id) (e.currentTarget.style.backgroundColor = C.hoverBg); }}
            onMouseLeave={(e) => { if (activeChat !== contact.id) (e.currentTarget.style.backgroundColor = "transparent"); }}
          >
            <div className="relative shrink-0">
              <div className="h-[49px] w-[49px] rounded-full flex items-center justify-center font-bold text-sm text-white"
                style={{ backgroundColor: labelColors[contact.label || "customer"] || "#6b7280" }}>
                {contact.avatar}
              </div>
              {contact.online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" style={{ backgroundColor: C.greenLight }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-normal truncate" style={{ color: C.textPrimary }}>{contact.name}</span>
                <span className="text-[12px] shrink-0" style={{ color: contact.unread > 0 ? C.green : C.textTertiary }}>{contact.lastMsgTime}</span>
              </div>
              <div className="flex items-center justify-between mt-[2px]">
                <div className="flex items-center gap-1 min-w-0">
                  {contact.typing ? (
                    <span className="text-[13px] italic" style={{ color: C.green }}>typing...</span>
                  ) : (
                    <p className="text-[13px] truncate" style={{ color: C.textTertiary }}>{contact.lastMsg}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {contact.muted && <BellOff className="h-3.5 w-3.5" style={{ color: C.textTertiary }} />}
                  {contact.pinned && <Pin className="h-3.5 w-3.5" style={{ color: C.textTertiary }} />}
                  {contact.unread > 0 && (
                    <span className="h-[20px] min-w-[20px] rounded-full flex items-center justify-center text-[11px] font-medium px-1 text-white"
                      style={{ backgroundColor: C.unreadBadge }}>
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredContacts.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: C.textTertiary }}>No chats found</p>
        )}
      </div>
    </div>
  );

  /* ═══════ CHAT WINDOW ═══════ */
  const ChatWindow = () => (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Chat header */}
      <div className="h-[59px] px-3 sm:px-4 flex items-center justify-between shrink-0" style={{ backgroundColor: C.headerBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setShowContactInfo(true)}>
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" style={{ color: C.textSecondary }} onClick={(e) => { e.stopPropagation(); handleBackToList(); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
            style={{ backgroundColor: labelColors[activeContact?.label || "customer"] || "#6b7280" }}>
            {activeContact?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-normal truncate" style={{ color: C.textPrimary }}>{activeContact?.name}</p>
            <p className="text-[13px] truncate" style={{ color: activeContact?.typing ? C.green : C.textTertiary }}>
              {activeContact?.typing ? "typing..." : activeContact?.online ? "online" : `last seen ${activeContact?.lastSeen || "recently"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0">
          <Button variant="ghost" size="icon" className="h-10 w-10 hidden sm:flex" style={{ color: C.textSecondary }}><Video className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 hidden sm:flex" style={{ color: C.textSecondary }}><Phone className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" style={{ color: C.textSecondary }}
            onClick={() => { setSearchInChat(!searchInChat); setChatSearchQuery(""); }}>
            <Search className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10" style={{ color: C.textSecondary }}><MoreVertical className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowContactInfo(true)}>Contact info</DropdownMenuItem>
              <DropdownMenuItem onClick={() => activeChat && handlePinContact(activeChat)}>
                {activeContact?.pinned ? "Unpin chat" : "Pin chat"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => activeChat && handleMuteContact(activeChat)}>
                {activeContact?.muted ? "Unmute" : "Mute notifications"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStarredFilter(!starredFilter)}>
                {starredFilter ? "All messages" : "Starred messages"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDisappearingMsgs(!disappearingMsgs)}>
                <Timer className="h-4 w-4 mr-2" /> Disappearing messages {disappearingMsgs ? "ON" : "OFF"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => activeChat && handleArchiveContact(activeChat)}>Archive chat</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => activeChat && handleDeleteChat(activeChat)}>Delete chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search in chat bar */}
      {searchInChat && (
        <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: C.headerBg, borderBottom: `1px solid ${C.border}` }}>
          <Search className="h-4 w-4 shrink-0" style={{ color: C.textTertiary }} />
          <input
            autoFocus placeholder="Search messages..."
            className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.textPrimary }}
            value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)}
          />
          <button onClick={() => { setSearchInChat(false); setChatSearchQuery(""); }}><X className="h-4 w-4" style={{ color: C.textTertiary }} /></button>
        </div>
      )}

      {/* Messages */}
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto px-[4%] sm:px-[8%] md:px-[12%] py-3 min-h-0 relative" style={wallpaperStyle}>
        {/* Encryption notice */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px]" style={{ backgroundColor: "#fdf4c5", color: "#54656f" }}>
            <Lock className="h-3 w-3" /> Messages and calls are end-to-end encrypted
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <span className="px-3 py-1 rounded-lg text-[12px] shadow-sm" style={{ backgroundColor: "#fff", color: "#54656f" }}>Today</span>
        </div>

        {displayMessages.length === 0 && (
          <p className="text-center py-8 text-[13px]" style={{ color: C.textTertiary }}>
            {starredFilter ? "No starred messages" : chatSearchQuery ? "No messages match your search" : "No messages yet. Say hello! 👋"}
          </p>
        )}

        {displayMessages.map((msg) => (
          <div key={msg.id} className={`flex mb-[2px] group ${msg.fromMe ? "justify-end" : "justify-start"}`}>
            <div className="relative max-w-[75%] sm:max-w-[65%]">
              <div
                className="px-[9px] py-[6px] shadow-sm cursor-pointer relative"
                style={{
                  backgroundColor: msg.deleted ? "#f0f0f0" : msg.fromMe ? C.sentBubble : C.recvBubble,
                  color: msg.deleted ? C.textTertiary : C.textPrimary,
                  borderRadius: msg.fromMe ? "7.5px 0 7.5px 7.5px" : "0 7.5px 7.5px 7.5px",
                  fontStyle: msg.deleted ? "italic" : "normal",
                }}
                onContextMenu={(e) => handleContextMenu(e, msg)}
                onDoubleClick={() => !msg.deleted && handleReactToMsg(msg, "❤️")}
              >
                {/* Forwarded label */}
                {msg.forwarded && !msg.deleted && (
                  <div className="flex items-center gap-1 mb-1 text-[11px]" style={{ color: C.textTertiary }}>
                    <Forward className="h-3 w-3" /> Forwarded
                  </div>
                )}
                {/* Reply preview */}
                {msg.replyText && !msg.deleted && (
                  <div className="mb-1 px-2 py-1 rounded text-[11px] border-l-4 cursor-pointer"
                    style={{ backgroundColor: msg.fromMe ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.04)", borderColor: C.green, color: C.textTertiary }}>
                    {msg.replyText.substring(0, 60)}{msg.replyText.length > 60 ? "..." : ""}
                  </div>
                )}
                {/* Hover arrow */}
                {!msg.deleted && (
                  <button
                    className="absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ right: msg.fromMe ? "auto" : "4px", left: msg.fromMe ? "4px" : "auto", color: C.textTertiary }}
                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, msg); }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
                <p className="text-[14.2px] leading-[19px] break-words pr-14 whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 -mt-3 float-right relative top-[14px]">
                  {msg.starred && <Star className="h-3 w-3 fill-current" style={{ color: C.textTertiary }} />}
                  <span className="text-[11px]" style={{ color: C.textTertiary }}>{msg.time}</span>
                  {msg.fromMe && !msg.deleted && (
                    msg.status === "read" ? <CheckCheck className="h-4 w-4" style={{ color: C.ticks }} />
                    : msg.status === "delivered" ? <CheckCheck className="h-4 w-4" style={{ color: C.ticksGrey }} />
                    : <Check className="h-4 w-4" style={{ color: C.ticksGrey }} />
                  )}
                </div>
              </div>
              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-0.5 mt-[-6px] ml-1">
                  {msg.reactions.map((r, i) => (
                    <span key={i} className="text-sm bg-white rounded-full px-1 shadow-sm border cursor-pointer" style={{ borderColor: C.border }}
                      onClick={() => handleReactToMsg(msg, r)}>
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button className="fixed bottom-24 right-8 h-10 w-10 rounded-full shadow-lg flex items-center justify-center z-40"
            style={{ backgroundColor: C.sidebarBg, color: C.textSecondary }}
            onClick={scrollToBottom}>
            <ChevronDown className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Reply bar */}
      {replyingTo && (
        <div className="px-4 pt-2 flex items-center gap-2" style={{ backgroundColor: C.inputBg }}>
          <div className="flex-1 px-3 py-2 rounded-lg border-l-4 text-[13px]"
            style={{ backgroundColor: "#fff", borderColor: C.green, color: C.textTertiary }}>
            <p className="text-[12px] font-medium" style={{ color: C.green }}>{replyingTo.fromMe ? "You" : activeContact?.name}</p>
            <p className="truncate">{replyingTo.text}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} style={{ color: C.textTertiary }}><X className="h-5 w-5" /></button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: C.inputBg }}>
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm flex-1" style={{ color: C.textPrimary }}>Recording...</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsRecording(false)}><X className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: C.green }} onClick={() => { setIsRecording(false); toast.success("Voice message sent!"); }}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input bar */}
      {!isRecording && (
        <div className="h-[62px] px-2 sm:px-4 flex items-center gap-1 sm:gap-2 shrink-0" style={{ backgroundColor: C.inputBg }}>
          {/* Emoji */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-[42px] w-[42px]" style={{ color: C.textTertiary }}
              onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}>
              <Smile className="h-6 w-6" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 p-2 rounded-lg shadow-lg grid grid-cols-4 gap-1 z-50 border"
                style={{ backgroundColor: "#fff", borderColor: C.border }}
                onClick={(e) => e.stopPropagation()}>
                {emojis.map(e => (
                  <button key={e} className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg"
                    onClick={() => { setMessage(prev => prev + e); setShowEmojiPicker(false); }}>
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Attach */}
          <div className="relative hidden sm:block">
            <Button variant="ghost" size="icon" className="h-[42px] w-[42px]" style={{ color: C.textTertiary }}
              onClick={(e) => { e.stopPropagation(); setShowAttachMenu(!showAttachMenu); }}>
              <Paperclip className="h-6 w-6" />
            </Button>
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 flex flex-col gap-2 z-50" onClick={(e) => e.stopPropagation()}>
                {[
                  { icon: ImageIcon, label: "Photos & Videos", color: "#7c3aed" },
                  { icon: Camera, label: "Camera", color: "#ec4899" },
                  { icon: FileText, label: "Document", color: "#6366f1" },
                  { icon: UserCircle, label: "Contact", color: "#0ea5e9" },
                ].map(a => (
                  <button key={a.label} className="flex items-center gap-3 py-2 px-3 rounded-lg shadow-md text-sm text-white"
                    style={{ backgroundColor: a.color }}
                    onClick={() => { toast.info(`${a.label} — Coming soon!`); setShowAttachMenu(false); }}>
                    <a.icon className="h-5 w-5" /> {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              placeholder="Type a message"
              className="w-full h-[42px] px-3 rounded-lg text-[15px] outline-none"
              style={{ backgroundColor: "#fff", color: C.textPrimary, border: `1px solid ${C.border}` }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>

          {message.trim() ? (
            <Button variant="ghost" size="icon" className="h-[42px] w-[42px] shrink-0" onClick={handleSendMessage} style={{ color: C.green }}>
              <Send className="h-6 w-6" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-[42px] w-[42px] shrink-0" style={{ color: C.textTertiary }}
              onClick={() => setIsRecording(true)}>
              <Mic className="h-6 w-6" />
            </Button>
          )}
        </div>
      )}
    </div>
  );

  /* ═══════ CONTACT INFO PANEL ═══════ */
  const ContactInfoPanel = () => (
    <div className="w-[300px] lg:w-[340px] border-l flex flex-col shrink-0 overflow-y-auto"
      style={{ backgroundColor: C.infoPanelBg, borderColor: C.border }}>
      <div className="h-[59px] px-4 flex items-center gap-4" style={{ backgroundColor: C.headerBg, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={() => setShowContactInfo(false)} style={{ color: C.textSecondary }}><X className="h-5 w-5" /></button>
        <span className="text-[16px] font-medium" style={{ color: C.textPrimary }}>Contact info</span>
      </div>
      <div className="flex flex-col items-center py-6 px-4">
        <div className="h-[200px] w-[200px] rounded-full flex items-center justify-center text-4xl font-bold text-white mb-3"
          style={{ backgroundColor: labelColors[activeContact?.label || "customer"] || "#6b7280" }}>
          {activeContact?.avatar}
        </div>
        <h3 className="text-[22px] font-normal" style={{ color: C.textPrimary }}>{activeContact?.name}</h3>
        <p className="text-[14px]" style={{ color: C.textTertiary }}>{activeContact?.phone}</p>
        {activeContact?.label && (
          <Select value={activeContact.label} onValueChange={(v) => activeChat && handleLabelChange(activeChat, v as ChatContact["label"])}>
            <SelectTrigger className="w-28 h-7 mt-2 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["vip", "customer", "new", "supplier"].map(l => <SelectItem key={l} value={l} className="capitalize text-xs">{l}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="px-6 py-3" style={{ borderTop: `8px solid ${C.searchBg}` }}>
        <p className="text-[12px] mb-1" style={{ color: C.textTertiary }}>About</p>
        <p className="text-[14px]" style={{ color: C.textPrimary }}>{activeContact?.about || "Hey there! I am using WhatsApp."}</p>
      </div>

      {/* Media / Links / Docs */}
      <div className="px-4 py-3" style={{ borderTop: `8px solid ${C.searchBg}` }}>
        <div className="flex gap-0 mb-3">
          {(["media", "links", "docs"] as const).map(t => (
            <button key={t} onClick={() => setInfoTab(t)}
              className="flex-1 py-2 text-xs font-medium capitalize border-b-2 transition-colors"
              style={{ borderColor: infoTab === t ? C.green : "transparent", color: infoTab === t ? C.green : C.textTertiary }}>
              {t}
            </button>
          ))}
        </div>
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: C.textTertiary }}>
            {infoTab === "media" ? "No media shared yet" : infoTab === "links" ? "No links shared yet" : "No documents shared yet"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 space-y-1" style={{ borderTop: `8px solid ${C.searchBg}` }}>
        <button className="flex items-center gap-4 w-full py-2.5 text-left rounded-lg px-2 hover:bg-gray-50" onClick={() => activeChat && handleMuteContact(activeChat)}>
          <BellOff className="h-5 w-5" style={{ color: C.textTertiary }} />
          <span className="text-[14px]" style={{ color: C.textPrimary }}>{activeContact?.muted ? "Unmute notifications" : "Mute notifications"}</span>
        </button>
        <button className="flex items-center gap-4 w-full py-2.5 text-left rounded-lg px-2 hover:bg-gray-50" onClick={() => setStarredFilter(!starredFilter)}>
          <Star className="h-5 w-5" style={{ color: C.textTertiary }} />
          <div>
            <span className="text-[14px] block" style={{ color: C.textPrimary }}>Starred messages</span>
            <span className="text-[12px]" style={{ color: C.textTertiary }}>{messages.filter(m => m.starred).length} starred</span>
          </div>
        </button>
        <button className="flex items-center gap-4 w-full py-2.5 text-left rounded-lg px-2 hover:bg-gray-50"
          onClick={() => { setDisappearingMsgs(!disappearingMsgs); toast.success(disappearingMsgs ? "Disappearing messages OFF" : "Disappearing messages ON"); }}>
          <Timer className="h-5 w-5" style={{ color: C.textTertiary }} />
          <div>
            <span className="text-[14px] block" style={{ color: C.textPrimary }}>Disappearing messages</span>
            <span className="text-[12px]" style={{ color: C.textTertiary }}>{disappearingMsgs ? "On" : "Off"}</span>
          </div>
        </button>
      </div>

      <div className="px-4 py-3 space-y-1" style={{ borderTop: `8px solid ${C.searchBg}` }}>
        <button className="flex items-center gap-4 w-full py-2.5 text-left rounded-lg px-2 hover:bg-red-50 text-red-500">
          <Ban className="h-5 w-5" />
          <span className="text-[14px]">Block {activeContact?.name}</span>
        </button>
        <button className="flex items-center gap-4 w-full py-2.5 text-left rounded-lg px-2 hover:bg-red-50 text-red-500">
          <Flag className="h-5 w-5" />
          <span className="text-[14px]">Report {activeContact?.name}</span>
        </button>
        <button className="flex items-center gap-4 w-full py-2.5 text-left rounded-lg px-2 hover:bg-red-50 text-red-500"
          onClick={() => activeChat && handleDeleteChat(activeChat)}>
          <Trash2 className="h-5 w-5" />
          <span className="text-[14px]">Delete chat</span>
        </button>
      </div>
    </div>
  );

  const EmptyChat = () => (
    <div className="flex-1 flex items-center justify-center flex-col" style={{ backgroundColor: C.headerBg }}>
      <div className="text-center max-w-md px-8">
        <div className="h-[180px] w-[180px] mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: C.searchBg }}>
          <MessageCircle className="h-20 w-20" style={{ color: C.textTertiary }} />
        </div>
        <h2 className="text-[28px] font-light mb-3" style={{ color: C.textPrimary }}>Apsoncure WhatsApp</h2>
        <p className="text-[14px] leading-5 mb-4" style={{ color: C.textTertiary }}>
          Send and receive messages to your customers.<br />
          Select a chat to get started.
        </p>
        <div className="flex items-center justify-center gap-2 text-[13px]" style={{ color: C.textTertiary }}>
          <Lock className="h-3.5 w-3.5" /> End-to-end encrypted
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground">WhatsApp Business</h1>
            <Badge variant={isConnected ? "default" : "destructive"} className="gap-1 text-[9px] h-5">
              {isConnected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
              {isConnected ? "Connected" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="flex-1 sm:flex-none">
              <TabsList className="h-8 w-full sm:w-auto grid grid-cols-3 sm:flex">
                <TabsTrigger value="chats" className="text-[10px] sm:text-xs h-7 gap-1"><MessageCircle className="h-3 w-3" /> Chats</TabsTrigger>
                <TabsTrigger value="automation" className="text-[10px] sm:text-xs h-7 gap-1"><Zap className="h-3 w-3" /> Auto</TabsTrigger>
                <TabsTrigger value="analytics" className="text-[10px] sm:text-xs h-7 gap-1"><BarChart3 className="h-3 w-3" /> Stats</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="gap-1 text-[10px] h-8 shrink-0" onClick={() => setShowQR(true)}>
              <QrCode className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Link Device</span>
            </Button>
          </div>
        </div>

        {/* CHATS TAB */}
        {mainTab === "chats" && (
          <div className="flex-1 flex rounded-lg overflow-hidden min-h-0 shadow-lg border" style={{ borderColor: C.border }}>
            {isMobile ? (
              showMobileChat && activeContact ? <ChatWindow /> : <ContactList />
            ) : (
              <>
                <ContactList />
                {activeContact ? (
                  <>
                    <ChatWindow />
                    {showContactInfo && <ContactInfoPanel />}
                  </>
                ) : (
                  <EmptyChat />
                )}
              </>
            )}
          </div>
        )}

        {/* AUTOMATION TAB */}
        {mainTab === "automation" && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Auto-Reply Rules</h2>
                  <Button size="sm" className="gap-1 text-xs h-8" onClick={openAddRule}><Plus className="h-3.5 w-3.5" /> Add Rule</Button>
                </div>
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <Card key={rule.id} className={`transition-all ${!rule.isActive ? "opacity-50" : ""}`}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <Badge variant={rule.type === "greeting" ? "default" : rule.type === "product" ? "secondary" : "outline"} className="text-[10px] shrink-0">{rule.type}</Badge>
                            <span className="font-medium text-sm truncate">{rule.name}</span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRule(rule)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteRule(rule.id); toast.success("Deleted!"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {rule.keywords.slice(0, 5).map((kw) => <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>)}
                          {rule.keywords.length > 5 && <Badge variant="outline" className="text-[10px]">+{rule.keywords.length - 5}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{rule.responseTemplate}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">Matched {rule.matchCount}×</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Simulator</h2>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={clearSimulation}>Clear</Button>
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-2 mb-3">
                        <Input placeholder="Type a customer message..." value={simInput} onChange={(e) => setSimInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSimulate()} className="h-9 text-sm" />
                        <Button size="sm" className="gap-1 h-9 shrink-0" onClick={handleSimulate}><Play className="h-3.5 w-3.5" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {["Hello", "Ashwagandha price", "Order status", "Stock?", "Thanks"].map((q) => (
                          <Button key={q} variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => setSimInput(q)}>{q}</Button>
                        ))}
                      </div>
                      <div className="rounded-lg p-3 min-h-[200px] max-h-[350px] overflow-y-auto space-y-2" style={{ backgroundColor: C.wallpaper }}>
                        {simulatedMessages.length === 0 && <p className="text-xs text-center py-8" style={{ color: C.textTertiary }}>Send a test message above!</p>}
                        {simulatedMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-[85%] px-3 py-1.5 rounded-lg text-xs shadow-sm"
                              style={{ backgroundColor: msg.fromMe ? C.sentBubble : C.recvBubble, color: C.textPrimary }}>
                              <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                              <p className="text-[9px] text-right mt-0.5" style={{ color: C.textTertiary }}>{msg.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bot className="h-4 w-4" /> Product Lookup</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Select onValueChange={(v) => {
                      const p = products.find(pr => pr.id === v);
                      if (p) {
                        const msg = `🌿 *${p.name}*${p.nameHi ? ` (${p.nameHi})` : ""}\n💰 ₹${p.price}${p.originalPrice ? ` (MRP: ₹${p.originalPrice})` : ""}\n📦 ${p.inStock ? `Stock: ${p.stock}` : "Out of Stock"}\n🔗 apsoncure.com/products/${p.slug}`;
                        setMessage(msg); setMainTab("chats"); toast.success("Loaded!");
                      }
                    }}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select product..." /></SelectTrigger>
                      <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name} — ₹{p.price}</SelectItem>)}</SelectContent>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Users, label: "Contacts", value: localContacts.length, sub: `${localContacts.filter(c => c.online).length} online`, color: C.ticks },
                { icon: Zap, label: "Rules", value: totalRules, sub: `${activeRulesCount} active`, color: "#eab308" },
                { icon: Bot, label: "Bot Replies", value: totalMatches, sub: "auto-matched", color: C.green },
                { icon: MessageCircle, label: "Unread", value: totalUnread, sub: "pending", color: "#f97316" },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1"><s.icon className="h-4 w-4" style={{ color: s.color }} /><p className="text-xs text-muted-foreground">{s.label}</p></div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-[10px]" style={{ color: s.color }}>{s.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mb-4">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Rule Performance</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {[...rules].sort((a, b) => b.matchCount - a.matchCount).map((rule, i) => (
                    <div key={rule.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1"><span className="text-sm font-medium truncate">{rule.name}</span><span className="text-xs font-bold">{rule.matchCount}</span></div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${topRule ? (rule.matchCount / topRule.matchCount) * 100 : 0}%`, backgroundColor: C.green }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── Context Menu (Message) ── */}
      {contextMenu && (
        <div className="fixed z-50 rounded-lg shadow-xl py-1 min-w-[200px] border"
          style={{ top: contextMenu.y, left: contextMenu.x, backgroundColor: C.contextBg, borderColor: C.border }}>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }} onClick={() => handleReply(contextMenu.msg)}>
            <Reply className="h-4 w-4" style={{ color: C.textTertiary }} /> Reply
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }} onClick={() => handleForwardMsg(contextMenu.msg)}>
            <Forward className="h-4 w-4" style={{ color: C.textTertiary }} /> Forward
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }} onClick={() => handleCopyMsg(contextMenu.msg)}>
            <Copy className="h-4 w-4" style={{ color: C.textTertiary }} /> Copy
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }} onClick={() => handleStarMsg(contextMenu.msg)}>
            <Star className="h-4 w-4" style={{ color: C.textTertiary }} /> {contextMenu.msg.starred ? "Unstar" : "Star"}
          </button>
          {/* Reactions */}
          <div className="flex gap-1 px-4 py-2 border-t" style={{ borderColor: C.border }}>
            {reactionEmojis.map(e => (
              <button key={e} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg"
                onClick={() => { handleReactToMsg(contextMenu.msg, e); setContextMenu(null); }}>
                {e}
              </button>
            ))}
          </div>
          <div className="border-t" style={{ borderColor: C.border }} />
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }}
            onClick={() => { setMsgInfoDialog(contextMenu.msg); setContextMenu(null); }}>
            <Info className="h-4 w-4" style={{ color: C.textTertiary }} /> Info
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }}
            onClick={() => handleDeleteMsg(contextMenu.msg)}>
            <Trash2 className="h-4 w-4" style={{ color: C.textTertiary }} /> Delete for me
          </button>
          {contextMenu.msg.fromMe && (
            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-red-50 text-red-500"
              onClick={() => handleDeleteMsg(contextMenu.msg, true)}>
              <Trash2 className="h-4 w-4" /> Delete for everyone
            </button>
          )}
        </div>
      )}

      {/* ── Contact Context Menu ── */}
      {contactContextMenu && (
        <div className="fixed z-50 rounded-lg shadow-xl py-1 min-w-[200px] border"
          style={{ top: contactContextMenu.y, left: contactContextMenu.x, backgroundColor: C.contextBg, borderColor: C.border }}>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }}
            onClick={() => handlePinContact(contactContextMenu.contact.id)}>
            <Pin className="h-4 w-4" style={{ color: C.textTertiary }} /> {contactContextMenu.contact.pinned ? "Unpin chat" : "Pin chat"}
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }}
            onClick={() => handleMuteContact(contactContextMenu.contact.id)}>
            <BellOff className="h-4 w-4" style={{ color: C.textTertiary }} /> {contactContextMenu.contact.muted ? "Unmute" : "Mute"}
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }}
            onClick={() => handleArchiveContact(contactContextMenu.contact.id)}>
            <Archive className="h-4 w-4" style={{ color: C.textTertiary }} /> Archive
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-gray-100" style={{ color: C.textPrimary }}
            onClick={() => handleMarkUnread(contactContextMenu.contact.id)}>
            <MessageCircle className="h-4 w-4" style={{ color: C.textTertiary }} /> {contactContextMenu.contact.unread > 0 ? "Mark as read" : "Mark as unread"}
          </button>
          <div className="border-t" style={{ borderColor: C.border }} />
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] hover:bg-red-50 text-red-500"
            onClick={() => handleDeleteChat(contactContextMenu.contact.id)}>
            <Trash2 className="h-4 w-4" /> Delete chat
          </button>
        </div>
      )}

      {/* ── Forward Dialog ── */}
      <Dialog open={!!forwardDialog} onOpenChange={() => setForwardDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-sm">
          <DialogHeader><DialogTitle>Forward message to</DialogTitle></DialogHeader>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {localContacts.filter(c => c.id !== activeChat).map(c => (
              <button key={c.id} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50"
                onClick={() => handleForwardTo(c.id)}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ backgroundColor: labelColors[c.label || "customer"] || "#6b7280" }}>
                  {c.avatar}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── New Contact Dialog ── */}
      <Dialog open={newContactDialog} onOpenChange={setNewContactDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-sm">
          <DialogHeader><DialogTitle>Add New Contact</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-xs">Name</Label><Input className="mt-1 h-9" placeholder="Full name" value={newContactForm.name} onChange={e => setNewContactForm({ ...newContactForm, name: e.target.value })} /></div>
            <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" placeholder="+91 XXXXX XXXXX" value={newContactForm.phone} onChange={e => setNewContactForm({ ...newContactForm, phone: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Label</Label>
              <Select value={newContactForm.label} onValueChange={v => setNewContactForm({ ...newContactForm, label: v as ChatContact["label"] })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["customer", "vip", "new", "supplier"].map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setNewContactDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Message Info Dialog ── */}
      <Dialog open={!!msgInfoDialog} onOpenChange={() => setMsgInfoDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-sm">
          <DialogHeader><DialogTitle>Message info</DialogTitle></DialogHeader>
          {msgInfoDialog && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: msgInfoDialog.fromMe ? C.sentBubble : C.recvBubble }}>
                <p className="text-sm">{msgInfoDialog.text}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: C.ticksGrey }} />
                  <span>Sent at {msgInfoDialog.time}</span>
                </div>
                {msgInfoDialog.fromMe && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCheck className="h-4 w-4" style={{ color: C.ticksGrey }} />
                      <span>Delivered at {msgInfoDialog.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCheck className="h-4 w-4" style={{ color: C.ticks }} />
                      <span>Read at {msgInfoDialog.time}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── QR Dialog ── */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-center">Link a Device</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="h-52 w-52 border-2 border-dashed rounded-2xl flex items-center justify-center mb-4"
              style={{ borderColor: C.green, backgroundColor: "rgba(0,128,105,0.05)" }}>
              <QrCode className="h-20 w-20" style={{ color: C.green }} />
            </div>
            <p className="text-sm text-center text-muted-foreground">Open WhatsApp → Settings → Linked Devices → Link a Device</p>
            <Button size="sm" className="mt-4" onClick={() => { setIsConnected(!isConnected); setShowQR(false); toast.success(isConnected ? "Disconnected" : "Connected!"); }}>
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Rule Dialog ── */}
      <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader><DialogTitle>{editingRule ? "Edit Rule" : "Add Auto-Reply Rule"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-xs">Rule Name</Label><Input className="mt-1 h-9" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="e.g. Price Inquiry" /></div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={ruleForm.type} onValueChange={(v) => setRuleForm({ ...ruleForm, type: v as any })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{["greeting", "product", "order", "custom"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Keywords (comma separated)</Label><Input className="mt-1 h-9" value={ruleForm.keywords} onChange={(e) => setRuleForm({ ...ruleForm, keywords: e.target.value })} placeholder="price, rate, कीमत" /></div>
            <div>
              <Label className="text-xs">Response Template</Label>
              <Textarea className="mt-1" rows={3} value={ruleForm.responseTemplate} onChange={(e) => setRuleForm({ ...ruleForm, responseTemplate: e.target.value })} placeholder="Use {{product_name}}, {{price}} etc." />
              <p className="text-[10px] text-muted-foreground mt-1">Variables: {"{{product_name}} {{price}} {{stock_status}} {{order_id}}"}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRuleDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={saveRule}>{editingRule ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
