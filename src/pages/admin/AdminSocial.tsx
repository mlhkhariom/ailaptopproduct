import { useState } from "react";
import { Upload, Instagram, Facebook, Youtube, Link2, Eye, Send, Clock, CheckCircle, TrendingUp, Heart, MessageCircle as MsgIcon, Share2, Calendar, Filter, MoreHorizontal, Play, ExternalLink, Sparkles, Zap, BarChart3, RefreshCw, Globe, Hash, Video, ImageIcon, Trash2, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { products } from "@/data/mockData";

const scheduledPosts = [
  { id: 1, platform: "instagram", product: "Ashwagandha Root Powder", productId: "1", caption: "🌿 Pure Ashwagandha for stress-free living! #ayurveda #apsoncure", status: "published", date: "2024-01-18", time: "10:00 AM", likes: 234, views: "12.5K", comments: 45, shares: 18, embedOnProduct: true, thumbnail: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=200&h=200&fit=crop" },
  { id: 2, platform: "facebook", product: "Kumkumadi Face Oil", productId: "3", caption: "✨ Get glowing skin with Kumkumadi Oil! Ancient Ayurvedic secret.", status: "scheduled", date: "2024-01-22", time: "2:00 PM", likes: 0, views: "—", comments: 0, shares: 0, embedOnProduct: true, thumbnail: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop" },
  { id: 3, platform: "instagram", product: "Chyawanprash Premium", productId: "5", caption: "💪 Boost immunity with 48 herbs! Traditional Chyawanprash.", status: "draft", date: "2024-01-25", time: "11:00 AM", likes: 0, views: "—", comments: 0, shares: 0, embedOnProduct: false, thumbnail: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&h=200&fit=crop" },
  { id: 4, platform: "youtube", product: "Bhringraj Hair Oil", productId: "8", caption: "🧴 How to use Bhringraj Oil for thick, beautiful hair!", status: "published", date: "2024-01-16", time: "6:00 PM", likes: 189, views: "8.7K", comments: 32, shares: 56, embedOnProduct: true, thumbnail: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&h=200&fit=crop" },
  { id: 5, platform: "instagram", product: "Brahmi Memory Tonic", productId: "4", caption: "🧠 Sharpen your mind with Brahmi Tonic! Students favorite.", status: "published", date: "2024-01-14", time: "9:00 AM", likes: 312, views: "18.2K", comments: 67, shares: 34, embedOnProduct: true, thumbnail: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop" },
  { id: 6, platform: "facebook", product: "Neem & Turmeric Soap", productId: "6", caption: "🌿 Handmade Neem soap for clear, healthy skin!", status: "failed", date: "2024-01-20", time: "3:00 PM", likes: 0, views: "—", comments: 0, shares: 0, embedOnProduct: false, thumbnail: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop" },
];

const socialStats = [
  { platform: "Instagram", followers: "15.2K", engagement: "4.8%", icon: Instagram, color: "text-pink-500", bgColor: "bg-pink-500/10", posts: 45, growth: "+12%", reach: "52K" },
  { platform: "Facebook", followers: "8.5K", engagement: "3.2%", icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-600/10", posts: 32, growth: "+8%", reach: "28K" },
  { platform: "YouTube", followers: "3.1K", engagement: "6.1%", icon: Youtube, color: "text-red-500", bgColor: "bg-red-500/10", posts: 18, growth: "+22%", reach: "15K" },
];

const calendarDays = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  posts: scheduledPosts.filter(p => parseInt(p.date.split('-')[2]) === i + 1).length,
}));

const hashtagSuggestions = ["#ayurveda", "#naturalhealth", "#herbalremedies", "#apsoncure", "#ayurvedicmedicine", "#holistichealth", "#organiclife", "#traditionalhealing"];

const AdminSocial = () => {
  const [postToInsta, setPostToInsta] = useState(true);
  const [postToFb, setPostToFb] = useState(false);
  const [postToYt, setPostToYt] = useState(false);
  const [linkedProduct, setLinkedProduct] = useState("");
  const [embedOnProduct, setEmbedOnProduct] = useState(true);
  const [autoGenCaption, setAutoGenCaption] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("#ayurveda #apsoncure #health");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const filteredPosts = scheduledPosts.filter(p => {
    if (filterPlatform !== "all" && p.platform !== filterPlatform) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  const totalReach = "95K";
  const totalEngagement = "4.7%";
  const totalPosts = 95;

  const getPlatformIcon = (platform: string) => {
    if (platform === "instagram") return <Instagram className="h-4 w-4 text-pink-500" />;
    if (platform === "facebook") return <Facebook className="h-4 w-4 text-blue-600" />;
    if (platform === "youtube") return <Youtube className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      published: { label: "✓ Published", variant: "default" },
      scheduled: { label: "🕐 Scheduled", variant: "secondary" },
      draft: { label: "📝 Draft", variant: "outline" },
      failed: { label: "✕ Failed", variant: "destructive" },
    };
    const s = map[status] || map.draft;
    return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            Social Media Automation
            <Badge className="text-[9px] bg-primary/10 text-primary border-0">PRO</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Upload reels, auto-link to products, publish & track across platforms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><RefreshCw className="h-3.5 w-3.5" /> Sync</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><BarChart3 className="h-3.5 w-3.5" /> Analytics</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {socialStats.map((s) => (
          <Card key={s.platform} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${s.bgColor} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <Badge variant="secondary" className="text-[9px] text-green-600">{s.growth}</Badge>
              </div>
              <p className="font-semibold text-sm">{s.platform}</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <p className="text-base font-bold">{s.followers}</p>
                  <p className="text-[9px] text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-base font-bold">{s.engagement}</p>
                  <p className="text-[9px] text-muted-foreground">Engage</p>
                </div>
                <div>
                  <p className="text-base font-bold">{s.reach}</p>
                  <p className="text-[9px] text-muted-foreground">Reach</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="default" className="text-[9px]">Total</Badge>
            </div>
            <p className="font-semibold text-sm">All Platforms</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <p className="text-base font-bold">{totalPosts}</p>
                <p className="text-[9px] text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-base font-bold">{totalReach}</p>
                <p className="text-[9px] text-muted-foreground">Reach</p>
              </div>
              <div>
                <p className="text-base font-bold">{totalEngagement}</p>
                <p className="text-[9px] text-muted-foreground">Engage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="create" className="text-xs gap-1"><Upload className="h-3 w-3" /> Create Post</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1"><Clock className="h-3 w-3" /> History</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs gap-1"><Calendar className="h-3 w-3" /> Calendar</TabsTrigger>
          <TabsTrigger value="linked" className="text-xs gap-1"><Link2 className="h-3 w-3" /> Linked Reels</TabsTrigger>
        </TabsList>

        {/* CREATE POST TAB */}
        <TabsContent value="create">
          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4" /> Upload Reel / Video
                </CardTitle>
                <CardDescription className="text-xs">Upload and publish directly to Instagram, Facebook & YouTube — auto-linked to product page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20 group">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Drop video / reel here</p>
                  <p className="text-[10px] text-muted-foreground mt-1">MP4, MOV • Max 100MB • 9:16 Reels or 16:9 Videos</p>
                  <Button variant="outline" size="sm" className="mt-3 text-xs">Browse Files</Button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">Caption</Label>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 gap-1 text-primary" onClick={() => {
                      const p = products.find(pr => pr.id === linkedProduct);
                      if (p) {
                        setCaption(`🌿 ${p.name} – ${p.description.slice(0, 100)}...`);
                        toast.success("Caption auto-generated from product!");
                      } else {
                        toast.error("Select a product first");
                      }
                    }}>
                      <Sparkles className="h-3 w-3" /> Auto-Generate
                    </Button>
                  </div>
                  <Textarea rows={3} placeholder="Write your caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">{caption.length}/2200 characters</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">Hashtags</Label>
                    <span className="text-[10px] text-muted-foreground">{hashtags.split('#').length - 1}/30 tags</span>
                  </div>
                  <Textarea rows={2} value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hashtagSuggestions.slice(0, 5).map(tag => (
                      <Button key={tag} variant="outline" size="sm" className="text-[9px] h-5 px-2" onClick={() => setHashtags(prev => prev + " " + tag)}>
                        + {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs font-medium mb-2 block">Publish To:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${postToInsta ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/20 shadow-sm' : 'hover:border-muted-foreground/30'}`} onClick={() => setPostToInsta(!postToInsta)}>
                      <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-500" /><span className="text-xs font-medium">Instagram</span></div>
                      <Switch checked={postToInsta} onCheckedChange={setPostToInsta} className="scale-75" />
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${postToFb ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-sm' : 'hover:border-muted-foreground/30'}`} onClick={() => setPostToFb(!postToFb)}>
                      <div className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600" /><span className="text-xs font-medium">Facebook</span></div>
                      <Switch checked={postToFb} onCheckedChange={setPostToFb} className="scale-75" />
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${postToYt ? 'border-red-400 bg-red-50 dark:bg-red-950/20 shadow-sm' : 'hover:border-muted-foreground/30'}`} onClick={() => setPostToYt(!postToYt)}>
                      <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-500" /><span className="text-xs font-medium">YouTube</span></div>
                      <Switch checked={postToYt} onCheckedChange={setPostToYt} className="scale-75" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Product Linking</span>
                    <Badge variant="secondary" className="text-[9px]">Auto</Badge>
                  </div>
                  <Select value={linkedProduct} onValueChange={setLinkedProduct}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select product to link reel..." /></SelectTrigger>
                    <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} (₹{p.price})</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <Checkbox checked={embedOnProduct} onCheckedChange={(v) => setEmbedOnProduct(!!v)} />
                    <div>
                      <p className="text-xs font-medium">Embed reel on product page</p>
                      <p className="text-[10px] text-muted-foreground">This reel will appear in the product's "Reels & Videos" section automatically</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs font-medium mb-2 block">Schedule (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-[10px] text-muted-foreground">Date</Label><Input type="date" className="h-9 text-xs" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} /></div>
                    <div><Label className="text-[10px] text-muted-foreground">Time</Label><Input type="time" className="h-9 text-xs" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} /></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 gap-1.5 h-11" onClick={() => toast.success("Post published to selected platforms!")}>
                    <Send className="h-4 w-4" /> Publish Now
                  </Button>
                  <Button variant="outline" className="gap-1.5 h-11" onClick={() => toast.success("Post scheduled!")}>
                    <Clock className="h-4 w-4" /> Schedule
                  </Button>
                  <Button variant="secondary" className="gap-1.5 h-11" onClick={() => toast.info("Saved as draft")}>
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" /> Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-2xl overflow-hidden border">
                  <div className="aspect-[9/16] bg-foreground/5 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Play className="h-8 w-8 text-primary/50" />
                      </div>
                      <p className="text-xs text-muted-foreground">Video preview</p>
                    </div>
                    {linkedProduct && (
                      <div className="absolute bottom-3 left-3 right-3 p-2 rounded-lg bg-background/90 backdrop-blur-sm border flex items-center gap-2">
                        <img src={products.find(p => p.id === linkedProduct)?.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium truncate">{products.find(p => p.id === linkedProduct)?.name}</p>
                          <p className="text-[10px] text-primary font-bold">₹{products.find(p => p.id === linkedProduct)?.price}</p>
                        </div>
                        <Button size="sm" className="text-[9px] h-6 px-2">View</Button>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-[9px] font-bold text-primary">A</span></div>
                      <span className="text-xs font-semibold">apsoncure_phc</span>
                      <Badge variant="secondary" className="text-[8px] ml-auto">Preview</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Heart className="h-5 w-5" />
                      <MsgIcon className="h-5 w-5" />
                      <Share2 className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{caption || "Caption will appear here..."}</p>
                    <p className="text-[10px] text-primary/70">{hashtags}</p>
                    <div className="flex gap-1 flex-wrap pt-1">
                      {postToInsta && <Badge className="text-[8px] h-4 bg-pink-500/10 text-pink-500 border-0">📸 Instagram</Badge>}
                      {postToFb && <Badge className="text-[8px] h-4 bg-blue-500/10 text-blue-500 border-0">👍 Facebook</Badge>}
                      {postToYt && <Badge className="text-[8px] h-4 bg-red-500/10 text-red-500 border-0">▶ YouTube</Badge>}
                      {embedOnProduct && linkedProduct && <Badge className="text-[8px] h-4 bg-green-500/10 text-green-600 border-0">🔗 Product Linked</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">Publishing History</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredPosts.map((p) => (
                  <div key={p.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <img src={p.thumbnail} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getPlatformIcon(p.platform)}
                          <span className="text-sm font-medium truncate">{p.product}</span>
                          {getStatusBadge(p.status)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{p.caption}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📅 {p.date} {p.time}</span>
                          {p.status === "published" && (
                            <>
                              <span>👁 {p.views}</span>
                              <span>❤ {p.likes}</span>
                              <span>💬 {p.comments}</span>
                              <span>🔗 {p.shares}</span>
                            </>
                          )}
                        </div>
                        {p.embedOnProduct && (
                          <Badge variant="outline" className="text-[9px] mt-2 gap-1">
                            <Link2 className="h-2.5 w-2.5" /> Embedded on product page
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {p.status === "failed" && (
                          <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1">
                            <RefreshCw className="h-3 w-3" /> Retry
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CALENDAR TAB */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Content Calendar – January 2024</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7">← Prev</Button>
                  <Button variant="outline" size="sm" className="text-xs h-7">Next →</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* offset for Jan 2024 starting on Monday */}
                <div className="aspect-square" />
                {calendarDays.map(({ day, posts }) => (
                  <div key={day} className={`aspect-square rounded-lg border text-center flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${posts > 0 ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <span className="text-xs font-medium">{day}</span>
                    {posts > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(posts, 3) }).map((_, i) => (
                          <div key={i} className="h-1 w-1 rounded-full bg-primary" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Scheduled this month:</p>
                {scheduledPosts.filter(p => p.status === "scheduled").map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    {getPlatformIcon(p.platform)}
                    <div className="flex-1">
                      <p className="text-xs font-medium">{p.product}</p>
                      <p className="text-[10px] text-muted-foreground">{p.date} at {p.time}</p>
                    </div>
                    {getStatusBadge(p.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LINKED REELS TAB */}
        <TabsContent value="linked">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Product-Linked Reels
              </CardTitle>
              <CardDescription className="text-xs">
                Reels linked to products automatically appear on their product detail pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.map(product => {
                  const linkedReels = scheduledPosts.filter(p => p.productId === product.id && p.embedOnProduct);
                  const productReelCount = product.reels.length + linkedReels.length;
                  return (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/20 transition-colors">
                      <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-center px-3">
                        <p className="text-lg font-bold text-primary">{productReelCount}</p>
                        <p className="text-[9px] text-muted-foreground">Reels</p>
                      </div>
                      <div className="flex gap-1">
                        {product.reels.slice(0, 3).map(r => (
                          <div key={r.id} className="h-10 w-8 rounded-md overflow-hidden bg-muted">
                            <img src={r.thumbnail} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1 shrink-0">
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSocial;
