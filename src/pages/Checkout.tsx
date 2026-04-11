import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Tag } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Checkout = () => {
  const { items, getSubtotal, getTotal, discount, appliedCoupon, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saveAddress, setSaveAddress] = useState(true);
  const subtotal = getSubtotal();
  const total = getTotal();

  const handlePlaceOrder = () => {
    toast.success("Order placed successfully! 🎉");
    clearCart();
    navigate("/track-order");
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Shipping Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm">First Name</Label><Input placeholder={user?.name?.split(' ')[0] || "Name"} className="mt-1" defaultValue={user?.name?.split(' ')[0]} /></div>
                  <div><Label className="text-sm">Last Name</Label><Input placeholder="Last name" className="mt-1" defaultValue={user?.name?.split(' ').slice(1).join(' ')} /></div>
                </div>
                <div><Label className="text-sm">Email</Label><Input type="email" className="mt-1" defaultValue={user?.email} /></div>
                <div><Label className="text-sm">Mobile Number</Label><Input placeholder="+91 98765 43210" className="mt-1" defaultValue={user?.phone} /></div>
                <div><Label className="text-sm">Address</Label><Input placeholder="123, Green Valley, Street..." className="mt-1" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-sm">City</Label><Input placeholder="Mumbai" className="mt-1" /></div>
                  <div><Label className="text-sm">State</Label><Input placeholder="Maharashtra" className="mt-1" /></div>
                  <div><Label className="text-sm">PIN Code</Label><Input placeholder="400001" className="mt-1" /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={saveAddress} onCheckedChange={(v) => setSaveAddress(!!v)} />
                  <Label className="text-xs text-muted-foreground">Save this address for future orders</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Payment Method</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup defaultValue="razorpay" className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="cursor-pointer flex-1">
                      <span className="font-medium">Razorpay</span>
                      <span className="block text-xs text-muted-foreground">Card, UPI, Net Banking, Wallets</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="cursor-pointer flex-1">
                      <span className="font-medium">UPI Direct</span>
                      <span className="block text-xs text-muted-foreground">GPay, PhonePe, Paytm</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer flex-1">
                      <span className="font-medium">Cash on Delivery (COD)</span>
                      <span className="block text-xs text-muted-foreground">Pay when your order arrives (+₹30)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{product.name} × {qty}</span>
                  <span>₹{product.price * qty}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className="text-primary">Free</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary flex items-center gap-1"><Tag className="h-3 w-3" /> {appliedCoupon}</span>
                  <span className="text-primary">−₹{discount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total}</span></div>
              <Button className="w-full gap-2" size="lg" onClick={handlePlaceOrder}><Lock className="h-4 w-4" /> Place Order</Button>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" /> Secure Payment
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Checkout;
