import { useState } from "react";
import { Search, Eye, MoreHorizontal, Download, Filter, Printer, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/AdminLayout";
import { orders } from "@/data/mockData";

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "bg-accent/10 text-accent border-accent/30", icon: "⏳" },
  processing: { label: "Processing", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "⚙️" },
  shipped: { label: "Shipped", color: "bg-sage/10 text-sage border-sage/30", icon: "🚚" },
  delivered: { label: "Delivered", color: "bg-primary/10 text-primary border-primary/30", icon: "✓" },
};

const AdminOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{counts.pending} pending, {counts.shipped} shipped, {counts.delivered} delivered</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><Printer className="h-3.5 w-3.5" /> Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Orders", value: counts.all, icon: "📦", color: "bg-primary/5" },
          { label: "Pending", value: counts.pending, icon: "⏳", color: "bg-accent/5" },
          { label: "Shipped", value: counts.shipped, icon: "🚚", color: "bg-sage/5" },
          { label: "Delivered", value: counts.delivered, icon: "✓", color: "bg-primary/5" },
        ].map((s) => (
          <Card key={s.label} className={s.color}>
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected.length > 0 && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{selected.length} order(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7">Change Status</Button>
              <Button size="sm" variant="outline" className="text-xs h-7">Print Invoice</Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelected([])}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs defaultValue="all">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-7 px-3" onClick={() => setStatusFilter("all")}>All ({counts.all})</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs h-7 px-3" onClick={() => setStatusFilter("pending")}>Pending ({counts.pending})</TabsTrigger>
                <TabsTrigger value="shipped" className="text-xs h-7 px-3" onClick={() => setStatusFilter("shipped")}>Shipped ({counts.shipped})</TabsTrigger>
                <TabsTrigger value="delivered" className="text-xs h-7 px-3" onClick={() => setStatusFilter("delivered")}>Delivered ({counts.delivered})</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search order or customer..." className="pl-8 h-8 text-xs w-full sm:w-52" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="p-3 w-10"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={(c) => setSelected(c ? filtered.map(o => o.id) : [])} /></th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Order</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Customer</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Items</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Amount</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Status</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Location</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Date</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs w-20">Update</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const sc = statusConfig[o.status];
                  return (
                    <tr key={o.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${selected.includes(o.id) ? 'bg-primary/5' : ''}`}>
                      <td className="p-3"><Checkbox checked={selected.includes(o.id)} onCheckedChange={() => setSelected(prev => prev.includes(o.id) ? prev.filter(s => s !== o.id) : [...prev, o.id])} /></td>
                      <td className="p-3 font-bold text-xs">{o.id}</td>
                      <td className="p-3">
                        <div>
                          <span className="text-sm font-medium block">{o.customer.split('(')[0].trim()}</span>
                          <span className="text-[10px] text-muted-foreground">{o.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-xs">{o.items.length} item(s)</span>
                        <span className="block text-[10px] text-muted-foreground truncate max-w-[120px]">{o.items.map(i => i.name).join(', ')}</span>
                      </td>
                      <td className="p-3 font-bold">₹{o.total}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </Badge>
                      </td>
                      <td className="p-3"><span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{o.address}</span></td>
                      <td className="p-3 text-xs text-muted-foreground">{o.date}</td>
                      <td className="p-3">
                        <Select defaultValue={o.status}>
                          <SelectTrigger className="h-7 w-24 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" className="text-xs">⏳ Pending</SelectItem>
                            <SelectItem value="shipped" className="text-xs">🚚 Shipped</SelectItem>
                            <SelectItem value="delivered" className="text-xs">✓ Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="text-xs"><Eye className="h-3 w-3 mr-2" /> Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs"><Printer className="h-3 w-3 mr-2" /> Invoice</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-destructive">Cancel Order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Showing {filtered.length} orders</span>
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

export default AdminOrders;
