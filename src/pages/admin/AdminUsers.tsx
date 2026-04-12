import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, RefreshCw, Shield, User, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ROLES = ['admin', 'manager', 'editor', 'customer'];
const ROLE_COLOR: Record<string, string> = {
  superadmin: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  customer: 'bg-gray-100 text-gray-600',
};

const PERMISSIONS: Record<string, string[]> = {
  admin:    ['Dashboard', 'Products', 'Orders', 'Payments', 'Customers', 'Blog', 'Social', 'Media', 'WhatsApp', 'CMS', 'Contacts', 'Users', 'Coupons', 'Reports', 'Settings'],
  manager:  ['Dashboard', 'Products', 'Orders', 'Customers', 'Blog', 'Contacts', 'Reports'],
  editor:   ['Dashboard', 'Products', 'Blog', 'CMS', 'Media'],
  customer: ['Account', 'Orders'],
};

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = (currentUser as any)?.role === 'superadmin';
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', is_active: true });
  const [permDialog, setPermDialog] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      // Get all users (customers + admins)
      const [customers, me] = await Promise.all([
        api.getCustomers(),
        api.me(),
      ]);
      // Also fetch admin users via customers endpoint returns only customers
      // We'll use customers list + current user
      setUsers(customers);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'customer', is_active: true }); setDialog(true); };
  const openEdit = (u: any) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, is_active: !!u.is_active }); setDialog(true); };

  const save = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    try {
      if (editing) {
        await api.updateCustomer(editing.id, { role: form.role, is_active: form.is_active });
        toast.success('User updated!');
      } else {
        await api.register(form.name, form.email, form.password || 'changeme123');
        toast.success('User created! Default password: changeme123');
      }
      setDialog(false); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleActive = async (u: any) => {
    await api.updateCustomer(u.id, { role: u.role, is_active: !u.is_active });
    toast.success(u.is_active ? 'Deactivated' : 'Activated');
    load();
  };

  const changeRole = async (u: any, role: string) => {
    await api.updateCustomer(u.id, { role, is_active: u.is_active });
    toast.success(`Role changed to ${role}`);
    load();
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { all: users.length, ...Object.fromEntries(ROLES.map(r => [r, users.filter(u => u.role === r).length])) };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold">Users & Roles</h1>
            <p className="text-sm text-muted-foreground">{users.length} users · {users.filter(u => u.is_active).length} active</p>
          </div>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add User</Button>
        </div>

        {/* Role Tabs */}
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs h-7 px-3">All ({counts.all})</TabsTrigger>
            {ROLES.map(r => <TabsTrigger key={r} value={r} className="text-xs h-7 px-3 capitalize">{r} ({(counts as any)[r] || 0})</TabsTrigger>)}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Permissions Matrix */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Role Permissions</p></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ROLES.map(role => (
                <div key={role}>
                  <Badge className={`${ROLE_COLOR[role]} mb-2 capitalize`}>{role}</Badge>
                  <div className="space-y-0.5">
                    {PERMISSIONS[role].map(p => <p key={p} className="text-[10px] text-muted-foreground">✓ {p}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => (
              <Card key={u.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{u.name}</p>
                      <Badge className={`text-[10px] capitalize ${ROLE_COLOR[u.role] || ROLE_COLOR.customer}`}>{u.role}</Badge>
                      <Badge className={`text-[10px] ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.order_count || 0} orders · ₹{(u.total_spent || 0).toLocaleString()} spent</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Role change — only superadmin */}
                    {isSuperAdmin ? (
                      <Select value={u.role} onValueChange={v => changeRole(u, v)}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLES.map(r => <SelectItem key={r} value={r} className="text-xs capitalize">{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`text-[10px] capitalize ${ROLE_COLOR[u.role] || ROLE_COLOR.customer}`}>{u.role}</Badge>
                    )}
                    <button onClick={() => setPermDialog(u)} title="View permissions">
                      <Shield className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                    {/* Cannot deactivate superadmin or other admins (unless superadmin) */}
                    {(isSuperAdmin || (u.role !== 'admin' && u.role !== 'superadmin')) && (
                      <button onClick={() => toggleActive(u)}>
                        {u.is_active ? <UserX className="h-4 w-4 text-red-400 hover:text-red-600" /> : <UserCheck className="h-4 w-4 text-green-500 hover:text-green-600" />}
                      </button>
                    )}
                    {/* Edit — only superadmin can edit admins */}
                    {(isSuperAdmin || (u.role !== 'admin' && u.role !== 'superadmin')) && (
                      <button onClick={() => openEdit(u)}>
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><User className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No users found</p></div>}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={f('name')} className="mt-1 text-sm" disabled={!!editing} /></div>
            <div><Label className="text-xs">Email *</Label><Input value={form.email} onChange={f('email')} className="mt-1 text-sm" disabled={!!editing} /></div>
            {!editing && <div><Label className="text-xs">Password</Label><Input type="password" value={form.password} onChange={f('password')} className="mt-1 text-sm" placeholder="Default: changeme123" /></div>}
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} /><Label className="text-xs">Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={!!permDialog} onOpenChange={() => setPermDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> {permDialog?.name}'s Permissions</DialogTitle></DialogHeader>
          {permDialog && (
            <div>
              <Badge className={`${ROLE_COLOR[permDialog.role]} capitalize mb-3`}>{permDialog.role} Role</Badge>
              <div className="grid grid-cols-2 gap-1.5">
                {PERMISSIONS[permDialog.role]?.map(p => (
                  <div key={p} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 rounded px-2 py-1">
                    <span className="text-green-500">✓</span> {p}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
