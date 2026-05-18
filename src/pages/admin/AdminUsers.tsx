import { useState, useEffect } from "react";
import { Search, Plus, Edit, RefreshCw, Shield, UserCheck, UserX, Key, Trash2, Users, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";

const ROLES = [
  { value: 'superadmin', label: 'Super Admin (Owner)', color: 'bg-yellow-100 text-yellow-800', perms: 'Full access — everything' },
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700', perms: 'All modules, settings, users' },
  { value: 'manager', label: 'Manager', color: 'bg-purple-100 text-purple-700', perms: 'Orders, inventory, staff, CRM, job cards' },
  { value: 'accountant', label: 'Accountant', color: 'bg-green-100 text-green-700', perms: 'Billing, finance, expenses, reports' },
  { value: 'hr', label: 'HR', color: 'bg-pink-100 text-pink-700', perms: 'Staff, payroll, attendance, leaves' },
  { value: 'sales', label: 'Sales', color: 'bg-blue-100 text-blue-700', perms: 'Leads, orders, customers, WhatsApp' },
  { value: 'technician', label: 'Technician', color: 'bg-orange-100 text-orange-700', perms: 'Job cards, inventory (read), repairs' },
  { value: 'content_editor', label: 'Content Editor', color: 'bg-cyan-100 text-cyan-700', perms: 'Blog, banners, pages, media' },
  { value: 'support', label: 'Support', color: 'bg-indigo-100 text-indigo-700', perms: 'Orders (read), leads (create), job cards' },
  { value: 'staff', label: 'Staff', color: 'bg-gray-100 text-gray-600', perms: 'Basic — expense submission only' },
  { value: 'customer', label: 'Customer', color: 'bg-gray-50 text-gray-500', perms: 'Public store only' },
];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'staff', is_active: true });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => {
    setLoading(true);
    fetch('/api/customers?all=1', { headers }).then(r => r.json()).then(d => {
      setUsers(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (!search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search))
  );

  const openAdd = () => { setEditingUser(null); setForm({ name: '', email: '', phone: '', password: '', role: 'staff', is_active: true }); setDialogOpen(true); };
  const openEdit = (u: any) => { setEditingUser(u); setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.role, is_active: u.is_active !== 0 }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    if (!editingUser && !form.password) return toast.error('Password required for new user');
    try {
      if (editingUser) {
        await fetch(`/api/customers/${editingUser.id}`, { method: 'PUT', headers, body: JSON.stringify(form) });
        toast.success('User updated');
      } else {
        await fetch('/api/auth/register', { method: 'POST', headers, body: JSON.stringify(form) });
        toast.success('User created');
      }
      setDialogOpen(false); load();
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/customers/${id}`, { method: 'PUT', headers, body: JSON.stringify({ is_active: active ? 1 : 0 }) });
    toast.success(active ? 'User activated' : 'User deactivated');
    load();
  };

  const changeRole = async (id: string, role: string) => {
    await fetch(`/api/customers/${id}`, { method: 'PUT', headers, body: JSON.stringify({ role }) });
    toast.success(`Role changed to ${role}`);
    load();
  };

  const resetPassword = async (id: string) => {
    const pw = prompt('Enter new password (min 6 chars):');
    if (!pw || pw.length < 6) return toast.error('Min 6 characters');
    await fetch(`/api/customers/${id}`, { method: 'PUT', headers, body: JSON.stringify({ password: pw }) });
    toast.success('Password reset');
  };

  const roleCounts = ROLES.map(r => ({ ...r, count: users.filter(u => u.role === r.value).length }));

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Users className="h-6 w-6" /> User Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} total users • {users.filter(u => u.is_active !== 0).length} active</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
            <Button size="sm" className="gap-1.5" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add User</Button>
          </div>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {roleCounts.filter(r => r.count > 0 || ['superadmin', 'admin', 'manager', 'sales', 'technician'].includes(r.value)).slice(0, 6).map(r => (
            <Card key={r.value} className={`cursor-pointer ${roleFilter === r.value ? 'ring-2 ring-primary' : ''}`} onClick={() => setRoleFilter(roleFilter === r.value ? 'all' : r.value)}>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-black">{r.count}</p>
                <p className="text-[10px] text-muted-foreground">{r.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, phone..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left font-medium">User</th>
                    <th className="p-3 text-left font-medium">Contact</th>
                    <th className="p-3 text-left font-medium">Role</th>
                    <th className="p-3 text-center font-medium">Status</th>
                    <th className="p-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {u.id?.slice(0, 8)}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</p>
                        {u.phone && <p className="text-xs flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {u.phone}</p>}
                      </td>
                      <td className="p-3">
                        <Select value={u.role} onValueChange={v => changeRole(u.id, v)} disabled={u.id === currentUser?.id}>
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <Badge className={`text-[10px] ${ROLES.find(r => r.value === u.role)?.color || 'bg-gray-100'}`}>{u.role}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map(r => <SelectItem key={r.value} value={r.value}><span className="text-xs">{r.label}</span></SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-center">
                        <Switch checked={u.is_active !== 0} onCheckedChange={v => toggleActive(u.id, v)} disabled={u.id === currentUser?.id} />
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-center">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(u)} title="Edit"><Edit className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => resetPassword(u.id)} title="Reset Password"><Key className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-10">No users found</p>}
            </div>
          </CardContent>
        </Card>

        {/* Permission Reference */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Shield className="h-4 w-4" /> Role Permissions Reference</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {ROLES.filter(r => r.value !== 'customer').map(r => (
                <div key={r.value} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30">
                  <Badge className={`text-[9px] ${r.color}`}>{r.label}</Badge>
                  <span className="text-muted-foreground">{r.perms}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Full Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Email *</Label><Input type="email" className="mt-1" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input className="mt-1" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>{editingUser ? 'New Password (leave blank to keep)' : 'Password *'}</Label><Input type="password" className="mt-1" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label} — {r.perms}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Active</Label>
              </div>
              <Button className="w-full" onClick={save}>{editingUser ? 'Update User' : 'Create User'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
