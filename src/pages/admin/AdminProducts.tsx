import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { products, categories } from "@/data/mockData";

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Products</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Product Name</Label><Input className="mt-1" placeholder="e.g. Ashwagandha Powder" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price (₹)</Label><Input type="number" className="mt-1" placeholder="599" /></div>
                <div><Label>Original Price (₹)</Label><Input type="number" className="mt-1" placeholder="799" /></div>
              </div>
              <div>
                <Label>Category</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea className="mt-1" rows={3} placeholder="Product description..." /></div>
              <div><Label>Ingredients (one per line)</Label><Textarea className="mt-1" rows={3} placeholder="Ashwagandha Root..." /></div>
              <div><Label>Benefits (one per line)</Label><Textarea className="mt-1" rows={3} placeholder="Reduces stress..." /></div>
              <div><Label>Usage Instructions</Label><Textarea className="mt-1" rows={2} placeholder="How to use..." /></div>
              <div><Label>Product Image URL</Label><Input className="mt-1" placeholder="https://..." /></div>
              <Button className="w-full">Save Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Product</th>
                  <th className="pb-3 font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 font-medium text-muted-foreground">Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">Rating</th>
                  <th className="pb-3 font-medium text-muted-foreground">Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3"><Badge variant="secondary" className="text-xs">{p.category}</Badge></td>
                    <td className="py-3">₹{p.price}</td>
                    <td className="py-3">{p.rating} ⭐</td>
                    <td className="py-3">
                      <Badge variant={p.inStock ? "default" : "destructive"} className="text-xs">{p.inStock ? "In Stock" : "Out"}</Badge>
                    </td>
                    <td className="py-3">
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
};

export default AdminProducts;
