import { useState, useEffect } from "react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ShoppingBag, Users, Package, RefreshCw, IndianRupee, AlertTriangle, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

const COLORS = ['#2d6a4f', '#52b788', '#95d5b2', '#b7e4c7', '#d8f3dc'];

const StatCard = ({ title, value, sub, icon: Icon, color = 'text-primary' }: any) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const AdminReports = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);
  const [customers, setCustomers] = useState<any>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, s, p, c] = await Promise.all([
        api.dashboard(), api.salesReport(period), api.productsReport(), api.customersReport()
      ]);
      setDashboard(d); setSales(s); setProducts(p); setCustomers(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${filename}.csv`;
    a.click();
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Real-time business insights</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last 1 year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={load}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs h-7 px-3">Overview</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs h-7 px-3">Sales</TabsTrigger>
            <TabsTrigger value="products" className="text-xs h-7 px-3">Products</TabsTrigger>
            <TabsTrigger value="customers" className="text-xs h-7 px-3">Customers</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard title="Total Revenue" value={`₹${(dashboard?.totalRevenue || 0).toLocaleString()}`} icon={IndianRupee} />
              <StatCard title="Total Orders" value={dashboard?.totalOrders || 0} sub={`${dashboard?.pendingOrders || 0} pending`} icon={ShoppingBag} />
              <StatCard title="Customers" value={dashboard?.totalCustomers || 0} icon={Users} />
              <StatCard title="Products" value={dashboard?.totalProducts || 0} sub={`${dashboard?.lowStock || 0} low stock`} icon={Package} color={dashboard?.lowStock > 0 ? 'text-orange-500' : 'text-primary'} />
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => exportCSV(dashboard?.recentOrders || [], 'recent-orders')}><Download className="h-3 w-3" /> CSV</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {(dashboard?.recentOrders || []).map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{o.order_number}</p>
                        <p className="text-xs text-muted-foreground">{o.customer_name || 'Guest'} · {new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₹{o.total}</p>
                        <Badge className={`text-[10px] capitalize ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {!dashboard?.recentOrders?.length && <p className="text-center py-8 text-sm text-muted-foreground">No orders yet</p>}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Top Products</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {(dashboard?.topProducts || []).map((p: any, i: number) => (
                    <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category} · ₹{p.price}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{p.order_count} orders</p>
                        <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SALES */}
          <TabsContent value="sales" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => exportCSV(sales?.sales || [], 'sales-report')}><Download className="h-3 w-3" /> Export CSV</Button>
            </div>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Over Time</CardTitle></CardHeader>
              <CardContent>
                {sales?.sales?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={sales.sales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#2d6a4f" fill="#d8f3dc" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-center py-12 text-muted-foreground text-sm">No sales data for this period</p>}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Orders by Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(sales?.byStatus || []).map((s: any) => (
                      <div key={s.status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{s.status}</span>
                        <Badge variant="outline">{s.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(sales?.byPayment || []).map((p: any) => (
                      <div key={p.payment_method} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{p.payment_method || 'Unknown'}</span>
                        <div className="text-right">
                          <span className="text-xs font-medium">₹{p.revenue.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-2">({p.count})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PRODUCTS */}
          <TabsContent value="products" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 gap-3">
              <StatCard title="Out of Stock" value={products?.outOfStock || 0} icon={AlertTriangle} color="text-red-500" />
              <StatCard title="Low Stock (≤10)" value={products?.lowStock?.length || 0} icon={Package} color="text-orange-500" />
              <StatCard title="Categories" value={products?.byCategory?.length || 0} icon={TrendingUp} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Top Selling Products</CardTitle>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => exportCSV(products?.topSelling || [], 'top-products')}><Download className="h-3 w-3" /></Button>
                </CardHeader>
                <CardContent className="p-0">
                  {(products?.topSelling || []).map((p: any, i: number) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0">
                      <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold">{p.order_count} sold</p>
                        <div className="flex items-center gap-0.5 justify-end"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-[10px]">{p.rating}</span></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
                <CardContent>
                  {products?.byCategory?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={products.byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, count }) => `${category?.split('(')[0].trim()}: ${count}`}>
                          {(products.byCategory || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center py-8 text-sm text-muted-foreground">No data</p>}
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alert */}
            {products?.lowStock?.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-orange-600"><AlertTriangle className="h-4 w-4" /> Low Stock Alert</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {products.lowStock.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0">
                      <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></div>
                      <Badge className={`${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CUSTOMERS */}
          <TabsContent value="customers" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard title="New This Month" value={customers?.newThisMonth || 0} icon={Users} />
              <StatCard title="Repeat Customers" value={customers?.repeatCustomers || 0} icon={TrendingUp} />
              <StatCard title="Avg Order Value" value={`₹${customers?.avgOrderValue || 0}`} icon={IndianRupee} />
            </div>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Top Customers by Revenue</CardTitle>
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => exportCSV(customers?.topCustomers || [], 'top-customers')}><Download className="h-3 w-3" /></Button>
              </CardHeader>
              <CardContent className="p-0">
                {(customers?.topCustomers || []).map((c: any, i: number) => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
                    <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {c.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">₹{c.total_spent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{c.order_count} orders</p>
                    </div>
                  </div>
                ))}
                {!customers?.topCustomers?.length && <p className="text-center py-8 text-sm text-muted-foreground">No customer data</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
