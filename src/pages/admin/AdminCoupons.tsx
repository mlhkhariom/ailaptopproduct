import { useState } from "react";
import { Plus, Trash2, Edit, Tag, Calendar, Copy, CheckCircle, Percent, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiry: string;
  active: boolean;
}

const mockCoupons: Coupon[] = [
  { id: "1", code: "AYUR10", type: "percent", value: 10, minOrder: 499, maxUses: 100, usedCount: 34, expiry: "2024-03-31", active: true },
  { id: "2", code: "FLAT100", type: "flat", value: 100, minOrder: 999, maxUses: 50, usedCount: 12, expiry: "2024-02-28", active: true },
  { id: "3", code: "WELCOME20", type: "percent", value: 20, minOrder: 299, maxUses: 200, usedCount: 89, expiry: "2024-06-30", active: true },
  { id: "4", code: "FREESHIP", type: "flat", value: 50, minOrder: 0, maxUses: 500, usedCount: 156, expiry: "2024-12-31", active: true },
  { id: "5", code: "DIWALI25", type: "percent", value: 25, minOrder: 1499, maxUses: 50, usedCount: 50, expiry: "2023-11-15", active: false },
];

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", type: "percent" as const, value: 10, minOrder: 0, maxUses: 100, expiry: "" });

  const toggleActive = (id: string) => {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
    toast.success("Coupon updated");
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Coupon deleted");
  };

  const addCoupon = () => {
    if (!newCoupon.code.trim()) { toast.error("Enter coupon code"); return; }
    setCoupons((prev) => [...prev, { ...newCoupon, id: Date.now().toString(), usedCount: 0, active: true }]);
    setShowAdd(false);
    setNewCoupon({ code: "", type: "percent", value: 10, minOrder: 0, maxUses: 100, expiry: "" });
    toast.success("Coupon created!");
  };

  const totalRevenueSaved = coupons.reduce((s, c) => s + c.usedCount * (c.type === "flat" ? c.value : c.value * 5), 0);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Coupons & Discounts</h1>
          <p className="text-sm text-muted-foreground">Create & manage promotional discount codes</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="h-3.5 w-3.5" /> Create Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Coupon</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-xs">Coupon Code</Label><Input className="mt-1 uppercase" placeholder="e.g. SUMMER20" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={newCoupon.type} onValueChange={(v: "percent" | "flat") => setNewCoupon({ ...newCoupon, type: v })}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Value</Label><Input type="number" className="mt-1 h-9" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Min. Order (₹)</Label><Input type="number" className="mt-1 h-9" value={newCoupon.minOrder} onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Max Uses</Label><Input type="number" className="mt-1 h-9" value={newCoupon.maxUses} onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })} /></div>
              </div>
              <div><Label className="text-xs">Expiry Date</Label><Input type="date" className="mt-1 h-9" value={newCoupon.expiry} onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })} /></div>
              <Button className="w-full" onClick={addCoupon}>Create Coupon</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3"><Tag className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{coupons.length}</p><p className="text-[10px] text-muted-foreground">Total Coupons</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{coupons.filter(c => c.active).length}</p><p className="text-[10px] text-muted-foreground">Active</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Percent className="h-8 w-8 text-accent" /><div><p className="text-2xl font-bold">{coupons.reduce((s, c) => s + c.usedCount, 0)}</p><p className="text-[10px] text-muted-foreground">Total Uses</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><IndianRupee className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">₹{totalRevenueSaved.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Discount Given</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30 text-left">
              <th className="p-3 text-xs font-medium text-muted-foreground">Code</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Discount</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Min. Order</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Usage</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Expiry</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{coupon.code}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Copied!"); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="p-3 font-medium">{coupon.type === "percent" ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                  <td className="p-3 text-muted-foreground">₹{coupon.minOrder}</td>
                  <td className="p-3"><span className="font-medium">{coupon.usedCount}</span><span className="text-muted-foreground">/{coupon.maxUses}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{coupon.expiry}</td>
                  <td className="p-3"><Switch checked={coupon.active} onCheckedChange={() => toggleActive(coupon.id)} /></td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCoupon(coupon.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCoupons;
