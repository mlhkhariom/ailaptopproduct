import { useState } from "react";
import { Download, Calendar, TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight, Eye, BarChart3, PieChart as PieIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AdminLayout from "@/components/AdminLayout";

const revenueData = [
  { month: "Jul", revenue: 35000, orders: 45, profit: 12000 },
  { month: "Aug", revenue: 42000, orders: 52, profit: 15500 },
  { month: "Sep", revenue: 38000, orders: 48, profit: 13200 },
  { month: "Oct", revenue: 55000, orders: 67, profit: 21000 },
  { month: "Nov", revenue: 62000, orders: 78, profit: 24500 },
  { month: "Dec", revenue: 78000, orders: 95, profit: 31000 },
  { month: "Jan", revenue: 71000, orders: 88, profit: 28000 },
];

const dailyData = [
  { day: "Mon", revenue: 12500, orders: 15 },
  { day: "Tue", revenue: 9800, orders: 12 },
  { day: "Wed", revenue: 15200, orders: 18 },
  { day: "Thu", revenue: 11000, orders: 14 },
  { day: "Fri", revenue: 18500, orders: 22 },
  { day: "Sat", revenue: 21000, orders: 25 },
  { day: "Sun", revenue: 8200, orders: 10 },
];

const categoryRevenue = [
  { name: "Herbs", value: 85000, fill: "hsl(120, 37%, 35%)" },
  { name: "Skin Care", value: 72000, fill: "hsl(28, 52%, 64%)" },
  { name: "Capsules", value: 48000, fill: "hsl(90, 25%, 50%)" },
  { name: "Immunity", value: 42000, fill: "hsl(40, 55%, 55%)" },
  { name: "Hair Care", value: 38000, fill: "hsl(200, 40%, 50%)" },
  { name: "Tonics", value: 28000, fill: "hsl(340, 40%, 55%)" },
  { name: "Teas", value: 22000, fill: "hsl(160, 40%, 45%)" },
];

const paymentMethods = [
  { name: "UPI", value: 45, fill: "hsl(120, 37%, 35%)" },
  { name: "Razorpay", value: 30, fill: "hsl(210, 60%, 50%)" },
  { name: "COD", value: 20, fill: "hsl(40, 55%, 55%)" },
  { name: "Net Banking", value: 5, fill: "hsl(340, 40%, 55%)" },
];

const topProducts = [
  { name: "Kumkumadi Face Oil", revenue: 38700, units: 312, growth: 18 },
  { name: "Chyawanprash Premium", revenue: 30555, units: 278, growth: 12 },
  { name: "Bhringraj Hair Oil", revenue: 26633, units: 267, growth: -5 },
  { name: "Ashwagandha Powder", revenue: 23166, units: 234, growth: 22 },
  { name: "Tulsi Green Tea", revenue: 17047, units: 203, growth: 8 },
];

const cityData = [
  { city: "Mumbai", orders: 156, revenue: 89000 },
  { city: "Delhi", orders: 134, revenue: 76000 },
  { city: "Bangalore", orders: 98, revenue: 58000 },
  { city: "Jaipur", orders: 76, revenue: 42000 },
  { city: "Ahmedabad", orders: 65, revenue: 35000 },
  { city: "Kochi", orders: 52, revenue: 28000 },
  { city: "Lucknow", orders: 45, revenue: 24000 },
];

const trafficSources = [
  { source: "Instagram Reels", visitors: 12500, conversions: 340, rate: "2.7%" },
  { source: "Google Organic", visitors: 8200, conversions: 210, rate: "2.6%" },
  { source: "WhatsApp Direct", visitors: 5400, conversions: 320, rate: "5.9%" },
  { source: "Facebook Ads", visitors: 4100, conversions: 95, rate: "2.3%" },
  { source: "YouTube", visitors: 3200, conversions: 68, rate: "2.1%" },
  { source: "Direct", visitors: 2800, conversions: 180, rate: "6.4%" },
];

const AdminReports = () => {
  const [period, setPeriod] = useState("7d");

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);
  const totalProfit = revenueData.reduce((s, d) => s + d.profit, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Business performance, sales & traffic insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d" className="text-xs">Last 7 Days</SelectItem>
              <SelectItem value="30d" className="text-xs">Last 30 Days</SelectItem>
              <SelectItem value="90d" className="text-xs">Last 90 Days</SelectItem>
              <SelectItem value="1y" className="text-xs">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><Download className="h-3.5 w-3.5" /> Export PDF</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><FileText className="h-3.5 w-3.5" /> Export CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Revenue", value: `₹${(totalRevenue / 1000).toFixed(0)}K`, change: "+18.2%", up: true, icon: IndianRupee, color: "text-green-600" },
          { label: "Total Orders", value: totalOrders.toString(), change: "+12.5%", up: true, icon: ShoppingBag, color: "text-blue-600" },
          { label: "Avg. Order Value", value: `₹${avgOrderValue}`, change: "+5.3%", up: true, icon: TrendingUp, color: "text-purple-600" },
          { label: "Net Profit", value: `₹${(totalProfit / 1000).toFixed(0)}K`, change: "-2.1%", up: false, icon: BarChart3, color: "text-orange-600" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.up ? <ArrowUpRight className="h-3.5 w-3.5 text-green-600" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
                <span className={`text-xs font-medium ${kpi.up ? "text-green-600" : "text-red-500"}`}>{kpi.change}</span>
                <span className="text-[10px] text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="h-8">
          <TabsTrigger value="sales" className="text-xs h-7 px-3">Sales</TabsTrigger>
          <TabsTrigger value="products" className="text-xs h-7 px-3">Products</TabsTrigger>
          <TabsTrigger value="customers" className="text-xs h-7 px-3">Customers</TabsTrigger>
          <TabsTrigger value="traffic" className="text-xs h-7 px-3">Traffic</TabsTrigger>
        </TabsList>

        {/* SALES TAB */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue & Profit Trend</CardTitle>
                <CardDescription className="text-xs">Monthly revenue vs profit (₹)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(120, 37%, 35%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(120, 37%, 35%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(28, 52%, 64%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(28, 52%, 64%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(120, 37%, 35%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                    <Area type="monotone" dataKey="profit" stroke="hsl(28, 52%, 64%)" fill="url(#profitGrad)" strokeWidth={2} name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Payment Methods</CardTitle>
                <CardDescription className="text-xs">Distribution by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {paymentMethods.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {paymentMethods.map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                        <span>{p.name}</span>
                      </div>
                      <span className="font-medium">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Revenue (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]} />
                  <Bar dataKey="revenue" fill="hsl(120, 37%, 35%)" radius={[6, 6, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid lg:grid-cols-5 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Selling Products</CardTitle>
                <CardDescription className="text-xs">By revenue (₹)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30 text-left">
                    <th className="p-3 text-xs font-medium text-muted-foreground">#</th>
                    <th className="p-3 text-xs font-medium text-muted-foreground">Product</th>
                    <th className="p-3 text-xs font-medium text-muted-foreground">Revenue</th>
                    <th className="p-3 text-xs font-medium text-muted-foreground">Units</th>
                    <th className="p-3 text-xs font-medium text-muted-foreground">Growth</th>
                  </tr></thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.name} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 text-xs font-bold text-muted-foreground">{i + 1}</td>
                        <td className="p-3 text-sm font-medium">{p.name}</td>
                        <td className="p-3 text-sm font-bold">₹{p.revenue.toLocaleString()}</td>
                        <td className="p-3 text-xs">{p.units} sold</td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[10px] ${p.growth >= 0 ? "text-green-600 border-green-200 bg-green-50" : "text-red-500 border-red-200 bg-red-50"}`}>
                            {p.growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                            {Math.abs(p.growth)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryRevenue} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                      {categoryRevenue.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {categoryRevenue.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                        <span>{c.name}</span>
                      </div>
                      <span className="font-medium">₹{(c.value / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Customers", value: "1,247", change: "+8.4%" },
              { label: "New This Month", value: "156", change: "+15.2%" },
              { label: "Repeat Rate", value: "42%", change: "+3.1%" },
              { label: "Avg. LTV", value: "₹3,890", change: "+6.7%" },
            ].map((m) => (
              <Card key={m.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-0.5 mt-1"><ArrowUpRight className="h-3 w-3" />{m.change}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Orders by City</CardTitle>
              <CardDescription className="text-xs">Top performing cities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(120, 37%, 35%)" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRAFFIC TAB */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Total Visitors", value: "36,200", change: "+22%" },
              { label: "Conversions", value: "1,213", change: "+14%" },
              { label: "Conversion Rate", value: "3.35%", change: "+0.4%" },
            ].map((m) => (
              <Card key={m.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-0.5 mt-1"><ArrowUpRight className="h-3 w-3" />{m.change}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Traffic Sources</CardTitle>
              <CardDescription className="text-xs">Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30 text-left">
                  <th className="p-3 text-xs font-medium text-muted-foreground">Source</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Visitors</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Conversions</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Conv. Rate</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Share</th>
                </tr></thead>
                <tbody>
                  {trafficSources.map((t) => {
                    const totalVisitors = trafficSources.reduce((s, x) => s + x.visitors, 0);
                    const share = Math.round((t.visitors / totalVisitors) * 100);
                    return (
                      <tr key={t.source} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 font-medium text-sm">{t.source}</td>
                        <td className="p-3 text-xs">{t.visitors.toLocaleString()}</td>
                        <td className="p-3 text-xs font-medium">{t.conversions}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{t.rate}</Badge></td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-7">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminReports;
