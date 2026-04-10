import { useState } from "react";
import { Save, Plus, Trash2, Eye, EyeOff, Edit, Image, GripVertical, Star, MessageCircle, HelpCircle, Settings, Layout, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { useCMSStore } from "@/store/cmsStore";

const AdminCMS = () => {
  const cms = useCMSStore();
  const [editingBanner, setEditingBanner] = useState<string | null>(null);

  const activeBanner = cms.heroBanners.find((h) => h.active);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Content Management</h1>
          <p className="text-sm text-muted-foreground">Manage hero banners, testimonials, FAQs & site content</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.success("All changes saved!")}><Save className="h-3.5 w-3.5" /> Save All</Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="h-8">
          <TabsTrigger value="hero" className="text-xs h-7 px-3 gap-1"><Layout className="h-3 w-3" /> Hero Banner</TabsTrigger>
          <TabsTrigger value="benefits" className="text-xs h-7 px-3 gap-1"><Award className="h-3 w-3" /> Benefits</TabsTrigger>
          <TabsTrigger value="testimonials" className="text-xs h-7 px-3 gap-1"><Star className="h-3 w-3" /> Testimonials</TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs h-7 px-3 gap-1"><HelpCircle className="h-3 w-3" /> FAQs</TabsTrigger>
          <TabsTrigger value="site" className="text-xs h-7 px-3 gap-1"><Settings className="h-3 w-3" /> Site Settings</TabsTrigger>
        </TabsList>

        {/* HERO BANNER */}
        <TabsContent value="hero" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Hero Banners ({cms.heroBanners.length})</h2>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={() => {
              const id = Date.now().toString();
              cms.addHeroBanner({ id, tagline: "New Banner", heading: "Heading", headingHighlight: "Highlight", subtitle: "Subtitle", subtext: "", ctaText: "Shop Now", ctaLink: "/products", secondaryCtaText: "", secondaryCtaLink: "", image: "", badgeText: "", badgeSubtext: "", active: false });
              setEditingBanner(id);
            }}>
              <Plus className="h-3 w-3" /> Add Banner
            </Button>
          </div>

          {cms.heroBanners.map((banner) => (
            <Card key={banner.id} className={`transition-all ${banner.active ? "ring-2 ring-primary" : ""}`}>
              <CardContent className="p-4">
                {editingBanner === banner.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Tagline</Label><Input className="mt-1 h-8 text-xs" value={banner.tagline} onChange={(e) => cms.updateHeroBanner(banner.id, { tagline: e.target.value })} /></div>
                      <div><Label className="text-xs">Heading Highlight</Label><Input className="mt-1 h-8 text-xs" value={banner.headingHighlight} onChange={(e) => cms.updateHeroBanner(banner.id, { headingHighlight: e.target.value })} /></div>
                    </div>
                    <div><Label className="text-xs">Heading (after highlight)</Label><Input className="mt-1 h-8 text-xs" value={banner.heading} onChange={(e) => cms.updateHeroBanner(banner.id, { heading: e.target.value })} /></div>
                    <div><Label className="text-xs">Subtitle</Label><Textarea className="mt-1 text-xs" rows={2} value={banner.subtitle} onChange={(e) => cms.updateHeroBanner(banner.id, { subtitle: e.target.value })} /></div>
                    <div><Label className="text-xs">Sub-text</Label><Input className="mt-1 h-8 text-xs" value={banner.subtext} onChange={(e) => cms.updateHeroBanner(banner.id, { subtext: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">CTA Text</Label><Input className="mt-1 h-8 text-xs" value={banner.ctaText} onChange={(e) => cms.updateHeroBanner(banner.id, { ctaText: e.target.value })} /></div>
                      <div><Label className="text-xs">CTA Link</Label><Input className="mt-1 h-8 text-xs" value={banner.ctaLink} onChange={(e) => cms.updateHeroBanner(banner.id, { ctaLink: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Secondary CTA</Label><Input className="mt-1 h-8 text-xs" value={banner.secondaryCtaText} onChange={(e) => cms.updateHeroBanner(banner.id, { secondaryCtaText: e.target.value })} /></div>
                      <div><Label className="text-xs">Secondary Link</Label><Input className="mt-1 h-8 text-xs" value={banner.secondaryCtaLink} onChange={(e) => cms.updateHeroBanner(banner.id, { secondaryCtaLink: e.target.value })} /></div>
                    </div>
                    <div><Label className="text-xs">Image URL</Label><Input className="mt-1 h-8 text-xs" value={banner.image} onChange={(e) => cms.updateHeroBanner(banner.id, { image: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Badge Text</Label><Input className="mt-1 h-8 text-xs" value={banner.badgeText} onChange={(e) => cms.updateHeroBanner(banner.id, { badgeText: e.target.value })} /></div>
                      <div><Label className="text-xs">Badge Subtext</Label><Input className="mt-1 h-8 text-xs" value={banner.badgeSubtext} onChange={(e) => cms.updateHeroBanner(banner.id, { badgeSubtext: e.target.value })} /></div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2"><Switch checked={banner.active} onCheckedChange={(v) => cms.updateHeroBanner(banner.id, { active: v })} /><Label className="text-xs">Active</Label></div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => { cms.deleteHeroBanner(banner.id); setEditingBanner(null); }}><Trash2 className="h-3 w-3" /></Button>
                        <Button size="sm" className="text-xs h-7" onClick={() => { setEditingBanner(null); toast.success("Banner saved!"); }}><Save className="h-3 w-3 mr-1" /> Done</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {banner.image && <img src={banner.image} alt="" className="h-16 w-24 rounded-lg object-cover" />}
                      <div>
                        <p className="font-medium text-sm">{banner.headingHighlight} {banner.heading}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{banner.subtitle}</p>
                        <Badge variant={banner.active ? "default" : "secondary"} className="text-[9px] mt-1">{banner.active ? "Active" : "Draft"}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditingBanner(banner.id)}><Edit className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* BENEFITS */}
        <TabsContent value="benefits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Benefit Cards ({cms.benefits.length})</h2>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={() => cms.addBenefit({ id: Date.now().toString(), icon: "Leaf", title: "New Benefit", description: "Description here", active: true })}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {cms.benefits.map((b) => (
              <Card key={b.id} className={!b.active ? "opacity-50" : ""}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Select value={b.icon} onValueChange={(v) => cms.updateBenefit(b.id, { icon: v })}>
                      <SelectTrigger className="h-7 w-32 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Leaf", "Award", "Truck", "HeartPulse", "Shield", "Star", "Heart", "Target"].map((i) => <SelectItem key={i} value={i} className="text-xs">{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch checked={b.active} onCheckedChange={(v) => cms.updateBenefit(b.id, { active: v })} className="scale-75" />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cms.deleteBenefit(b.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </div>
                  <Input className="h-8 text-xs font-medium" value={b.title} onChange={(e) => cms.updateBenefit(b.id, { title: e.target.value })} />
                  <Input className="h-8 text-xs" value={b.description} onChange={(e) => cms.updateBenefit(b.id, { description: e.target.value })} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TESTIMONIALS */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Customer Testimonials ({cms.testimonials.length})</h2>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={() => cms.addTestimonial({ id: Date.now().toString(), name: "Customer Name", text: "Review text here", rating: 5, avatar: "CN", location: "City", active: true })}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {cms.testimonials.map((t) => (
              <Card key={t.id} className={!t.active ? "opacity-50" : ""}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input className="h-7 w-20 text-xs" value={t.avatar} onChange={(e) => cms.updateTestimonial(t.id, { avatar: e.target.value })} />
                      <Select value={t.rating.toString()} onValueChange={(v) => cms.updateTestimonial(t.id, { rating: parseInt(v) })}>
                        <SelectTrigger className="h-7 w-20 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{[1, 2, 3, 4, 5].map((r) => <SelectItem key={r} value={r.toString()} className="text-xs">{"⭐".repeat(r)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={t.active} onCheckedChange={(v) => cms.updateTestimonial(t.id, { active: v })} className="scale-75" />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cms.deleteTestimonial(t.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input className="h-8 text-xs" placeholder="Name" value={t.name} onChange={(e) => cms.updateTestimonial(t.id, { name: e.target.value })} />
                    <Input className="h-8 text-xs" placeholder="Location" value={t.location} onChange={(e) => cms.updateTestimonial(t.id, { location: e.target.value })} />
                  </div>
                  <Textarea className="text-xs" rows={2} value={t.text} onChange={(e) => cms.updateTestimonial(t.id, { text: e.target.value })} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQS */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">FAQs ({cms.faqs.length})</h2>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={() => cms.addFAQ({ id: Date.now().toString(), question: "New Question?", answer: "Answer here", category: "General", active: true, order: cms.faqs.length + 1 })}>
              <Plus className="h-3 w-3" /> Add FAQ
            </Button>
          </div>
          <div className="space-y-2">
            {cms.faqs.map((faq) => (
              <Card key={faq.id} className={!faq.active ? "opacity-50" : ""}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    <Input className="h-8 text-xs font-medium flex-1" value={faq.question} onChange={(e) => cms.updateFAQ(faq.id, { question: e.target.value })} />
                    <Select value={faq.category} onValueChange={(v) => cms.updateFAQ(faq.id, { category: v })}>
                      <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["General", "Products", "Shipping", "Payment", "Returns", "Consultation"].map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Switch checked={faq.active} onCheckedChange={(v) => cms.updateFAQ(faq.id, { active: v })} className="scale-75" />
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => cms.deleteFAQ(faq.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                  <Textarea className="text-xs" rows={2} value={faq.answer} onChange={(e) => cms.updateFAQ(faq.id, { answer: e.target.value })} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SITE SETTINGS */}
        <TabsContent value="site" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Store Name</Label><Input className="mt-1 h-8 text-xs" value={cms.siteSettings.storeName} onChange={(e) => cms.updateSiteSettings({ storeName: e.target.value })} /></div>
                <div><Label className="text-xs">Tagline</Label><Input className="mt-1 h-8 text-xs" value={cms.siteSettings.tagline} onChange={(e) => cms.updateSiteSettings({ tagline: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-8 text-xs" value={cms.siteSettings.phone} onChange={(e) => cms.updateSiteSettings({ phone: e.target.value })} /></div>
                <div><Label className="text-xs">Email</Label><Input className="mt-1 h-8 text-xs" value={cms.siteSettings.email} onChange={(e) => cms.updateSiteSettings({ email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">WhatsApp Number</Label><Input className="mt-1 h-8 text-xs" value={cms.siteSettings.whatsappNumber} onChange={(e) => cms.updateSiteSettings({ whatsappNumber: e.target.value })} /></div>
                <div><Label className="text-xs">Working Hours</Label><Input className="mt-1 h-8 text-xs" value={cms.siteSettings.workingHours} onChange={(e) => cms.updateSiteSettings({ workingHours: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Input className="mt-1 h-8 text-xs" value={cms.siteSettings.address} onChange={(e) => cms.updateSiteSettings({ address: e.target.value })} /></div>
              <div><Label className="text-xs">Footer Text</Label><Textarea className="mt-1 text-xs" rows={2} value={cms.siteSettings.footerText} onChange={(e) => cms.updateSiteSettings({ footerText: e.target.value })} /></div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Switch checked={cms.siteSettings.announcementActive} onCheckedChange={(v) => cms.updateSiteSettings({ announcementActive: v })} />
                <div className="flex-1">
                  <Label className="text-xs">Announcement Bar</Label>
                  <Input className="mt-1 h-8 text-xs" value={cms.siteSettings.announcementBar} onChange={(e) => cms.updateSiteSettings({ announcementBar: e.target.value })} />
                </div>
              </div>
              <Button className="w-full" onClick={() => toast.success("Settings saved!")}><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminCMS;
