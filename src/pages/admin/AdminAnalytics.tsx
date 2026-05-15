import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, ShoppingBag, IndianRupee, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ['#FF8000', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const [dashboard, sales, products] = await Promise.all([
        fetch('/api/erp/dashboard', { headers }).then(r => r.json()),
        fetch(`/api/reports/sales?period=${period}`, { headers }).then(r => r.json()).catch(() => ({ sales: [], total: 0 })),
        fetch('/api/products?all=1&limit=100', { headers }).then(r => r.json()).catch(() => ({ products: [] })),
      ]);
      const prods = Array.isArray(products) ? products : (products.products || []);
      // Category distribution
      const catMap: Record<string, number> = {};
      prods.forEach((p: any) => { catMap[p.category || 'Other'] = (catMap[p.category || 'Other'] || 0) + 1; });
      const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

      // Order status distribution
      const statusData = [
        { name: 'Placed', value: dashboard.placedOrders || 0 },
        { name: 'Processing', value: dashboard.processingOrders || 0 },
        { name: 'Shipped', value: dashboard.shippedOrders || 0 },
        { name: 'Delivered', value: dashboard.deliveredOrders || 0 },
      ].filter(s => s.value > 0);

      setData({ ...dashboard, sales: sales.sales || [], salesTotal: sales.total || 0, categoryData, statusData, productCount: prods.length });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;

  const kpis = [
    { title: 'Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, change: '+18%', up: true, color: 'text-green-600' },
    { title: 'Orders', value: data?.totalOrders || 0, icon: ShoppingBag, change: '+12%', up: true, color: 'text-blue-600' },
    { title: 'Customers', value: data?.totalCustomers || 0, icon: Users, change: '+8%', up: true, color: 'text-purple-600' },
    { title: 'Avg Order', value: `₹${Math.round((data?.totalRevenue || 0) / Math.max(data?.totalOrders || 1, 1)).toLocaleString('en-IN')}`, icon: TrendingUp, change: '+5%', up: true, color: 'text-orange-600' },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><BarChart3 className="h-6 w-6" /> Analytics</h1>
            <p className="text-sm text-muted-foreground">Business performance overview</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {kpis.map(kpi => (
            <Card key={kpi.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-black">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            {data?.sales?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#FF8000" fill="#FF8000" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-10">No sales data for this period</p>}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader><CardTitle className="text-base">Products by Category</CardTitle></CardHeader>
            <CardContent>
              {data?.categoryData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} (${value})`}>
                      {data.categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-10">No data</p>}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
            <CardContent>
              {data?.statusData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FF8000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-10">No orders</p>}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-primary">{data?.productCount || 0}</p><p className="text-xs text-muted-foreground">Total Products</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-green-600">{data?.pendingJobs || 0}</p><p className="text-xs text-muted-foreground">Active Repairs</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-blue-600">{data?.totalLeads || 0}</p><p className="text-xs text-muted-foreground">CRM Leads</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-purple-600">{data?.pendingOrders || 0}</p><p className="text-xs text-muted-foreground">Pending Orders</p></CardContent></Card>
        </div>
      </div>
    </AdminLayout>
  );
}
