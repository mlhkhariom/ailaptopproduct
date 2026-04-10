import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/AdminLayout";
import { categoryList } from "@/data/mockData";

const AdminCategories = () => {
  const [search, setSearch] = useState("");
  const filtered = categoryList.filter(c => c.name.includes(search) || c.nameEn.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">🏷️ श्रेणी प्रबंधन (Categories)</h1>
          <p className="text-sm text-muted-foreground">{categoryList.length} श्रेणियां — SEO Meta Description सहित</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="h-3.5 w-3.5" /> नई श्रेणी जोड़ें</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">🏷️ नई श्रेणी</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">हिंदी नाम *</Label><Input className="mt-1 h-9" placeholder="जड़ी-बूटी" /></div>
                <div><Label className="text-xs">English Name *</Label><Input className="mt-1 h-9" placeholder="Herbs" /></div>
              </div>
              <div><Label className="text-xs">Slug (URL) *</Label><Input className="mt-1 h-9" placeholder="herbs" /><p className="text-[10px] text-muted-foreground mt-0.5">URL: /category/herbs</p></div>
              <div><Label className="text-xs">📷 Category Image URL</Label><Input className="mt-1 h-9" placeholder="https://..." /></div>
              <div>
                <Label className="text-xs">🔍 SEO Meta Description</Label>
                <Textarea className="mt-1" rows={2} placeholder="इस श्रेणी का SEO विवरण लिखें..." />
                <p className="text-[10px] text-muted-foreground mt-0.5">160 characters recommended — Google search results में दिखेगा</p>
              </div>
              <Button className="w-full">💾 सेव करें</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="श्रेणी खोजें..." className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <Card key={cat.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">{cat.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif font-bold text-sm">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.nameEn}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32">
                    <DropdownMenuItem className="text-xs"><Edit className="h-3 w-3 mr-2" /> एडिट</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" /> डिलीट</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">/{cat.slug}</Badge>
                  <Badge variant="outline" className="text-[10px]">📦 {cat.productCount} प्रोडक्ट</Badge>
                </div>
                {cat.metaDescription && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">🔍 {cat.metaDescription}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
