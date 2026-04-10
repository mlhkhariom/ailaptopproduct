import { IndianRupee, ShoppingBag, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, Package, Clock, CheckCircle, Truck, AlertTriangle, MoreHorizontal, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { salesData, categoryData, orders, products } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from "recharts";

const statCards = [
  { title: "कुल आय", titleEn: "Revenue", value: "₹3,81,000", change: "+12.5%", positive: true, icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
  { title: "कुल ऑर्डर", titleEn: "Orders", value: "473", change: "+8.2%", positive: true, icon: ShoppingBag, color: "text-accent", bg: "bg-accent/10" },
  { title: "ग्राहक", titleEn: "Customers", value: "1,284", change: "+15.3%", positive: true, icon: Users, color: "text-sage", bg: "bg-sage/10" },
  { title: "विज़िटर्स", titleEn: "Visitors", value: "12.8K", change: "-2.1%", positive: false, icon: Eye, color: "text-gold", bg: "bg-gold/10" },
];

const topProducts = [
  { name: "Kumkumadi Face Oil", sales: 312, revenue: "₹4,05,588", progress: 95 },
  { name: "Chyawanprash Premium", sales: 278, revenue: "₹1,52,622", progress: 82 },
  { name: "Bhringraj Hair Oil", sales: 267, revenue: "₹1,33,233", progress: 78 },
  { name: "Ashwagandha Powder", sales: 234, revenue: "₹1,40,166", progress: 70 },
];

const recentActivity = [
  { icon: ShoppingBag, text: "नया ऑर्डर APC-007 — प्रिया शर्मा", time: "2 मिनट पहले", color: "text-primary" },
  { icon: CheckCircle, text: "ऑर्डर APC-005 डिलीवर हो गया", time: "1 घंटा पहले", color: "text-primary" },
  { icon: Package, text: "Bhringraj Hair Oil स्टॉक में वापस आया", time: "2 घंटे पहले", color: "text-sage" },
  { icon: Truck, text: "ऑर्डर APC-002 शिप किया गया", time: "3 घंटे पहले", color: "text-accent" },
  { icon: AlertTriangle, text: "Triphala Capsules स्टॉक कम हो रहा है", time: "5 घंटे पहले", color: "text-destructive" },
];

const orderStatusData = [
  { status: "लंबित (Pending)", count: 12, color: "bg-accent" },
  { status: "भेजा गया (Shipped)", count: 8, color: "bg-sage" },
  { status: "डिलीवर्ड (Delivered)", count: 45, color: "bg-primary" },
];

const AdminDashboard = () => (
  <AdminLayout>
    {/* Header with actions */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">डैशबोर्ड</h1>
        <p className="text-sm text-muted-foreground">नमस्ते डॉ. प्राची 🙏 आज की बिज़नेस रिपोर्ट</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Calendar className="h-3.5 w-3.5" /> पिछले 30 दिन
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Download className="h-3.5 w-3.5" /> रिपोर्ट
        </Button>
      </div>
    </div>

    {/* Stat Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((s) => (
        <Card key={s.title} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">{s.title}</p>
                <p className="text-[10px] text-muted-foreground/60">{s.titleEn}</p>
                <p className="text-2xl font-bold mt-2">{s.value}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${s.positive ? 'text-primary' : 'text-destructive'}`}>
                  {s.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span className="font-medium">{s.change}</span>
                </div>
              </div>
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
            {/* Mini sparkline */}
            <div className="mt-3 -mx-1">
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={salesData.slice(-4)}>
                  <Area type="monotone" dataKey="sales" stroke="hsl(120,37%,25%)" fill="hsl(120,37%,25%)" fillOpacity={0.1} strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Charts Row */}
    <div className="grid lg:grid-cols-3 gap-4 mb-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">बिक्री विश्लेषण (Sales Analytics)</CardTitle>
              <CardDescription className="text-xs">महीने के अनुसार बिक्री और ऑर्डर</CardDescription>
            </div>
            <Tabs defaultValue="sales" className="w-auto">
              <TabsList className="h-7">
                <TabsTrigger value="sales" className="text-xs h-6 px-2">बिक्री</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs h-6 px-2">ऑर्डर</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(120,37%,25%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(120,37%,25%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="sales" stroke="hsl(120,37%,25%)" fill="url(#salesGrad)" strokeWidth={2.5} dot={{ fill: "hsl(120,37%,25%)", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">श्रेणी (Category)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoryData.slice(0, 3).map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ऑर्डर स्थिति</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderStatusData.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.status}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
                <Progress value={(s.count / 65) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Bottom Row */}
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Top Products */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">🏆 टॉप प्रोडक्ट्स</CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {topProducts.map((p, i) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                  <span className="text-sm font-medium truncate max-w-[140px]">{p.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{p.sales} बिक्री</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={p.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-primary">{p.revenue}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">हालिया ऑर्डर्स</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">सभी →</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    o.status === 'delivered' ? 'bg-primary/10 text-primary' :
                    o.status === 'shipped' ? 'bg-sage/10 text-sage' : 'bg-accent/10 text-accent'
                  }`}>
                    {o.status === 'delivered' ? '✓' : o.status === 'shipped' ? '🚚' : '⏳'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{o.id}</p>
                    <p className="text-[10px] text-muted-foreground">{o.customer.split('(')[0].trim()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{o.total}</p>
                  <Badge variant={o.status === "delivered" ? "default" : o.status === "shipped" ? "secondary" : "outline"} className="text-[9px] h-4 px-1">
                    {o.status === "delivered" ? "डिलीवर्ड" : o.status === "shipped" ? "भेजा" : "लंबित"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">📋 गतिविधि (Activity)</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Live</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative">
                  <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center`}>
                    <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
                  </div>
                  {i < recentActivity.length - 1 && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Quick Actions */}
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5 text-xs h-8">🛒 नया ऑर्डर बनाएं</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">📦 प्रोडक्ट जोड़ें</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">📝 ब्लॉग लिखें</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">📱 Reel अपलोड करें</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">💬 WhatsApp भेजें</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">📊 रिपोर्ट डाउनलोड</Button>
        </div>
      </CardContent>
    </Card>
  </AdminLayout>
);

export default AdminDashboard;
