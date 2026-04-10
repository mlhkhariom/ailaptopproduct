import { useState } from "react";
import { Upload, Search, Image, Video, Trash2, Download, Copy, Eye, MoreHorizontal, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/AdminLayout";

const mediaItems = [
  { id: 1, name: "ashwagandha-hero.jpg", type: "image", url: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=300&h=300&fit=crop", size: "2.4 MB", date: "2024-01-15" },
  { id: 2, name: "kumkumadi-product.jpg", type: "image", url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=300&fit=crop", size: "1.8 MB", date: "2024-01-14" },
  { id: 3, name: "brand-reel-01.mp4", type: "video", url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop", size: "12.5 MB", date: "2024-01-13" },
  { id: 4, name: "triphala-capsules.jpg", type: "image", url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop", size: "1.2 MB", date: "2024-01-12" },
  { id: 5, name: "chyawanprash-banner.jpg", type: "image", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop", size: "3.1 MB", date: "2024-01-11" },
  { id: 6, name: "skin-care-reel.mp4", type: "video", url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=300&fit=crop", size: "8.7 MB", date: "2024-01-10" },
  { id: 7, name: "tulsi-tea-photo.jpg", type: "image", url: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop", size: "1.5 MB", date: "2024-01-09" },
  { id: 8, name: "hair-oil-reel.mp4", type: "video", url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&h=300&fit=crop", size: "15.2 MB", date: "2024-01-08" },
];

const AdminMedia = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = mediaItems
    .filter((m) => filter === "all" || m.type === filter)
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const totalSize = mediaItems.reduce((s, m) => s + parseFloat(m.size), 0).toFixed(1);
  const imageCount = mediaItems.filter(m => m.type === "image").length;
  const videoCount = mediaItems.filter(m => m.type === "video").length;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">📁 मीडिया लाइब्रेरी</h1>
          <p className="text-sm text-muted-foreground">{mediaItems.length} फ़ाइलें • {totalSize} MB • {imageCount} इमेज • {videoCount} वीडियो</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs h-8"><Upload className="h-3.5 w-3.5" /> अपलोड करें</Button>
      </div>

      {/* Storage info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">स्टोरेज उपयोग (Storage Used)</span>
            <span className="text-xs text-muted-foreground">{totalSize} MB / 500 MB</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(parseFloat(totalSize) / 500) * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      {selected.length > 0 && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{selected.length} फ़ाइलें चुनी गईं</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7"><Download className="h-3 w-3 mr-1" /> डाउनलोड</Button>
              <Button size="sm" variant="destructive" className="text-xs h-7"><Trash2 className="h-3 w-3 mr-1" /> डिलीट</Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelected([])}>रद्द</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="फ़ाइल खोजें..." className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी ({mediaItems.length})</SelectItem>
              <SelectItem value="image">🖼 इमेज ({imageCount})</SelectItem>
              <SelectItem value="video">🎥 वीडियो ({videoCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {/* Upload card */}
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
          <CardContent className="p-0 aspect-square flex flex-col items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
            <p className="text-xs text-muted-foreground group-hover:text-primary">अपलोड करें</p>
          </CardContent>
        </Card>

        {filtered.map((item) => (
          <Card key={item.id} className={`group overflow-hidden cursor-pointer transition-all ${selected.includes(item.id) ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
            <div className="relative aspect-square" onClick={() => setSelected(prev => prev.includes(item.id) ? prev.filter(s => s !== item.id) : [...prev, item.id])}>
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 transition-opacity ${selected.includes(item.id) ? 'bg-primary/20' : 'bg-foreground/0 group-hover:bg-foreground/30'}`}>
                <div className="absolute top-2 left-2">
                  <Checkbox checked={selected.includes(item.id)} className="bg-card/80" />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3 w-3" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32">
                      <DropdownMenuItem className="text-xs"><Eye className="h-3 w-3 mr-2" /> देखें</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Copy className="h-3 w-3 mr-2" /> URL कॉपी</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs"><Download className="h-3 w-3 mr-2" /> डाउनलोड</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" /> डिलीट</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="absolute bottom-2 right-2">
                {item.type === "video" ? <Badge className="text-[8px] h-4 bg-red-500 border-0">🎥 VID</Badge> : <Badge className="text-[8px] h-4 bg-blue-500 border-0">🖼 IMG</Badge>}
              </div>
            </div>
            <CardContent className="p-2.5">
              <p className="text-[10px] font-medium truncate">{item.name}</p>
              <p className="text-[9px] text-muted-foreground">{item.size} • {item.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
