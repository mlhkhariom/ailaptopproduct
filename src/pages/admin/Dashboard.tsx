import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IndianRupee, ShoppingBag, Users, Package, ArrowUpRight, RefreshCw, TrendingUp, ClipboardList, Wrench, UserCheck, MessageSquare, AlertCircle, AlertTriangle, CheckCircle, Bell, Tv2, Star, BarChart3, Zap } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { api } from "@/lib/api";

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, s, erp] = await Promise.all([
        api.dashboard(),
        api.salesReport('30d'),
        fetch('/api/erp/dashboard', { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json()).catch(() => ({}))
      ]);
      setData({ ...d, ...erp, erp });
      setSales(s);
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

  // Top 4 Hero KPIs
  const heroKPIs = [
    { title: 'Total Revenue', value: `₹${((data?.totalRevenue || 0) + (data?.monthRevenue || 0)).toLocaleString('en-IN')}`, icon: IndianRupee, gradient: 'from-emerald-500 to-green-600', change: '+12%', url: '/admin/erp/reports' },
    { title: 'Orders', value: data?.totalOrders || 0, sub: `${data?.pendingOrders || 0} pending`, icon: ShoppingBag, gradient: 'from-blue-500 to-blue-600', url: '/admin/orders' },
    { title: 'Repairs', value: data?.pendingJobs || 0, sub: `${data?.completedToday || 0} done today`, icon: Wrench, gradient: 'from-orange-500 to-orange-600', url: '/admin/erp/job-cards' },
    { title: 'Net Profit', value: `₹${(data?.netProfit || 0).toLocaleString('en-IN')}`, icon: TrendingUp, gradient: (data?.netProfit || 0) >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-600', url: '/admin/erp/reports' },
  ];

  // Quick stats
  const miniStats = [
    { label: 'Customers', value: data?.totalCustomers || 0, icon: Users, url: '/admin/customers' },
    { label: 'Products', value: data?.totalProducts || 0, icon: Package, url: '/admin/products' },
    { label: 'Staff', value: data?.totalStaff || 0, icon: UserCheck, url: '/admin/erp/staff' },
    { label: 'Pending Pay', value: data?.pendingPayments || 0, icon: AlertCircle, url: '/admin/erp/billing' },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your business at a glance.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/erp/live"><Button size="sm" variant="outline" className="gap-1.5"><Tv2 className="h-4 w-4" /> Live View</Button></Link>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Hero KPIs — Big cards with gradients */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {heroKPIs.map(k => (
            <Card key={k.title} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate(k.url)}>
              <div className={`bg-gradient-to-br ${k.gradient} p-5 text-white relative`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <k.icon className="h-5 w-5" />
                  </div>
                  {k.change && <Badge className="bg-white/20 text-white border-0 text-[10px]">{k.change}</Badge>}
                </div>
                <p className="text-2xl md:text-3xl font-black tracking-tight">{k.value}</p>
                <p className="text-xs opacity-90 mt-1">{k.title}</p>
                {k.sub && <p className="text-[10px] opacity-75 mt-0.5">{k.sub}</p>}
                <ArrowUpRight className="h-4 w-4 absolute top-3 right-3 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          ))}
        </div>

        {/* Mini Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {miniStats.map(s => (
            <Card key={s.label} className="hover:border-primary/40 transition-all cursor-pointer" onClick={() => navigate(s.url)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-black">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/5 to-orange-50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Quick Actions</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/admin/erp/job-cards"><Button size="sm" className="gap-1.5"><ClipboardList className="h-4 w-4" /> New Job Card</Button></Link>
              <Link to="/admin/erp/crm"><Button size="sm" variant="outline" className="gap-1.5"><Users className="h-4 w-4" /> Add Lead</Button></Link>
              <Link to="/admin/erp/billing"><Button size="sm" variant="outline" className="gap-1.5"><IndianRupee className="h-4 w-4" /> New Invoice</Button></Link>
              <Link to="/admin/products"><Button size="sm" variant="outline" className="gap-1.5"><Package className="h-4 w-4" /> Add Product</Button></Link>
              <Link to="/admin/erp/customer360"><Button size="sm" variant="outline" className="gap-1.5"><Star className="h-4 w-4" /> Customer 360</Button></Link>
            </div>
          </CardContent>
        </Card>

        {/* Charts + Status */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Revenue (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {sales?.sales?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={sales.sales}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8000" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF8000" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v > 999 ? Math.round(v/1000) + 'k' : v}`} />
                    <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#FF8000" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <BarChart3 className="h-10 w-10 opacity-30" />
                  <p className="text-sm">No sales yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(sales?.byStatus || []).map((s: any) => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${s.status === 'delivered' ? 'bg-green-500' : s.status === 'shipped' ? 'bg-purple-500' : s.status === 'processing' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <span className="text-sm capitalize">{s.status}</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold">{s.count}</Badge>
                </div>
              ))}
              {!sales?.byStatus?.length && <p className="text-sm text-muted-foreground text-center py-4">No orders</p>}
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/admin/orders')}>
                View All Orders <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent + Top */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/admin/orders')}>View all →</Button>
            </CardHeader>
            <CardContent className="p-0">
              {(data?.recentOrders || []).slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate('/admin/orders')}>
                  <div>
                    <p className="text-sm font-semibold">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{o.total?.toLocaleString('en-IN')}</p>
                    <Badge className={`text-[10px] capitalize ${STATUS_COLOR[o.status] || STATUS_COLOR.placed}`}>{o.status}</Badge>
                  </div>
                </div>
              ))}
              {!data?.recentOrders?.length && <p className="text-center py-8 text-sm text-muted-foreground">No orders yet</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Top Products</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/admin/products')}>View all →</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.topProducts || []).slice(0, 5).map((p: any, i: number) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 font-medium">#{i + 1} {p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{p.order_count}x</span>
                  </div>
                  <Progress value={Math.min(100, (p.order_count / Math.max(...(data?.topProducts || []).map((x: any) => x.order_count), 1)) * 100)} className="h-1.5" />
                </div>
              ))}
              {!data?.topProducts?.length && <p className="text-center py-8 text-sm text-muted-foreground">No data yet</p>}
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(data?.lowStock > 0 || data?.pendingJobs > 5) && (
          <div className="grid md:grid-cols-2 gap-3">
            {data?.lowStock > 0 && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-orange-700">{data.lowStock} Low Stock Items</p>
                      <p className="text-xs text-orange-600">Restock to avoid order failures</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" onClick={() => navigate('/admin/inventory')}>Fix</Button>
                </CardContent>
              </Card>
            )}
            {data?.pendingJobs > 5 && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-blue-700">{data.pendingJobs} Pending Jobs</p>
                      <p className="text-xs text-blue-600">Check job cards for delays</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" onClick={() => navigate('/admin/erp/job-cards')}>View</Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
