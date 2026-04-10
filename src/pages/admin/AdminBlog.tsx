import { useState } from "react";
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Search, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { blogPosts } from "@/data/mockData";

const AdminBlog = () => {
  const [search, setSearch] = useState("");
  const filtered = blogPosts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Blog Management</h1>
          <p className="text-sm text-muted-foreground">{blogPosts.length} posts published</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="h-3.5 w-3.5" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif">New Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="text-xs">Title</Label><Input className="mt-1 h-9 text-lg font-serif" placeholder="Enter post title..." /></div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select><SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="herbs">Herbs</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="skincare">Skin Care</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Author</Label>
                  <Input className="mt-1 h-9" placeholder="Dr. Prachi" />
                </div>
                <div>
                  <Label className="text-xs">Read Time</Label>
                  <Input className="mt-1 h-9" placeholder="5 min" />
                </div>
              </div>
              <div><Label className="text-xs">Featured Image URL</Label><Input className="mt-1 h-9" placeholder="https://..." /></div>
              <div><Label className="text-xs">Excerpt</Label><Textarea className="mt-1" rows={2} placeholder="Short summary..." /></div>
              <div>
                <Label className="text-xs">Content</Label>
                <div className="mt-1 border rounded-lg">
                  <div className="flex gap-1 p-2 border-b bg-muted/30">
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-bold">B</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs italic">I</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs underline">U</Button>
                    <div className="w-px bg-border mx-1" />
                    <Button variant="ghost" size="sm" className="h-7 text-xs">H1</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">H2</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">📷</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">🔗</Button>
                  </div>
                  <Textarea className="border-0 focus-visible:ring-0 min-h-[200px]" placeholder="Write your article here..." />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch id="seo" defaultChecked /><Label htmlFor="seo" className="text-xs">SEO Optimized</Label></div>
                <div className="flex items-center gap-2"><Switch id="featured" /><Label htmlFor="featured" className="text-xs">Featured Post</Label></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Publish</Button>
                <Button variant="outline" className="flex-1">Save as Draft</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-primary/5"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{blogPosts.length}</p><p className="text-xs text-muted-foreground">Total Posts</p></CardContent></Card>
        <Card className="bg-accent/5"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">2.4K</p><p className="text-xs text-muted-foreground">Total Views</p></CardContent></Card>
        <Card className="bg-sage/5"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">156</p><p className="text-xs text-muted-foreground">Comments</p></CardContent></Card>
        <Card className="bg-gold/5"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">89%</p><p className="text-xs text-muted-foreground">Engagement</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="all"><TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
              <TabsTrigger value="published" className="text-xs h-7">Published</TabsTrigger>
              <TabsTrigger value="draft" className="text-xs h-7">Drafts</TabsTrigger>
            </TabsList></Tabs>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-8 text-xs w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((post) => (
              <div key={post.id} className="p-4 flex gap-4 hover:bg-muted/20 transition-colors">
                <img src={post.image} alt={post.title} className="h-20 w-32 rounded-lg object-cover shadow-sm shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-sm line-clamp-1">{post.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem className="text-xs"><Eye className="h-3 w-3 mr-2" /> View</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs"><Edit className="h-3 w-3 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]"><Tag className="h-2.5 w-2.5 mr-1" />{post.category}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">✍️ {post.author}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {post.date}</span>
                    <span className="text-[10px] text-muted-foreground">⏱ {post.readTime}</span>
                    <Badge variant="default" className="text-[10px]">Published</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminBlog;
