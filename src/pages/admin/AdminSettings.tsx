import { useState } from "react";
import { Save, Eye, EyeOff, Globe, Phone, Mail, Shield, Key } from "lucide-react";
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
          <h1 className="text-2xl font-serif font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Store, API, shipping & notification settings — Super Admin only</p>
        </div>
        <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" /> Super Admin</Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="api" className="text-xs">API Keys</TabsTrigger>
          <TabsTrigger value="shipping" className="text-xs">Shipping & Tax</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
              <CardDescription className="text-xs">Basic store information displayed across the website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Store Name *</Label><Input className="mt-1 h-9" defaultValue="Apsoncure PHC – Prachi Homeo Clinic" /></div>
                <div><Label className="text-xs">Tagline</Label><Input className="mt-1 h-9" defaultValue="Nature's Power, Modern Science" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> Contact Email *</Label><Input className="mt-1 h-9" defaultValue="info@apsoncure.com" /></div>
                <div><Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Customer Support WhatsApp *</Label><Input className="mt-1 h-9" defaultValue="+91 98765 43210" /><p className="text-[10px] text-muted-foreground mt-0.5">This number appears on the frontend chat button</p></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Website URL</Label><Input className="mt-1 h-9" defaultValue="https://apsoncure.com" /></div>
                <div><Label className="text-xs">Store Logo URL</Label><Input className="mt-1 h-9" placeholder="https://..." /></div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle admin panel dark mode</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Show "Coming Soon" page to visitors</p>
                </div>
                <Switch />
              </div>
              <Button className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <div className="space-y-4">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> API Keys & Secrets</CardTitle>
                <CardDescription className="text-xs">⚠️ Keep these keys secure — never share with anyone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📸</span>
                    <div>
                      <h3 className="font-medium text-sm">Meta Graph API (Instagram/Facebook Auto-Post)</h3>
                      <p className="text-[10px] text-muted-foreground">For auto-publishing Instagram Reels and Facebook Videos</p>
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

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💳</span>
                    <div>
                      <h3 className="font-medium text-sm">Razorpay Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">For online payments (UPI, Card, Net Banking)</p>
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

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <h3 className="font-medium text-sm">WhatsApp Business API</h3>
                      <p className="text-[10px] text-muted-foreground">Auto-reply, order notifications, customer chat</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">WhatsApp Business Phone Number ID</Label><Input className="mt-1 h-9 text-xs" placeholder="1234567890" /></div>
                    <div><Label className="text-xs">WhatsApp Access Token</Label><Input className="mt-1 h-9 text-xs" type="password" placeholder="EAA..." /></div>
                  </div>
                </div>

                <Button className="gap-1.5"><Save className="h-4 w-4" /> Save API Keys</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping & Tax Settings</CardTitle>
              <CardDescription className="text-xs">Delivery charges and GST configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Shipping Charge (Flat Rate) ₹</Label><Input type="number" className="mt-1 h-9" defaultValue="50" /></div>
                <div><Label className="text-xs">Free Shipping Above (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="499" /><p className="text-[10px] text-muted-foreground mt-0.5">Orders above ₹499 get free shipping</p></div>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">GST Rate (%)</Label><Input type="number" className="mt-1 h-9" defaultValue="8" /></div>
                <div><Label className="text-xs">GST Number</Label><Input className="mt-1 h-9" placeholder="22AAAAA0000A1Z5" /></div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs mb-2 block">Preferred Courier Partner</Label>
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
                  <p className="text-xs text-muted-foreground">Allow customers to pay on delivery</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New Order Email", desc: "Send email to admin on every new order", checked: true },
                { label: "Low Stock Alert", desc: "When product stock drops below 5", checked: true },
                { label: "Payment Failure Alert", desc: "When a Razorpay payment fails", checked: true },
                { label: "WhatsApp Order Updates", desc: "Send order updates to customers via WhatsApp", checked: false },
                { label: "Social Post Failure", desc: "When Instagram/Facebook auto-post fails", checked: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
              <Button className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
