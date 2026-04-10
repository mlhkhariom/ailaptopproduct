import { IndianRupee, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import AdminLayout from "@/components/AdminLayout";
import { salesData, categoryData, orders } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => (
  <AdminLayout>
    <h1 className="text-2xl font-serif font-bold mb-6">Dashboard</h1>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Total Revenue" value="₹3,81,000" change="+12.5% from last month" icon={IndianRupee} />
      <StatCard title="Total Orders" value="473" change="+8.2% from last month" icon={ShoppingBag} />
      <StatCard title="Customers" value="1,284" change="+15.3% from last month" icon={Users} />
      <StatCard title="Conversion" value="3.2%" change="+0.4% from last month" icon={TrendingUp} />
    </div>

    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-lg">Sales Trend</CardTitle></CardHeader>
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
        <CardHeader><CardTitle className="text-lg">By Category</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Order ID</th>
                <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                <th className="pb-3 font-medium text-muted-foreground">Status</th>
                <th className="pb-3 font-medium text-muted-foreground">Date</th>
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
                      {o.status}
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
