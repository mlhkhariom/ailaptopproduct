import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Copy, MoreHorizontal, Filter, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { products, categories } from "@/data/mockData";

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "active" | "out">("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => view === "all" || (view === "active" ? p.inStock : !p.inStock));

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products, {products.filter(p => p.inStock).length} in stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="h-3.5 w-3.5" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-serif">Add New Product</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">Product Name</Label><Input className="mt-1 h-9" placeholder="Ashwagandha Powder" /></div>
                  <div><Label className="text-xs">Hindi Name</Label><Input className="mt-1 h-9" placeholder="अश्वगंधा चूर्ण" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-xs">Price (₹)</Label><Input type="number" className="mt-1 h-9" placeholder="599" /></div>
                  <div><Label className="text-xs">Compare Price (₹)</Label><Input type="number" className="mt-1 h-9" placeholder="799" /></div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Select><SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label className="text-xs">Description</Label><Textarea className="mt-1" rows={3} placeholder="Product description..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">Ingredients (one per line)</Label><Textarea className="mt-1" rows={3} placeholder="Ashwagandha root..." /></div>
                  <div><Label className="text-xs">Benefits (one per line)</Label><Textarea className="mt-1" rows={3} placeholder="Reduces stress..." /></div>
                </div>
                <div><Label className="text-xs">Usage / Dosage</Label><Textarea className="mt-1" rows={2} /></div>
                <div><Label className="text-xs">Product Image URL</Label><Input className="mt-1 h-9" placeholder="https://..." /></div>
                <div className="flex items-center gap-2">
                  <Switch id="stock" defaultChecked /><Label htmlFor="stock" className="text-xs">In Stock</Label>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Save Product</Button>
                  <Button variant="outline" className="flex-1">Save & Add Another</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selected.length > 0 && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{selected.length} product(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7">Update Stock</Button>
              <Button size="sm" variant="destructive" className="text-xs h-7">Delete</Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelected([])}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs defaultValue="all" className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-7 px-3" onClick={() => setView("all")}>All ({products.length})</TabsTrigger>
                <TabsTrigger value="active" className="text-xs h-7 px-3" onClick={() => setView("active")}>In Stock ({products.filter(p => p.inStock).length})</TabsTrigger>
                <TabsTrigger value="out" className="text-xs h-7 px-3" onClick={() => setView("out")}>Out of Stock ({products.filter(p => !p.inStock).length})</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-8 text-xs w-full sm:w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-1 text-xs h-8"><Filter className="h-3 w-3" /> Filter</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="p-3 w-10"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={(c) => setSelected(c ? filtered.map(p => p.id) : [])} /></th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Product</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Category</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Price</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Rating</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Reels</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Stock</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${selected.includes(p.id) ? 'bg-primary/5' : ''}`}>
                    <td className="p-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover shadow-sm" />
                        <div>
                          <span className="font-medium text-sm block">{p.name}</span>
                          {p.nameHi && <span className="text-[10px] text-muted-foreground">{p.nameHi}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{p.category.split('(')[0].trim()}</Badge></td>
                    <td className="p-3">
                      <div>
                        <span className="font-bold">₹{p.price}</span>
                        {p.originalPrice && <span className="text-[10px] text-muted-foreground line-through ml-1">₹{p.originalPrice}</span>}
                      </div>
                    </td>
                    <td className="p-3"><span className="text-xs">{p.rating} ⭐ ({p.reviews})</span></td>
                    <td className="p-3"><Badge variant="outline" className="text-[10px]">📹 {p.reels.length}</Badge></td>
                    <td className="p-3">
                      <Badge variant={p.inStock ? "default" : "destructive"} className="text-[10px]">
                        {p.inStock ? "✓ In Stock" : "✗ Out"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="text-xs"><Eye className="h-3 w-3 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs"><Edit className="h-3 w-3 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs"><Copy className="h-3 w-3 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Showing 1-{filtered.length} of {filtered.length}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>← Prev</Button>
              <Button variant="outline" size="sm" className="h-7 w-7 text-xs bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next →</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProducts;
