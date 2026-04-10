import { useState } from "react";
import { Save, Eye, EyeOff, Globe, Phone, Mail, Shield, Key, Bell, Truck, CreditCard, Lock, Palette, Search, FileText, Users, Database, Webhook, AlertTriangle, CheckCircle, ExternalLink, Copy, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

const AdminSettings = () => {
  const [showMetaSecret, setShowMetaSecret] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Store configuration, API keys, shipping, SEO & security — Super Admin only</p>
        </div>
        <Badge variant="default" className="gap-1 self-start"><Shield className="h-3 w-3" /> Super Admin</Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger value="general" className="text-xs gap-1"><Globe className="h-3 w-3" /> General</TabsTrigger>
          <TabsTrigger value="api" className="text-xs gap-1"><Key className="h-3 w-3" /> API Keys</TabsTrigger>
          <TabsTrigger value="shipping" className="text-xs gap-1"><Truck className="h-3 w-3" /> Shipping</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1"><CreditCard className="h-3 w-3" /> Payments</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs gap-1"><Search className="h-3 w-3" /> SEO</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="h-3 w-3" /> Alerts</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1"><Lock className="h-3 w-3" /> Security</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Store Information</CardTitle>
                <CardDescription className="text-xs">Basic store details displayed across the website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Store Name *</Label><Input className="mt-1 h-9" defaultValue="Apsoncure PHC – Prachi Homeo Clinic" /></div>
                <div><Label className="text-xs">Tagline</Label><Input className="mt-1 h-9" defaultValue="Nature's Power, Modern Science" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label><Input className="mt-1 h-9" defaultValue="info@apsoncure.com" /></div>
                  <div><Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label><Input className="mt-1 h-9" defaultValue="+91 98765 43210" /></div>
                </div>
                <div><Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Website URL</Label><Input className="mt-1 h-9" defaultValue="https://apsoncure.com" /></div>
                <div><Label className="text-xs">Address</Label><Textarea className="mt-1 text-xs" rows={2} defaultValue="Prachi Homeo Clinic, Ayurvedic Wing, India" /></div>
                <div><Label className="text-xs">Store Logo URL</Label><Input className="mt-1 h-9" placeholder="https://..." /></div>
                <div><Label className="text-xs">Favicon URL</Label><Input className="mt-1 h-9" placeholder="https://..." /></div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("Settings saved!")}><Save className="h-4 w-4" /> Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Display Settings</CardTitle>
                <CardDescription className="text-xs">UI preferences & feature toggles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Dark Mode", desc: "Toggle admin panel dark mode", checked: false },
                  { label: "Maintenance Mode", desc: "Show 'Coming Soon' to visitors", checked: false },
                  { label: "Show Product Reviews", desc: "Display ratings on product cards", checked: true },
                  { label: "Show Stock Count", desc: "Show remaining stock to customers", checked: true },
                  { label: "WhatsApp Chat Button", desc: "Floating chat button on frontend", checked: true },
                  { label: "Show Hindi Names", desc: "Display Hindi product names", checked: true },
                  { label: "Enable Reels on Products", desc: "Show social reels on product pages", checked: true },
                  { label: "Cookie Consent Banner", desc: "Show cookie consent popup", checked: true },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API KEYS */}
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
                      <h3 className="font-medium text-sm">Meta Graph API (Instagram/Facebook)</h3>
                      <p className="text-[10px] text-muted-foreground">Auto-publishing Reels, Videos & Stories</p>
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
                  <div className="mt-2"><Label className="text-xs">Instagram Business Account ID</Label><Input className="mt-1 h-9 text-xs" placeholder="17841..." /></div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💳</span>
                    <div>
                      <h3 className="font-medium text-sm">Razorpay Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">UPI, Card, Net Banking, Wallet payments</p>
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
                  <div className="mt-2"><Label className="text-xs">Webhook Secret</Label><Input className="mt-1 h-9 text-xs" type="password" placeholder="whsec_..." /></div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <h3 className="font-medium text-sm">WhatsApp Business API</h3>
                      <p className="text-[10px] text-muted-foreground">Order notifications, auto-reply, customer chat</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Phone Number ID</Label><Input className="mt-1 h-9 text-xs" placeholder="1234567890" /></div>
                    <div><Label className="text-xs">Access Token</Label><Input className="mt-1 h-9 text-xs" type="password" placeholder="EAA..." /></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📊</span>
                    <div>
                      <h3 className="font-medium text-sm">Google Analytics & Search Console</h3>
                      <p className="text-[10px] text-muted-foreground">Traffic tracking & SEO monitoring</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">GA4 Measurement ID</Label><Input className="mt-1 h-9 text-xs" placeholder="G-XXXXXXXXXX" /></div>
                    <div><Label className="text-xs">Search Console Verification</Label><Input className="mt-1 h-9 text-xs" placeholder="google-site-verification=..." /></div>
                  </div>
                </div>

                <Button className="gap-1.5" onClick={() => toast.success("API keys saved!")}><Save className="h-4 w-4" /> Save API Keys</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SHIPPING */}
        <TabsContent value="shipping">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Shipping Configuration</CardTitle>
                <CardDescription className="text-xs">Delivery charges and courier settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Flat Rate Shipping (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="50" /></div>
                  <div><Label className="text-xs">Free Shipping Above (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="499" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Express Shipping (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="150" /></div>
                  <div><Label className="text-xs">COD Extra Charge (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="30" /></div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs mb-2 block">Primary Courier Partner</Label>
                  <Select defaultValue="dtdc">
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dtdc">DTDC</SelectItem>
                      <SelectItem value="bluedart">BlueDart</SelectItem>
                      <SelectItem value="delhivery">Delhivery</SelectItem>
                      <SelectItem value="indiapost">India Post</SelectItem>
                      <SelectItem value="ecom">Ecom Express</SelectItem>
                      <SelectItem value="xpressbees">XpressBees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Estimated Delivery Days</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-[10px] text-muted-foreground">Metro</Label><Input className="h-8 text-xs" defaultValue="3-5" /></div>
                    <div><Label className="text-[10px] text-muted-foreground">Tier 2</Label><Input className="h-8 text-xs" defaultValue="5-7" /></div>
                    <div><Label className="text-[10px] text-muted-foreground">Remote</Label><Input className="h-8 text-xs" defaultValue="7-10" /></div>
                  </div>
                </div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("Shipping settings saved!")}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tax Configuration</CardTitle>
                <CardDescription className="text-xs">GST & tax settings for invoicing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">GST Rate (%)</Label><Input type="number" className="mt-1 h-9" defaultValue="8" /></div>
                  <div><Label className="text-xs">GSTIN Number</Label><Input className="mt-1 h-9" placeholder="22AAAAA0000A1Z5" /></div>
                </div>
                <div><Label className="text-xs">Legal Business Name</Label><Input className="mt-1 h-9" defaultValue="Prachi Homeo Clinic Pvt Ltd" /></div>
                <div><Label className="text-xs">PAN Number</Label><Input className="mt-1 h-9" placeholder="ABCDE1234F" /></div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Include Tax in Price</p>
                    <p className="text-[10px] text-muted-foreground">Prices shown are inclusive of GST</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto-generate Invoice</p>
                    <p className="text-[10px] text-muted-foreground">PDF invoice sent to customer email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("Tax settings saved!")}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Methods</CardTitle>
                <CardDescription className="text-xs">Enable/disable payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "UPI (GPay, PhonePe, Paytm)", desc: "Most popular in India", checked: true, icon: "📱" },
                  { label: "Credit / Debit Card", desc: "Visa, Mastercard, Rupay", checked: true, icon: "💳" },
                  { label: "Net Banking", desc: "All major banks", checked: true, icon: "🏦" },
                  { label: "Wallet (Paytm, Mobikwik)", desc: "Digital wallet payments", checked: false, icon: "👛" },
                  { label: "Cash on Delivery (COD)", desc: "₹30 handling fee applies", checked: true, icon: "💵" },
                  { label: "EMI / Pay Later", desc: "Razorpay affordability widget", checked: false, icon: "📅" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{m.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={m.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Currency</Label>
                  <Select defaultValue="INR">
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                      <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Min Order Amount (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="199" /></div>
                <div><Label className="text-xs">Max COD Amount (₹)</Label><Input type="number" className="mt-1 h-9" defaultValue="5000" /></div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto-capture Payments</p>
                    <p className="text-[10px] text-muted-foreground">Automatically capture authorized payments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Send Payment Receipt</p>
                    <p className="text-[10px] text-muted-foreground">Email receipt on successful payment</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("Payment settings saved!")}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Global SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Default Meta Title</Label><Input className="mt-1 h-9 text-xs" defaultValue="Apsoncure PHC | Authentic Ayurvedic Products Online" /><p className="text-[10px] text-muted-foreground mt-1">58/60 characters</p></div>
                <div><Label className="text-xs">Default Meta Description</Label><Textarea className="mt-1 text-xs" rows={3} defaultValue="Shop authentic Ayurvedic products from Prachi Homeo Clinic. 100% natural herbs, skincare, hair care & immunity boosters. Free delivery ₹499+." /><p className="text-[10px] text-muted-foreground mt-1">148/160 characters</p></div>
                <div><Label className="text-xs">Focus Keywords</Label><Input className="mt-1 h-9 text-xs" defaultValue="ayurvedic products, herbal medicine, natural remedies, apsoncure" /></div>
                <div><Label className="text-xs">Canonical URL</Label><Input className="mt-1 h-9 text-xs" defaultValue="https://apsoncure.com" /></div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto-generate Sitemap</p>
                    <p className="text-[10px] text-muted-foreground">sitemap.xml updated on product/blog changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">JSON-LD Schema</p>
                    <p className="text-[10px] text-muted-foreground">Structured data for products & organization</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("SEO settings saved!")}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Social Media & OG Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">OG Title</Label><Input className="mt-1 h-9 text-xs" defaultValue="Apsoncure – Ancient Ayurvedic Wisdom" /></div>
                <div><Label className="text-xs">OG Description</Label><Textarea className="mt-1 text-xs" rows={2} defaultValue="Authentic Ayurvedic products for modern health. Shop now!" /></div>
                <div><Label className="text-xs">OG Image URL</Label><Input className="mt-1 h-9 text-xs" placeholder="https://apsoncure.com/og-image.jpg" /></div>
                <Separator />
                <div><Label className="text-xs">Twitter Card Type</Label>
                  <Select defaultValue="summary_large_image">
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Twitter Handle</Label><Input className="mt-1 h-9 text-xs" defaultValue="@apsoncure" /></div>
                <Separator />
                <div><Label className="text-xs">robots.txt Content</Label><Textarea className="mt-1 text-xs font-mono" rows={4} defaultValue={"User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://apsoncure.com/sitemap.xml"} /></div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("OG settings saved!")}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Admin Notifications</CardTitle>
                <CardDescription className="text-xs">Alerts sent to admin email/WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "New Order Alert", desc: "Email + WhatsApp on every new order", checked: true, icon: "🛒" },
                  { label: "Low Stock Alert", desc: "When product stock drops below 5", checked: true, icon: "📦" },
                  { label: "Payment Failure", desc: "When Razorpay payment fails", checked: true, icon: "❌" },
                  { label: "Social Post Failure", desc: "When auto-post to Instagram/FB fails", checked: true, icon: "📸" },
                  { label: "New Customer Signup", desc: "When a new customer registers", checked: false, icon: "👤" },
                  { label: "Daily Sales Summary", desc: "End-of-day revenue summary", checked: true, icon: "📊" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span>{n.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Notifications</CardTitle>
                <CardDescription className="text-xs">Automated messages to customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Order Confirmation", desc: "Email + WhatsApp on order placed", checked: true, icon: "✅" },
                  { label: "Shipping Update", desc: "Tracking ID via WhatsApp + SMS", checked: true, icon: "🚚" },
                  { label: "Delivery Confirmation", desc: "Ask for review after delivery", checked: true, icon: "📬" },
                  { label: "Abandoned Cart Reminder", desc: "WhatsApp reminder after 1 hour", checked: false, icon: "🛒" },
                  { label: "Promotional Messages", desc: "New product & offer announcements", checked: false, icon: "📢" },
                  { label: "Birthday Wishes", desc: "Special discount on birthday", checked: false, icon: "🎂" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span>{n.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
                <Button className="gap-1.5 w-full" onClick={() => toast.success("Notification settings saved!")}><Save className="h-4 w-4" /> Save All</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Two-Factor Authentication", desc: "Require 2FA for admin login", checked: false },
                  { label: "Rate Limiting", desc: "Limit API requests per IP", checked: true },
                  { label: "CSRF Protection", desc: "Cross-site request forgery protection", checked: true },
                  { label: "SSL Force Redirect", desc: "Force HTTPS on all pages", checked: true },
                  { label: "Login IP Whitelist", desc: "Restrict admin access to specific IPs", checked: false },
                  { label: "Session Timeout", desc: "Auto-logout after 30 min of inactivity", checked: true },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Backup & Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Last Backup</p>
                    <Badge variant="default" className="text-[9px] gap-1"><CheckCircle className="h-3 w-3" /> Healthy</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">January 22, 2024 at 3:00 AM</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1"><Download className="h-3 w-3" /> Download</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1"><RotateCcw className="h-3 w-3" /> Restore</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto Daily Backup</p>
                    <p className="text-[10px] text-muted-foreground">Backup at 3:00 AM daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <p className="text-sm font-medium text-destructive">Danger Zone</p>
                  <p className="text-[10px] text-muted-foreground mt-1">These actions are irreversible. Proceed with caution.</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs h-7 text-destructive border-destructive/30">Clear Cache</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 text-destructive border-destructive/30">Reset Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
