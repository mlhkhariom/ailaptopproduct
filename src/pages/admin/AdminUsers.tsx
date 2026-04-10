import { useState } from "react";
import { Users, Shield, UserCheck, UserX, Search, Edit, Trash2, MoreHorizontal, Plus, Crown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "editor" | "customer";
  status: "active" | "inactive" | "banned";
  lastLogin: string;
  joinDate: string;
  orders: number;
}

const mockUsers: AppUser[] = [
  { id: "1", name: "Dr. Prachi", email: "admin@apsoncure.com", phone: "+91 98765 43210", role: "admin", status: "active", lastLogin: "2024-01-22", joinDate: "2023-01-01", orders: 0 },
  { id: "2", name: "Hariom Vishwkarma", email: "hariom@mlhk.in", phone: "+91 99999 88888", role: "admin", status: "active", lastLogin: "2024-01-22", joinDate: "2023-01-01", orders: 0 },
  { id: "3", name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43211", role: "customer", status: "active", lastLogin: "2024-01-21", joinDate: "2023-06-10", orders: 5 },
  { id: "4", name: "Rajesh Kumar", email: "rajesh@email.com", phone: "+91 87654 32109", role: "customer", status: "active", lastLogin: "2024-01-20", joinDate: "2023-08-22", orders: 3 },
  { id: "5", name: "Anita Desai", email: "anita@email.com", phone: "+91 76543 21098", role: "customer", status: "inactive", lastLogin: "2024-01-10", joinDate: "2023-11-05", orders: 2 },
  { id: "6", name: "Vikram Singh", email: "vikram@email.com", phone: "+91 99887 76655", role: "editor", status: "active", lastLogin: "2024-01-19", joinDate: "2023-07-15", orders: 0 },
  { id: "7", name: "Meera Patel", email: "meera@email.com", phone: "+91 88776 65544", role: "customer", status: "active", lastLogin: "2024-01-18", joinDate: "2024-01-08", orders: 1 },
  { id: "8", name: "Arjun Nair", email: "arjun@email.com", phone: "+91 77665 54433", role: "customer", status: "banned", lastLogin: "2024-01-05", joinDate: "2023-09-20", orders: 0 },
];

const roleConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: "Admin", color: "bg-red-500/10 text-red-600", icon: Crown },
  manager: { label: "Manager", color: "bg-blue-500/10 text-blue-600", icon: Shield },
  editor: { label: "Editor", color: "bg-purple-500/10 text-purple-600", icon: Edit },
  customer: { label: "Customer", color: "bg-green-500/10 text-green-600", icon: UserCheck },
};

const AdminUsers = () => {
  const [users, setUsers] = useState<AppUser[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = users.filter(u => {
    if (filterRole !== "all" && u.role !== filterRole) return false;
    if (filterStatus !== "all" && u.status !== filterStatus) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    active: users.filter(u => u.status === "active").length,
    customers: users.filter(u => u.role === "customer").length,
  };

  const changeRole = (id: string, role: AppUser["role"]) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    toast.success("Role updated");
  };

  const changeStatus = (id: string, status: AppUser["status"]) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    toast.success("Status updated");
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">User & Role Management</h1>
          <p className="text-sm text-muted-foreground">Manage users, assign roles, and control access permissions</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="h-3.5 w-3.5" /> Add User</Button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Admins", value: stats.admins, icon: Crown, color: "text-red-500" },
          { label: "Active Users", value: stats.active, icon: UserCheck, color: "text-green-500" },
          { label: "Customers", value: stats.customers, icon: UserCheck, color: "text-blue-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30 text-left">
              <th className="p-3 text-xs font-medium text-muted-foreground">User</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Role</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Last Login</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Orders</th>
              <th className="p-3 text-xs font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(user => {
                const rc = roleConfig[user.role];
                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select value={user.role} onValueChange={(v) => changeRole(user.id, v as AppUser["role"])}>
                        <SelectTrigger className="h-7 w-28 text-[10px]">
                          <Badge className={`text-[9px] border-0 ${rc.color}`}>{rc.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin" className="text-xs">👑 Admin</SelectItem>
                          <SelectItem value="manager" className="text-xs">🛡 Manager</SelectItem>
                          <SelectItem value="editor" className="text-xs">✏️ Editor</SelectItem>
                          <SelectItem value="customer" className="text-xs">👤 Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Badge variant={user.status === "active" ? "default" : user.status === "banned" ? "destructive" : "secondary"} className="text-[9px] capitalize">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{user.lastLogin}</td>
                    <td className="p-3 text-xs font-medium">{user.orders}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {user.status === "active" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeStatus(user.id, "inactive")}><UserX className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeStatus(user.id, "active")}><UserCheck className="h-3.5 w-3.5 text-green-500" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("User details modal — connect to Lovable Cloud for full data")}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Role Permissions Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead><tr className="border-b">
              <th className="p-2 text-left text-muted-foreground">Permission</th>
              <th className="p-2 text-center">Admin</th>
              <th className="p-2 text-center">Manager</th>
              <th className="p-2 text-center">Editor</th>
              <th className="p-2 text-center">Customer</th>
            </tr></thead>
            <tbody>
              {[
                { perm: "Dashboard Access", admin: true, manager: true, editor: true, customer: false },
                { perm: "Manage Products", admin: true, manager: true, editor: true, customer: false },
                { perm: "Manage Orders", admin: true, manager: true, editor: false, customer: false },
                { perm: "View Payments", admin: true, manager: true, editor: false, customer: false },
                { perm: "Manage Users", admin: true, manager: false, editor: false, customer: false },
                { perm: "CMS / Content", admin: true, manager: true, editor: true, customer: false },
                { perm: "Settings", admin: true, manager: false, editor: false, customer: false },
                { perm: "Reports", admin: true, manager: true, editor: false, customer: false },
                { perm: "Social Automation", admin: true, manager: true, editor: true, customer: false },
                { perm: "Delete Data", admin: true, manager: false, editor: false, customer: false },
              ].map(row => (
                <tr key={row.perm} className="border-b last:border-0">
                  <td className="p-2 font-medium">{row.perm}</td>
                  <td className="p-2 text-center">{row.admin ? "✅" : "❌"}</td>
                  <td className="p-2 text-center">{row.manager ? "✅" : "❌"}</td>
                  <td className="p-2 text-center">{row.editor ? "✅" : "❌"}</td>
                  <td className="p-2 text-center">{row.customer ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;
