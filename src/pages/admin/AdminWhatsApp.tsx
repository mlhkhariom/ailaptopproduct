import { useState } from "react";
import { MessageCircle, Plus, Edit, Eye, Send, Phone, CheckCircle, Copy, Trash2, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { whatsappTemplates, products } from "@/data/mockData";

const chatHistory = [
  { id: 1, customer: "Priya Sharma", phone: "+91 98765 43210", lastMsg: "Need info about Ashwagandha", time: "2 min ago", unread: 2 },
  { id: 2, customer: "Rahul Verma", phone: "+91 87654 32109", lastMsg: "When will my order arrive?", time: "1 hour ago", unread: 0 },
  { id: 3, customer: "Anita Desai", phone: "+91 76543 21098", lastMsg: "Thank you! Great product", time: "3 hours ago", unread: 0 },
];

const AdminWhatsApp = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappTemplates[0]);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  const getPreview = () => {
    let msg = selectedTemplate.message;
    selectedTemplate.variables.forEach((v) => {
      msg = msg.replace(`{{${v}}}`, previewValues[v] || `[${v}]`);
    });
    return msg;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">WhatsApp Integration</h1>
          <p className="text-sm text-muted-foreground">Create templates, chat with customers, set up auto-replies</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Connected</Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="h-3.5 w-3.5" /> New Template</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">New Message Template</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label className="text-xs">Template Name</Label><Input className="mt-1 h-9" placeholder="e.g. Product Inquiry" /></div>
                <div>
                  <Label className="text-xs">Message</Label>
                  <Textarea className="mt-1" rows={4} placeholder="Use {{variable}} syntax..." />
                  <p className="text-[10px] text-muted-foreground mt-1">Available: {"{{product_name}}, {{order_id}}, {{customer_name}}, {{health_concern}}"}</p>
                </div>
                <div className="flex items-center gap-2"><Switch id="auto" /><Label htmlFor="auto" className="text-xs">Include in Auto-Reply</Label></div>
                <Button className="w-full">Save Template</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-primary/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">💬</span><div><p className="text-lg font-bold">156</p><p className="text-[10px] text-muted-foreground">Messages Today</p></div></CardContent></Card>
        <Card className="bg-accent/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">👥</span><div><p className="text-lg font-bold">42</p><p className="text-[10px] text-muted-foreground">Active Chats</p></div></CardContent></Card>
        <Card className="bg-sage/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">⚡</span><div><p className="text-lg font-bold">2 min</p><p className="text-[10px] text-muted-foreground">Avg. Reply Time</p></div></CardContent></Card>
        <Card className="bg-gold/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">📈</span><div><p className="text-lg font-bold">89%</p><p className="text-[10px] text-muted-foreground">Response Rate</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
          <TabsTrigger value="chats" className="text-xs">Recent Chats</TabsTrigger>
          <TabsTrigger value="auto" className="text-xs">Auto-Reply</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">Message Templates ({whatsappTemplates.length})</h2>
              {whatsappTemplates.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all ${selectedTemplate.id === t.id ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"}`}
                  onClick={() => { setSelectedTemplate(t); setPreviewValues({}); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{t.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                          <DropdownMenuItem className="text-xs"><Edit className="h-3 w-3 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs"><Copy className="h-3 w-3 mr-2" /> Copy</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
                    <div className="flex gap-1 mt-2">
                      {t.variables.map((v) => <Badge key={v} variant="secondary" className="text-[9px]">{`{{${v}}}`}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-sm">Preview & Send</h2>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> {selectedTemplate.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedTemplate.variables.map((v) => (
                    <div key={v}>
                      <Label className="text-xs capitalize">{v.replace(/_/g, " ")}</Label>
                      {v === "product_name" ? (
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs mt-1"
                          value={previewValues[v] || ""}
                          onChange={(e) => setPreviewValues({ ...previewValues, [v]: e.target.value })}
                        >
                          <option value="">Select product</option>
                          {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                      ) : (
                        <Input className="mt-1 h-9 text-xs" placeholder={`Enter ${v.replace(/_/g, " ")}`} value={previewValues[v] || ""} onChange={(e) => setPreviewValues({ ...previewValues, [v]: e.target.value })} />
                      )}
                    </div>
                  ))}

                  <div className="rounded-xl overflow-hidden border">
                    <div className="bg-[#DCF8C6] dark:bg-green-900/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-[10px] font-medium text-green-700 dark:text-green-400">WhatsApp Preview</span>
                      </div>
                      <p className="text-sm leading-relaxed">{getPreview()}</p>
                      <p className="text-[9px] text-green-600/60 text-right mt-1">Now ✓✓</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input placeholder="Mobile number (91XXXXXXXXXX)" className="h-9 text-xs" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"><Send className="h-4 w-4" /> Send</Button>
                    <Button variant="outline" className="gap-1.5"><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chats">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Chats</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8 h-8 text-xs w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {chatHistory.map((c) => (
                <div key={c.id} className="p-4 flex items-center gap-3 hover:bg-muted/20 cursor-pointer transition-colors">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-green-600">{c.customer[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{c.customer}</p>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                      {c.unread > 0 && <Badge className="text-[9px] h-4 w-4 p-0 flex items-center justify-center rounded-full bg-green-500 border-0">{c.unread}</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5" /> {c.phone}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto">
          <Card>
            <CardContent className="p-6 text-center">
              <span className="text-4xl mb-3 block">⚡</span>
              <h3 className="font-serif font-bold text-lg mb-1">Auto-Reply Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">Connect WhatsApp Business API to send automated replies</p>
              <div className="space-y-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="welcome" /><Label htmlFor="welcome" className="text-xs">Welcome Message</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="order-confirm" defaultChecked /><Label htmlFor="order-confirm" className="text-xs">Order Confirmation</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="shipping" defaultChecked /><Label htmlFor="shipping" className="text-xs">Shipping Update</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="away" /><Label htmlFor="away" className="text-xs">Away / Off-Duty Message</Label>
                </div>
              </div>
              <Button className="mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
