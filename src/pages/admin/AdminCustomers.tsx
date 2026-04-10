import { useState } from "react";
import { Search, Download, Phone, Mail, ShoppingBag, IndianRupee, Calendar, MoreHorizontal, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/AdminLayout";
import { customers } from "@/data/mockData";

const AdminCustomers = () => {
  const [search, setSearch] = useState("");
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalLifetime = customers.reduce((s, c) => s + c.lifetimeValue, 0);
  const avgLifetime = Math.round(totalLifetime / customers.length);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">👥 ग्राहक डेटाबेस (Customers)</h1>
          <p className="text-sm text-muted-foreground">{customers.length} रजिस्टर्ड ग्राहक</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><Download className="h-3.5 w-3.5" /> Export</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{customers.length}</p><p className="text-xs text-muted-foreground">कुल ग्राहक</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">₹{totalLifetime.toLocaleString()}</p><p className="text-xs text-muted-foreground">कुल Lifetime Value</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">₹{avgLifetime.toLocaleString()}</p><p className="text-xs text-muted-foreground">औसत LTV</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{customers.reduce((s, c) => s + c.totalOrders, 0)}</p><p className="text-xs text-muted-foreground">कुल ऑर्डर</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">ग्राहक सूची</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="नाम, ईमेल या फ़ोन..." className="pl-8 h-8 text-xs w-52" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="p-3 font-medium text-muted-foreground text-xs">ग्राहक</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">फ़ोन</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">शहर</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">कुल ऑर्डर</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Lifetime Value</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">अंतिम ऑर्डर</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">जॉइन तारीख</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">{c.name[0]}</span>
                        </div>
                        <div>
                          <span className="font-medium text-sm block">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs">{c.phone}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{c.city}</Badge></td>
                    <td className="p-3">
                      <span className="text-sm font-medium flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> {c.totalOrders}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-primary flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {c.lifetimeValue.toLocaleString()}</span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{c.lastOrder}</td>
                    <td className="p-3 text-xs text-muted-foreground">{c.joinDate}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="text-xs"><Eye className="h-3 w-3 mr-2" /> ऑर्डर हिस्ट्री</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs"><MessageCircle className="h-3 w-3 mr-2" /> WhatsApp</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs"><Mail className="h-3 w-3 mr-2" /> ईमेल भेजें</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCustomers;
