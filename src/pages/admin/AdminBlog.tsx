import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/AdminLayout";
import { blogPosts } from "@/data/mockData";

const AdminBlog = () => (
  <AdminLayout>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-serif font-bold">Blog Management</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Post</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Blog Post</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Title</Label><Input className="mt-1" placeholder="Post title..." /></div>
            <div><Label>Category</Label><Input className="mt-1" placeholder="e.g. Herbs, Lifestyle" /></div>
            <div><Label>Featured Image URL</Label><Input className="mt-1" placeholder="https://..." /></div>
            <div><Label>Excerpt</Label><Textarea className="mt-1" rows={2} placeholder="Brief summary..." /></div>
            <div><Label>Content</Label><Textarea className="mt-1" rows={10} placeholder="Write your article here..." /></div>
            <Button className="w-full">Publish Post</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 font-medium text-muted-foreground">Post</th>
                <th className="p-4 font-medium text-muted-foreground">Category</th>
                <th className="p-4 font-medium text-muted-foreground">Author</th>
                <th className="p-4 font-medium text-muted-foreground">Date</th>
                <th className="p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogPosts.map((post) => (
                <tr key={post.id} className="border-b last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={post.image} alt={post.title} className="h-10 w-14 rounded object-cover" />
                      <div>
                        <span className="font-medium line-clamp-1">{post.title}</span>
                        <span className="block text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><Badge variant="secondary" className="text-xs">{post.category}</Badge></td>
                  <td className="p-4 text-muted-foreground">{post.author}</td>
                  <td className="p-4 text-muted-foreground">{post.date}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </AdminLayout>
);

export default AdminBlog;
