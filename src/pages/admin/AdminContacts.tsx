import { useState } from "react";
import { Mail, Phone, Clock, Eye, Trash2, MessageCircle, CheckCircle, AlertCircle, Search, Filter, MoreHorizontal, Reply, Star, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: "new" | "read" | "replied" | "resolved" | "archived";
  priority: "low" | "medium" | "high";
  starred: boolean;
}

const mockQueries: ContactQuery[] = [
  { id: "CQ-001", name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210", subject: "Order not delivered", message: "I placed an order #APC-001 last week but haven't received it yet. The tracking shows no update since 3 days. Please help!", date: "2024-01-22", status: "new", priority: "high", starred: true },
  { id: "CQ-002", name: "Rajesh Kumar", email: "rajesh@email.com", phone: "+91 87654 32109", subject: "Product quality inquiry", message: "I want to know if Kumkumadi Oil is suitable for oily skin? Also, what's the shelf life after opening?", date: "2024-01-21", status: "replied", priority: "medium", starred: false },
  { id: "CQ-003", name: "Ananya Patel", email: "ananya@email.com", phone: "+91 76543 21098", subject: "Bulk order discount", message: "I run a wellness center and would like to order 50+ units of Ashwagandha. Do you offer bulk pricing?", date: "2024-01-20", status: "read", priority: "medium", starred: true },
  { id: "CQ-004", name: "Vikram Desai", email: "vikram@email.com", phone: "+91 99887 76655", subject: "Return request", message: "I received Bhringraj Hair Oil but it's out of stock on website now. I ordered wrong product. Can I return it?", date: "2024-01-19", status: "resolved", priority: "low", starred: false },
  { id: "CQ-005", name: "Meera Patel", email: "meera@email.com", phone: "+91 88776 65544", subject: "Consultation with Dr. Prachi", message: "I need Ayurvedic consultation for chronic acidity. When is Dr. Prachi available? I prefer video call.", date: "2024-01-18", status: "new", priority: "high", starred: false },
  { id: "CQ-006", name: "Sunita Gupta", email: "sunita@email.com", phone: "+91 66554 43322", subject: "Payment issue", message: "My payment of ₹1,833 was debited but order shows failed. Razorpay ID: pay_xxx. Please refund or confirm order.", date: "2024-01-22", status: "new", priority: "high", starred: true },
];

const AdminContacts = () => {
  const [queries, setQueries] = useState<ContactQuery[]>(mockQueries);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = queries.filter(q => {
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    if (filterPriority !== "all" && q.priority !== filterPriority) return false;
    if (search && !q.name.toLowerCase().includes(search.toLowerCase()) && !q.subject.toLowerCase().includes(search.toLowerCase()) && !q.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: queries.length,
    new: queries.filter(q => q.status === "new").length,
    pending: queries.filter(q => q.status === "read").length,
    resolved: queries.filter(q => q.status === "resolved").length,
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      new: { label: "🔴 New", variant: "destructive" },
      read: { label: "👁 Read", variant: "secondary" },
      replied: { label: "💬 Replied", variant: "default" },
      resolved: { label: "✅ Resolved", variant: "outline" },
      archived: { label: "📦 Archived", variant: "outline" },
    };
    const s = map[status] || map.new;
    return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = { high: "bg-red-500/10 text-red-600", medium: "bg-yellow-500/10 text-yellow-600", low: "bg-green-500/10 text-green-600" };
    return <Badge className={`text-[9px] border-0 ${colors[priority] || ""}`}>{priority.toUpperCase()}</Badge>;
  };

  const handleReply = (query: ContactQuery) => {
    if (!replyText.trim()) { toast.error("Please type a reply"); return; }
    setQueries(prev => prev.map(q => q.id === query.id ? { ...q, status: "replied" as const } : q));
    toast.success(`Reply sent to ${query.email}`);
    setReplyText("");
    setSelectedQuery(null);
  };

  const updateStatus = (id: string, status: ContactQuery["status"]) => {
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    toast.success("Status updated");
  };

  const toggleStar = (id: string) => {
    setQueries(prev => prev.map(q => q.id === id ? { ...q, starred: !q.starred } : q));
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Contact Queries</h1>
          <p className="text-sm text-muted-foreground">Manage customer inquiries, complaints & support requests</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive" className="text-xs gap-1"><AlertCircle className="h-3 w-3" /> {stats.new} New</Badge>
          <Badge variant="secondary" className="text-xs">{stats.total} Total</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Queries", value: stats.total, icon: Mail, color: "text-primary" },
          { label: "New / Unread", value: stats.new, icon: AlertCircle, color: "text-red-500" },
          { label: "Pending Reply", value: stats.pending, icon: Clock, color: "text-yellow-500" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-green-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search by name, email, subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Query List */}
      <Card>
        <CardContent className="p-0 divide-y">
          {filtered.map(query => (
            <div key={query.id} className={`p-4 hover:bg-muted/20 transition-colors ${query.status === "new" ? "bg-destructive/5" : ""}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleStar(query.id)} className="mt-1 shrink-0">
                  <Star className={`h-4 w-4 ${query.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{query.name}</span>
                    <span className="text-[10px] text-muted-foreground">{query.email}</span>
                    {getStatusBadge(query.status)}
                    {getPriorityBadge(query.priority)}
                  </div>
                  <p className="font-medium text-sm mb-1">{query.subject}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{query.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>📅 {query.date}</span>
                    <span>📞 {query.phone}</span>
                    <span>#{query.id}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={() => { setSelectedQuery(query); if (query.status === "new") updateStatus(query.id, "read"); }}>
                        <Eye className="h-3 w-3" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-base">{query.subject}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div><span className="text-muted-foreground">From:</span> <strong>{query.name}</strong></div>
                          <div className="text-muted-foreground">{query.email}</div>
                          {getStatusBadge(query.status)}
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30 border">
                          <p className="text-sm leading-relaxed">{query.message}</p>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>📅 {query.date}</span>
                          <span>📞 {query.phone}</span>
                          <span>📧 {query.email}</span>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-xs font-medium mb-2">Reply:</p>
                          <Textarea rows={3} placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="gap-1 flex-1" onClick={() => handleReply(query)}><Reply className="h-3 w-3" /> Send Reply</Button>
                            <Button size="sm" variant="outline" onClick={() => { updateStatus(query.id, "resolved"); }}><CheckCircle className="h-3 w-3 mr-1" /> Resolve</Button>
                            <Button size="sm" variant="ghost" className="text-muted-foreground">
                              <a href={`https://wa.me/${query.phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(query.name)}, regarding your query: ${encodeURIComponent(query.subject)}`} target="_blank" rel="noreferrer">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus(query.id, "archived")}><Archive className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
              <p className="font-medium">No queries found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminContacts;
