import { useState } from "react";
import { MessageCircle, Plus, Edit, Eye, Send, Phone, CheckCircle, Copy, Trash2, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { whatsappTemplates, products } from "@/data/mockData";

const chatHistory = [
  { id: 1, customer: "प्रिया शर्मा", phone: "+91 98765 43210", lastMsg: "अश्वगंधा के बारे में जानकारी चाहिए", time: "2 मिनट पहले", unread: 2 },
  { id: 2, customer: "राहुल वर्मा", phone: "+91 87654 32109", lastMsg: "मेरा ऑर्डर कब आएगा?", time: "1 घंटा पहले", unread: 0 },
  { id: 3, customer: "अनीता देसाई", phone: "+91 76543 21098", lastMsg: "धन्यवाद! प्रोडक्ट बहुत अच्छा है", time: "3 घंटे पहले", unread: 0 },
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
          <h1 className="text-2xl font-serif font-bold">💬 WhatsApp इंटीग्रेशन</h1>
          <p className="text-sm text-muted-foreground">टेम्प्लेट बनाएं, ग्राहकों से बात करें, ऑटो-रिप्लाई सेट करें</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> कनेक्टेड</Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="h-3.5 w-3.5" /> नया टेम्प्लेट</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">📝 नया मैसेज टेम्प्लेट</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label className="text-xs">टेम्प्लेट नाम</Label><Input className="mt-1 h-9" placeholder="जैसे: प्रोडक्ट पूछताछ" /></div>
                <div>
                  <Label className="text-xs">मैसेज</Label>
                  <Textarea className="mt-1" rows={4} placeholder="{{variable}} का उपयोग करें..." />
                  <p className="text-[10px] text-muted-foreground mt-1">उपलब्ध: {"{{product_name}}, {{order_id}}, {{customer_name}}, {{health_concern}}"}</p>
                </div>
                <div className="flex items-center gap-2"><Switch id="auto" /><Label htmlFor="auto" className="text-xs">ऑटो-रिप्लाई में शामिल करें</Label></div>
                <Button className="w-full">💾 सेव करें</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-primary/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">💬</span><div><p className="text-lg font-bold">156</p><p className="text-[10px] text-muted-foreground">कुल मैसेज आज</p></div></CardContent></Card>
        <Card className="bg-accent/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">👥</span><div><p className="text-lg font-bold">42</p><p className="text-[10px] text-muted-foreground">एक्टिव चैट्स</p></div></CardContent></Card>
        <Card className="bg-sage/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">⚡</span><div><p className="text-lg font-bold">2 मिनट</p><p className="text-[10px] text-muted-foreground">औसत रिप्लाई टाइम</p></div></CardContent></Card>
        <Card className="bg-gold/5"><CardContent className="p-3 flex items-center gap-3"><span className="text-2xl">📈</span><div><p className="text-lg font-bold">89%</p><p className="text-[10px] text-muted-foreground">रिस्पांस रेट</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="text-xs">📋 टेम्प्लेट्स</TabsTrigger>
          <TabsTrigger value="chats" className="text-xs">💬 हालिया चैट्स</TabsTrigger>
          <TabsTrigger value="auto" className="text-xs">⚡ ऑटो-रिप्लाई</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">मैसेज टेम्प्लेट्स ({whatsappTemplates.length})</h2>
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
                          <DropdownMenuItem className="text-xs"><Edit className="h-3 w-3 mr-2" /> एडिट</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs"><Copy className="h-3 w-3 mr-2" /> कॉपी</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" /> डिलीट</DropdownMenuItem>
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
              <h2 className="font-semibold text-sm">प्रीव्यू & भेजें</h2>
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
                          <option value="">प्रोडक्ट चुनें</option>
                          {products.map((p) => <option key={p.id} value={p.name}>{p.name} {p.nameHi ? `(${p.nameHi})` : ''}</option>)}
                        </select>
                      ) : (
                        <Input className="mt-1 h-9 text-xs" placeholder={`${v.replace(/_/g, " ")} दर्ज करें`} value={previewValues[v] || ""} onChange={(e) => setPreviewValues({ ...previewValues, [v]: e.target.value })} />
                      )}
                    </div>
                  ))}

                  <div className="rounded-xl overflow-hidden border">
                    <div className="bg-[#DCF8C6] dark:bg-green-900/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-[10px] font-medium text-green-700 dark:text-green-400">WhatsApp प्रीव्यू</span>
                      </div>
                      <p className="text-sm leading-relaxed">{getPreview()}</p>
                      <p className="text-[9px] text-green-600/60 text-right mt-1">अभी ✓✓</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input placeholder="मोबाइल नंबर (91XXXXXXXXXX)" className="h-9 text-xs" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"><Send className="h-4 w-4" /> भेजें</Button>
                    <Button variant="outline" className="gap-1.5"><Copy className="h-4 w-4" /> कॉपी</Button>
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
                <CardTitle className="text-base">हालिया चैट्स</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="खोजें..." className="pl-8 h-8 text-xs w-48" />
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
              <h3 className="font-serif font-bold text-lg mb-1">ऑटो-रिप्लाई सेटअप</h3>
              <p className="text-sm text-muted-foreground mb-4">ग्राहकों को स्वचालित उत्तर भेजने के लिए WhatsApp Business API कनेक्ट करें</p>
              <div className="space-y-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="welcome" /><Label htmlFor="welcome" className="text-xs">स्वागत मैसेज (Welcome)</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="order-confirm" defaultChecked /><Label htmlFor="order-confirm" className="text-xs">ऑर्डर कन्फर्मेशन</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="shipping" defaultChecked /><Label htmlFor="shipping" className="text-xs">शिपिंग अपडेट</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Switch id="away" /><Label htmlFor="away" className="text-xs">ऑफ-ड्यूटी मैसेज</Label>
                </div>
              </div>
              <Button className="mt-4">💾 सेटिंग्स सेव करें</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
