import { useState } from "react";
import { Upload, Instagram, Facebook, Link2, Eye, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { products } from "@/data/mockData";

const scheduledPosts = [
  { id: 1, platform: "Instagram", product: "Ashwagandha Root Powder", status: "published", date: "2024-01-18" },
  { id: 2, platform: "Facebook", product: "Kumkumadi Face Oil", status: "scheduled", date: "2024-01-22" },
  { id: 3, platform: "Instagram", product: "Chyawanprash Premium", status: "draft", date: "2024-01-25" },
];

const AdminSocial = () => {
  const [postToInsta, setPostToInsta] = useState(true);
  const [postToFb, setPostToFb] = useState(false);
  const [linkedProduct, setLinkedProduct] = useState("");

  return (
    <AdminLayout>
      <h1 className="text-2xl font-serif font-bold mb-6">Social Media Automation</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-lg">Upload & Publish</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop your video/reel here</p>
              <p className="text-xs text-muted-foreground mt-1">MP4, MOV up to 100MB</p>
            </div>

            <div><Label>Caption</Label><Textarea className="mt-1" rows={3} placeholder="Write your caption..." /></div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2"><Instagram className="h-5 w-5 text-pink-500" /><span className="text-sm font-medium">Post to Instagram</span></div>
                <Switch checked={postToInsta} onCheckedChange={setPostToInsta} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2"><Facebook className="h-5 w-5 text-blue-600" /><span className="text-sm font-medium">Post to Facebook</span></div>
                <Switch checked={postToFb} onCheckedChange={setPostToFb} />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1"><Link2 className="h-4 w-4" /> Link to Product</Label>
              <Select value={linkedProduct} onValueChange={setLinkedProduct}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2"><Send className="h-4 w-4" /> Publish Now</Button>
              <Button variant="outline" className="gap-2"><Clock className="h-4 w-4" /> Schedule</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="h-5 w-5" /> Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-muted rounded-xl p-4">
              <div className="aspect-[9/16] bg-foreground/5 rounded-lg flex items-center justify-center mb-4">
                <p className="text-sm text-muted-foreground">Video preview will appear here</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Caption preview...</p>
                <div className="flex gap-2">
                  {postToInsta && <Badge variant="secondary" className="text-xs">📸 Instagram</Badge>}
                  {postToFb && <Badge variant="secondary" className="text-xs">👍 Facebook</Badge>}
                </div>
                {linkedProduct && (
                  <p className="text-xs text-muted-foreground">🔗 Linked: {products.find(p => p.id === linkedProduct)?.name}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Publishing History</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Platform</th>
                  <th className="pb-3 font-medium text-muted-foreground">Linked Product</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {scheduledPosts.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3">{p.platform}</td>
                    <td className="py-3">{p.product}</td>
                    <td className="py-3">
                      <Badge variant={p.status === "published" ? "default" : p.status === "scheduled" ? "secondary" : "outline"} className="text-xs capitalize">{p.status}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSocial;
