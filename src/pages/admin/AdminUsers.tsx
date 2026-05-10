import { useState, useEffect } from "react";
import { Search, Plus, Edit, RefreshCw, Shield, UserCheck, UserX, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ALL_ROLES = ['superadmin', 'admin', 'manager', 'accountant', 'sales', 'technician', 'editor', 'customer'];

const ROLE_COLOR: Record<string, string> = {
  superadmin: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  accountant: 'bg-green-100 text-green-700',
  sales: 'bg-blue-100 text-blue-700',
  technician: 'bg-orange-100 text-orange-700',
  editor: 'bg-cyan-100 text-cyan-700',
  customer: 'bg-gray-100 text-gray-600',
};

const ROLE_PERMS: Record<string, string[]> = {
  superadmin: ['Full Access — Everything'],
  admin:      ['Full ERP + Admin Panel'],
  manager:    ['Job Cards, CRM, Billing, Inventory, Staff, Reports'],
  accountant: ['Billing, Expenses, Reports, Payroll'],
  sales:      ['CRM, Loyalty, Customer 360'],
  technician: ['Job Cards, Inventory'],
  editor:     ['Blog, CMS, Media, Products'],
  customer:   ['Account, Orders only'],
};

const emptyForm = { name: '', email: '', password: '', role: 'technician', phone: '', is_active: true };

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = (currentUser as any)?.role === 'superadmin';
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setUsers(Array.isArray(data) ? data : data?.customers || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialog(true); };
  const openEdit = (u: any) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role || 'customer', phone: u.phone || '', is_active: !!u.is_active }); setDialog(true); };

  const save = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    try {
      if (editing) {
        await api.updateCustomer(editing.id, { name: form.name, role: form.role, phone: form.phone, is_active: form.is_active });
        toast.success('User updated');
      } else {
        if (!form.password) return toast.error('Password required for new user');
        await api.register(form.name, form.email, form.password, form.phone);
        // Set role after creation
        const users2 = await api.getCustomers();
        const newUser = (Array.isArray(users2) ? users2 : users2?.customers || []).find((u: any) => u.email === form.email);
        if (newUser) await api.updateCustomer(newUser.id, { role: form.role });
        toast.success('User created');
      }
      setDialog(false); load();
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  const toggleActive = async (u: any) => {
    await api.updateCustomer(u.id, { is_active: !u.is_active });
    toast.success(u.is_active ? 'Deactivated' : 'Activated');
    load();
  };

  const changeRole = async (u: any, role: string) => {
    await api.updateCustomer(u.id, { role });
    toast.success(`Role → ${role}`);
    load();
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const staffRoles = ['superadmin', 'admin', 'manager', 'accountant', 'sales', 'technician', 'editor'];
  const staffUsers = filtered.filter(u => staffRoles.includes(u.role));
  const customerUsers = filtered.filter(u => !staffRoles.includes(u.role));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Users & Roles</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{users.length} total users · {staffUsers.length} staff · {customerUsers.length} customers</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            {isSuperAdmin && <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> Add User</Button>}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ALL_ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Role permissions reference */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(ROLE_PERMS).filter(([r]) => r !== 'customer').map(([role, perms]) => (
            <div key={role} className="border rounded-lg p-2.5">
              <Badge className={`text-xs mb-1 ${ROLE_COLOR[role]}`}>{role}</Badge>
              <p className="text-xs text-muted-foreground">{perms[0]}</p>
            </div>
          ))}
        </div>

        {/* Staff Users */}
        {staffUsers.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2"><p className="text-sm font-semibold">Staff & Admin ({staffUsers.length})</p></div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left p-3 text-xs font-semibold">Name</th>
                <th className="text-left p-3 text-xs font-semibold">Email</th>
                <th className="text-left p-3 text-xs font-semibold">Phone</th>
                <th className="text-center p-3 text-xs font-semibold">Role</th>
                <th className="text-center p-3 text-xs font-semibold">Status</th>
                <th className="text-center p-3 text-xs font-semibold">Actions</th>
              </tr></thead>
              <tbody>
                {staffUsers.map(u => (
                  <tr key={u.id} className={`border-t hover:bg-muted/20 ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-sm text-muted-foreground">{u.phone || '—'}</td>
                    <td className="p-3 text-center">
                      {isSuperAdmin && u.role !== 'superadmin' ? (
                        <Select value={u.role} onValueChange={r => changeRole(u, r)}>
                          <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>{ALL_ROLES.filter(r => r !== 'superadmin').map(r => <SelectItem key={r} value={r} className="text-xs capitalize">{r}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`text-xs ${ROLE_COLOR[u.role] || 'bg-gray-100'}`}>{u.role}</Badge>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={!!u.is_active} onCheckedChange={() => toggleActive(u)} disabled={u.role === 'superadmin'} />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(u)}><Edit className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer Users */}
        {customerUsers.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2"><p className="text-sm font-semibold">Customers ({customerUsers.length})</p></div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left p-3 text-xs font-semibold">Name</th>
                <th className="text-left p-3 text-xs font-semibold">Email</th>
                <th className="text-left p-3 text-xs font-semibold">Phone</th>
                <th className="text-center p-3 text-xs font-semibold">Status</th>
                <th className="text-center p-3 text-xs font-semibold">Promote</th>
              </tr></thead>
              <tbody>
                {customerUsers.slice(0, 50).map(u => (
                  <tr key={u.id} className={`border-t hover:bg-muted/20 ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-sm text-muted-foreground">{u.phone || '—'}</td>
                    <td className="p-3 text-center"><Switch checked={!!u.is_active} onCheckedChange={() => toggleActive(u)} /></td>
                    <td className="p-3 text-center">
                      {isSuperAdmin && (
                        <Select value={u.role || 'customer'} onValueChange={r => changeRole(u, r)}>
                          <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>{ALL_ROLES.map(r => <SelectItem key={r} value={r} className="text-xs capitalize">{r}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                ))}
                {customerUsers.length > 50 && <tr><td colSpan={5} className="p-3 text-center text-xs text-muted-foreground">Showing 50 of {customerUsers.length} customers</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {!filtered.length && !loading && <div className="text-center py-12 text-muted-foreground">No users found</div>}

        {/* Add/Edit Dialog */}
        <Dialog open={dialog} onOpenChange={setDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{editing ? 'Edit User' : 'Add New User'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Full Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Email *</Label><Input type="email" className="mt-1 h-9" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} disabled={!!editing} /></div>
              <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} /></div>
              {!editing && <div><Label className="text-xs">Password *</Label><Input type="password" className="mt-1 h-9" value={form.password} onChange={e => setForm((f: any) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" /></div>}
              <div><Label className="text-xs">Role</Label>
                <Select value={form.role} onValueChange={v => setForm((f: any) => ({ ...f, role: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_ROLES.filter(r => r !== 'superadmin').map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
                {form.role && ROLE_PERMS[form.role] && <p className="text-xs text-muted-foreground mt-1">{ROLE_PERMS[form.role][0]}</p>}
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm((f: any) => ({ ...f, is_active: v }))} /><Label className="text-xs">Active</Label></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
