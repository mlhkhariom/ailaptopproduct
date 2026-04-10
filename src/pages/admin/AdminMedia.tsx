import { useState } from "react";
import { Upload, Search, Image, Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";

const mediaItems = [
  { id: 1, name: "ashwagandha-hero.jpg", type: "image", url: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=300&h=300&fit=crop", size: "2.4 MB" },
  { id: 2, name: "kumkumadi-product.jpg", type: "image", url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=300&fit=crop", size: "1.8 MB" },
  { id: 3, name: "brand-reel-01.mp4", type: "video", url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop", size: "12.5 MB" },
  { id: 4, name: "triphala-capsules.jpg", type: "image", url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop", size: "1.2 MB" },
  { id: 5, name: "chyawanprash-banner.jpg", type: "image", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop", size: "3.1 MB" },
  { id: 6, name: "skin-care-reel.mp4", type: "video", url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=300&fit=crop", size: "8.7 MB" },
];

const AdminMedia = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mediaItems
    .filter((m) => filter === "all" || m.type === filter)
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Media Library</h1>
        <Button className="gap-2"><Upload className="h-4 w-4" /> Upload</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search media..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Upload card */}
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-0 aspect-square flex flex-col items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Upload New</p>
          </CardContent>
        </Card>

        {filtered.map((item) => (
          <Card key={item.id} className="group overflow-hidden">
            <div className="relative aspect-square">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="absolute top-2 right-2">
                {item.type === "video" ? <Video className="h-5 w-5 text-primary-foreground bg-foreground/50 rounded p-0.5" /> : <Image className="h-5 w-5 text-primary-foreground bg-foreground/50 rounded p-0.5" />}
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-xs font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.size}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
