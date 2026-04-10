import { useState } from "react";
import { Save, Eye, EyeOff, Globe, CreditCard, Truck, Phone, Mail, Shield, Key, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";

const AdminSettings = () => {
  const [showMetaSecret, setShowMetaSecret] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">⚙️ सेटिंग्स (Settings)</h1>
          <p className="text-sm text-muted-foreground">स्टोर, API, शिपिंग और अन्य सेटिंग्स — Super Admin Only</p>
        </div>
        <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" /> Super Admin</Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="general" className="text-xs">🏪 सामान्य</TabsTrigger>
          <TabsTrigger value="api" className="text-xs">🔑 API Keys</TabsTrigger>
          <TabsTrigger value="shipping" className="text-xs">🚚 शिपिंग & टैक्स</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">🔔 नोटिफिकेशन</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🏪 स्टोर सामान्य सेटिंग्स (General Settings)</CardTitle>
              <CardDescription className="text-xs">बेसिक स्टोर जानकारी जो पूरी वेबसाइट पर दिखेगी</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">स्टोर का नाम *</Label><Input className="mt-1 h-9" defaultValue="Apsoncure PHC – Prachi Homeo Clinic" /></div>
                <div><Label className="text-xs">स्टोर Tagline</Label><Input className="mt-1 h-9" defaultValue="प्रकृति की शक्ति, आधुनिक विज्ञान" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> Contact Email *</Label><Input className="mt-1 h-9" defaultValue="info@apsoncure.com" /></div>
                <div><Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Customer Support WhatsApp *</Label><Input className="mt-1 h-9" defaultValue="+91 98765 43210" /><p className="text-[10px] text-muted-foreground mt-0.5">यह नंबर frontend chat button में दिखेगा</p></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Website URL</Label><Input className="mt-1 h-9" defaultValue="https://apsoncure.com" /></div>
                <div><Label className="text-xs">Store Logo URL</Label><Input className="mt-1 h-9" placeholder="https://..." /></div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">🌙 डार्क मोड</p>
                  <p className="text-xs text-muted-foreground">Admin panel dark mode</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">🔧 Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">स्टोर बंद करें (Coming Soon पेज दिखेगा)</p>
                </div>
                <Switch />
              </div>
              <Button className="gap-1.5"><Save className="h-4 w-4" /> सेव करें</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <div className="space-y-4">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> 🔑 API Keys & Secrets (Crucial for Node.js)</CardTitle>
                <CardDescription className="text-xs">⚠️ ये keys सुरक्षित रखें — कभी किसी के साथ शेयर न करें</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meta Graph API */}
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📸</span>
                    <div>
                      <h3 className="font-medium text-sm">Meta Graph API (Instagram/Facebook Auto-Post)</h3>
                      <p className="text-[10px] text-muted-foreground">Instagram Reels और Facebook Video auto-publish के लिए</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] ml-auto">Integration Ready</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Meta App ID</Label><Input className="mt-1 h-9 text-xs" placeholder="1234567890123456" /></div>
                    <div>
                      <Label className="text-xs">Meta App Secret</Label>
                      <div className="relative mt-1">
                        <Input className="h-9 text-xs pr-8" type={showMetaSecret ? "text" : "password"} placeholder="••••••••••••••••" />
                        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowMetaSecret(!showMetaSecret)}>
                          {showMetaSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2"><Label className="text-xs">Page Access Token</Label><Input className="mt-1 h-9 text-xs" type="password" placeholder="EAA..." /></div>
                </div>

                {/* Razorpay */}
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💳</span>
                    <div>
                      <h3 className="font-medium text-sm">Razorpay Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">ऑनलाइन पेमेंट (UPI, Card, Net Banking) के लिए</p>
                    </div>
                    <Badge variant="default" className="text-[9px] ml-auto gap-1">✓ Connected</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Razorpay Key ID</Label><Input className="mt-1 h-9 text-xs" placeholder="rzp_live_xxxxxxxxxx" /></div>
                    <div>
                      <Label className="text-xs">Razorpay Key Secret</Label>
                      <div className="relative mt-1">
                        <Input className="h-9 text-xs pr-8" type={showRazorpaySecret ? "text" : "password"} placeholder="••••••••••••••••" />
                        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}>
                          {showRazorpaySecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <h3 className="font-medium text-sm">WhatsApp Business API</h3>
                      <p className="text-[10px] text-muted-foreground">Auto-reply, Order notification, Customer chat</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">WhatsApp Business Phone Number ID</Label><Input className="mt-1 h-9 text-xs" placeholder="1234567890" /></div>
                    <div><Label className="text-xs">WhatsApp Access Token</Label><Input className="mt-1 h-9 text-xs" type="password" placeholder="EAA..." /></div>
                  </div>
                </div>

                <Button className="gap-1.5"><Save className="h-4 w-4" /> API Keys सेव करें</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🚚 शिपिंग & टैक्स सेटिंग्स</CardTitle>
              <CardDescription className="text-xs">डिलीवरी चार्जेस और GST सेटिंग्स</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">शिपिंग चार्ज (Flat Rate) ₹</Label><Input type="number" className="mt-1 h-9" defaultValue="50" /></div>
                <div><Label className="text-xs">फ्री शिपिंग — इस राशि से ऊपर (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="499" /><p className="text-[10px] text-muted-foreground mt-0.5">₹499 से ऊपर ऑर्डर पर फ्री शिपिंग</p></div>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">GST Rate (%)</Label><Input type="number" className="mt-1 h-9" defaultValue="8" /></div>
                <div><Label className="text-xs">GST Number</Label><Input className="mt-1 h-9" placeholder="22AAAAA0000A1Z5" /></div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs mb-2 block">कूरियर पार्टनर (Preferred)</Label>
                <Select defaultValue="dtdc">
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dtdc">DTDC</SelectItem>
                    <SelectItem value="bluedart">BlueDart</SelectItem>
                    <SelectItem value="delhivery">Delhivery</SelectItem>
                    <SelectItem value="indiapost">India Post</SelectItem>
                    <SelectItem value="ecom">Ecom Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">COD (Cash on Delivery)</p>
                  <p className="text-xs text-muted-foreground">ग्राहकों को COD का option दें</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="gap-1.5"><Save className="h-4 w-4" /> सेव करें</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔔 नोटिफिकेशन सेटिंग्स</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "नया ऑर्डर आने पर ईमेल", desc: "हर नए ऑर्डर पर admin को ईमेल जाएगा", checked: true },
                { label: "Low Stock अलर्ट", desc: "जब प्रोडक्ट का स्टॉक 5 से कम हो", checked: true },
                { label: "पेमेंट फ़ेल अलर्ट", desc: "Razorpay payment fail होने पर", checked: true },
                { label: "WhatsApp ऑर्डर नोटिफिकेशन", desc: "ग्राहक को WhatsApp पर ऑर्डर अपडेट भेजें", checked: false },
                { label: "Social Post Fail अलर्ट", desc: "Instagram/Facebook auto-post fail होने पर", checked: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
              <Button className="gap-1.5"><Save className="h-4 w-4" /> सेव करें</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
