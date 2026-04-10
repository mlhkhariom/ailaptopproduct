import { IndianRupee, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import AdminLayout from "@/components/AdminLayout";
import { salesData, categoryData, orders } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => (
  <AdminLayout>
    <h1 className="text-2xl font-serif font-bold mb-6">डैशबोर्ड (Dashboard)</h1>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="कुल आय (Revenue)" value="₹3,81,000" change="+12.5% पिछले महीने से" icon={IndianRupee} />
      <StatCard title="कुल ऑर्डर्स" value="473" change="+8.2% पिछले महीने से" icon={ShoppingBag} />
      <StatCard title="ग्राहक (Customers)" value="1,284" change="+15.3% पिछले महीने से" icon={Users} />
      <StatCard title="कन्वर्जन रेट" value="3.2%" change="+0.4% पिछले महीने से" icon={TrendingUp} />
    </div>

    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-lg">बिक्री रुझान (Sales Trend)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="hsl(120, 37%, 25%)" strokeWidth={2} dot={{ fill: "hsl(120, 37%, 25%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">श्रेणी अनुसार (By Category)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader><CardTitle className="text-lg">हालिया ऑर्डर्स (Recent Orders)</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">ऑर्डर ID</th>
                <th className="pb-3 font-medium text-muted-foreground">ग्राहक</th>
                <th className="pb-3 font-medium text-muted-foreground">राशि</th>
                <th className="pb-3 font-medium text-muted-foreground">स्थिति</th>
                <th className="pb-3 font-medium text-muted-foreground">तारीख</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{o.id}</td>
                  <td className="py-3">{o.customer}</td>
                  <td className="py-3">₹{o.total}</td>
                  <td className="py-3">
                    <Badge variant={o.status === "delivered" ? "default" : o.status === "shipped" ? "secondary" : "outline"} className="text-xs capitalize">
                      {o.status === "delivered" ? "डिलीवर्ड" : o.status === "shipped" ? "भेजा गया" : "लंबित"}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </AdminLayout>
);

export default AdminDashboard;
