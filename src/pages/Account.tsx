import { useState } from "react";
import { User, Mail, Phone, MapPin, ShoppingBag, Heart, LogOut, Edit, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "@/components/CustomerLayout";
import { useAuth } from "@/contexts/AuthContext";
import { orders } from "@/data/mockData";

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  if (!user) { navigate("/login"); return null; }

  const userOrders = orders.slice(0, 3);

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold">My Account</h1>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={() => { logout(); navigate("/"); toast.success("Logged out"); }}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-2 capitalize">{user.role}</Badge>
              <Separator className="my-4" />
              <div className="text-left space-y-3">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> {user.email}</div>
                {user.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {user.phone}</div>}
                <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> India</div>
              </div>
              {user.role === "admin" && (
                <Button className="w-full mt-4 gap-2" onClick={() => navigate("/admin")}>Go to Admin Panel</Button>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders" className="gap-1"><ShoppingBag className="h-3 w-3" /> Orders</TabsTrigger>
                <TabsTrigger value="profile" className="gap-1"><User className="h-3 w-3" /> Profile</TabsTrigger>
                <TabsTrigger value="wishlist" className="gap-1"><Heart className="h-3 w-3" /> Wishlist</TabsTrigger>
              </TabsList>
              <TabsContent value="orders" className="mt-4 space-y-3">
                {userOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="capitalize text-[10px]">{order.status}</Badge>
                          <p className="font-bold text-sm mt-1">₹{order.total}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{item.name} × {item.quantity}</p>
                        ))}
                      </div>
                      {order.trackingId && <p className="text-[10px] text-primary mt-2">Tracking: {order.trackingId}</p>}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="profile" className="mt-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Edit Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-xs">Full Name</Label><Input className="mt-1 h-9" defaultValue={user.name} /></div>
                      <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" defaultValue={user.email} disabled /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" defaultValue={user.phone} /></div>
                      <div><Label className="text-xs">City</Label><Input className="mt-1 h-9" placeholder="Your city" /></div>
                    </div>
                    <div><Label className="text-xs">Address</Label><Input className="mt-1 h-9" placeholder="Full delivery address" /></div>
                    <Button className="gap-2" onClick={() => toast.success("Profile updated!")}><Save className="h-4 w-4" /> Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="wishlist" className="mt-4">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="font-medium">Your wishlist is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Browse products and add your favorites!</p>
                    <Button className="mt-4" onClick={() => navigate("/products")}>Browse Products</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Account;
