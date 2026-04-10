import { useState } from "react";
import { Upload, Instagram, Facebook, Youtube, Link2, Eye, Send, Clock, CheckCircle, TrendingUp, Heart, MessageCircle as MsgIcon, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { products } from "@/data/mockData";

const scheduledPosts = [
  { id: 1, platform: "Instagram", product: "Ashwagandha Root Powder", status: "published", date: "2024-01-18", likes: 234, views: "12.5K" },
  { id: 2, platform: "Facebook", product: "Kumkumadi Face Oil", status: "scheduled", date: "2024-01-22", likes: 0, views: "—" },
  { id: 3, platform: "Instagram", product: "Chyawanprash Premium", status: "draft", date: "2024-01-25", likes: 0, views: "—" },
  { id: 4, platform: "YouTube", product: "Bhringraj Hair Oil", status: "published", date: "2024-01-16", likes: 189, views: "8.7K" },
];

const socialStats = [
  { platform: "Instagram", followers: "15.2K", engagement: "4.8%", icon: Instagram, color: "text-pink-500", posts: 45 },
  { platform: "Facebook", followers: "8.5K", engagement: "3.2%", icon: Facebook, color: "text-blue-600", posts: 32 },
  { platform: "YouTube", followers: "3.1K", engagement: "6.1%", icon: Youtube, color: "text-red-500", posts: 18 },
];

const AdminSocial = () => {
  const [postToInsta, setPostToInsta] = useState(true);
  const [postToFb, setPostToFb] = useState(false);
  const [postToYt, setPostToYt] = useState(false);
  const [linkedProduct, setLinkedProduct] = useState("");

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Social Media Automation</h1>
          <p className="text-sm text-muted-foreground">Upload reels, publish & track across platforms</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><TrendingUp className="h-3.5 w-3.5" /> Analytics</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {socialStats.map((s) => (
          <Card key={s.platform}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{s.platform}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div><p className="text-lg font-bold">{s.followers}</p><p className="text-[10px] text-muted-foreground">Followers</p></div>
                  <div><p className="text-lg font-bold">{s.engagement}</p><p className="text-[10px] text-muted-foreground">Engagement</p></div>
                  <div><p className="text-lg font-bold">{s.posts}</p><p className="text-[10px] text-muted-foreground">Posts</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mb-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload Reel / Video</CardTitle>
            <CardDescription className="text-xs">Upload and publish directly to Instagram, Facebook & YouTube</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drop video / reel here</p>
              <p className="text-[10px] text-muted-foreground mt-1">MP4, MOV • Max 100MB • 9:16 Reels or 16:9 Videos</p>
              <Button variant="outline" size="sm" className="mt-3 text-xs">Browse Files</Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Caption</Label><Textarea className="mt-1" rows={2} placeholder="Write caption..." /></div>
              <div><Label className="text-xs">Hashtags</Label><Textarea className="mt-1" rows={2} placeholder="#ayurveda #apsoncure #health" /></div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Select Platforms:</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${postToInsta ? 'border-pink-300 bg-pink-50 dark:bg-pink-950/20' : ''}`} onClick={() => setPostToInsta(!postToInsta)}>
                  <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-500" /><span className="text-xs font-medium">Instagram</span></div>
                  <Switch checked={postToInsta} onCheckedChange={setPostToInsta} className="scale-75" />
                </div>
                <div className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${postToFb ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/20' : ''}`} onClick={() => setPostToFb(!postToFb)}>
                  <div className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600" /><span className="text-xs font-medium">Facebook</span></div>
                  <Switch checked={postToFb} onCheckedChange={setPostToFb} className="scale-75" />
                </div>
                <div className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${postToYt ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}`} onClick={() => setPostToYt(!postToYt)}>
                  <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-500" /><span className="text-xs font-medium">YouTube</span></div>
                  <Switch checked={postToYt} onCheckedChange={setPostToYt} className="scale-75" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> Link to Product</Label>
              <Select value={linkedProduct} onValueChange={setLinkedProduct}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select product..." /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5"><Send className="h-4 w-4" /> Publish Now</Button>
              <Button variant="outline" className="gap-1.5"><Clock className="h-4 w-4" /> Schedule</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" /> Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-xl overflow-hidden">
              <div className="aspect-[9/16] bg-foreground/5 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">Video preview will appear here</p>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-[8px] font-bold text-primary">A</span></div>
                  <span className="text-xs font-medium">apsoncure_phc</span>
                  <Badge variant="secondary" className="text-[8px] ml-auto">Preview</Badge>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <MsgIcon className="h-4 w-4" />
                  <Share2 className="h-4 w-4" />
                </div>
                <p className="text-[10px] text-muted-foreground">Caption will appear here...</p>
                <div className="flex gap-1 flex-wrap">
                  {postToInsta && <Badge className="text-[8px] h-4 bg-pink-500/10 text-pink-500 border-0">📸 IG</Badge>}
                  {postToFb && <Badge className="text-[8px] h-4 bg-blue-500/10 text-blue-500 border-0">👍 FB</Badge>}
                  {postToYt && <Badge className="text-[8px] h-4 bg-red-500/10 text-red-500 border-0">▶ YT</Badge>}
                  {linkedProduct && <Badge className="text-[8px] h-4" variant="outline">🔗 {products.find(p => p.id === linkedProduct)?.name?.slice(0, 15)}...</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Publishing History</CardTitle>
            <Tabs defaultValue="all"><TabsList className="h-7">
              <TabsTrigger value="all" className="text-xs h-6 px-2">All</TabsTrigger>
              <TabsTrigger value="published" className="text-xs h-6 px-2">Published</TabsTrigger>
              <TabsTrigger value="scheduled" className="text-xs h-6 px-2">Scheduled</TabsTrigger>
            </TabsList></Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30 text-left">
              <th className="p-3 text-xs font-medium text-muted-foreground">Platform</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Linked Product</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Views</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Likes</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Date</th>
            </tr></thead>
            <tbody>
              {scheduledPosts.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-3 flex items-center gap-2">
                    {p.platform === "Instagram" && <Instagram className="h-4 w-4 text-pink-500" />}
                    {p.platform === "Facebook" && <Facebook className="h-4 w-4 text-blue-600" />}
                    {p.platform === "YouTube" && <Youtube className="h-4 w-4 text-red-500" />}
                    <span className="text-xs">{p.platform}</span>
                  </td>
                  <td className="p-3 text-xs">{p.product}</td>
                  <td className="p-3">
                    <Badge variant={p.status === "published" ? "default" : p.status === "scheduled" ? "secondary" : "outline"} className="text-[10px] capitalize">
                      {p.status === "published" ? "✓ Published" : p.status === "scheduled" ? "🕐 Scheduled" : "📝 Draft"}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs font-medium">{p.views}</td>
                  <td className="p-3 text-xs">{p.likes > 0 ? `❤ ${p.likes}` : '—'}</td>
                  <td className="p-3 text-xs text-muted-foreground">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSocial;
