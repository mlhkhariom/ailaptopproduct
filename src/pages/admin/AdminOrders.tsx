import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { orders } from "@/data/mockData";

const statusColors = {
  pending: "outline" as const,
  shipped: "secondary" as const,
  delivered: "default" as const,
};

const AdminOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders
    .filter((o) => (statusFilter === "all" || o.status === statusFilter))
    .filter((o) => o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <h1 className="text-2xl font-serif font-bold mb-6">Orders</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Order ID</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Items</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{o.id}</td>
                    <td className="py-3">
                      <div><span>{o.customer}</span><br /><span className="text-xs text-muted-foreground">{o.email}</span></div>
                    </td>
                    <td className="py-3 text-muted-foreground">{o.items.length} item(s)</td>
                    <td className="py-3 font-medium">₹{o.total}</td>
                    <td className="py-3">
                      <Badge variant={statusColors[o.status]} className="capitalize text-xs">{o.status}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{o.date}</td>
                    <td className="py-3">
                      <Select defaultValue={o.status}>
                        <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
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

export default AdminOrders;
