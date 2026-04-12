import { useState, useEffect } from "react";
import { IndianRupee, ShoppingBag, Users, Package, ArrowUpRight, Clock, CheckCircle, Truck, AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AdminLayout from "@/components/AdminLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700', processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, s] = await Promise.all([api.dashboard(), api.salesReport('30d')]);
      setData(d); setSales(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AdminLayout>
  );

  const stats = [
    { title: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Total Orders', value: data?.totalOrders || 0, sub: `${data?.pendingOrders || 0} pending`, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Customers', value: data?.totalCustomers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Products', value: data?.totalProducts || 0, sub: data?.lowStock > 0 ? `⚠ ${data.lowStock} low stock` : 'All stocked', icon: Package, color: data?.lowStock > 0 ? 'text-orange-500' : 'text-green-600', bg: data?.lowStock > 0 ? 'bg-orange-100' : 'bg-green-100' },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening.</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(s => (
            <Card key={s.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.title}</p>
                {s.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Revenue (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {sales?.sales?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={sales.sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                    <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#2d6a4f" fill="#d8f3dc" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No sales data yet. Place some orders!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(sales?.byStatus || []).map((s: any) => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.status === 'delivered' ? 'bg-green-500' : s.status === 'shipped' ? 'bg-purple-500' : s.status === 'processing' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <span className="text-sm capitalize">{s.status}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{s.count}</Badge>
                </div>
              ))}
              {!sales?.byStatus?.length && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
              <Button variant="outline" size="sm" className="w-full text-xs mt-2" onClick={() => navigate('/admin/orders')}>
                View All Orders <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/admin/orders')}>View all →</Button>
            </CardHeader>
            <CardContent className="p-0">
              {(data?.recentOrders || []).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{o.total}</p>
                    <Badge className={`text-[10px] capitalize ${STATUS_COLOR[o.status] || STATUS_COLOR.placed}`}>{o.status}</Badge>
                  </div>
                </div>
              ))}
              {!data?.recentOrders?.length && <p className="text-center py-8 text-sm text-muted-foreground">No orders yet</p>}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Top Products</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/admin/products')}>View all →</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.topProducts || []).map((p: any, i: number) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{i + 1}. {p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{p.order_count} orders</span>
                  </div>
                  <Progress value={Math.min(100, (p.order_count / Math.max(...(data?.topProducts || []).map((x: any) => x.order_count), 1)) * 100)} className="h-1.5" />
                </div>
              ))}
              {!data?.topProducts?.length && <p className="text-center py-8 text-sm text-muted-foreground">No product data yet</p>}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {data?.lowStock > 0 && (
          <Card className="border-orange-200 bg-orange-50/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-orange-700">{data.lowStock} products have low stock (≤5 units)</p>
                  <p className="text-xs text-orange-600">Update stock to avoid order failures</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 text-xs" onClick={() => navigate('/admin/products')}>
                Manage Stock
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
