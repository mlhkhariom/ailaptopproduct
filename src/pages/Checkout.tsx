import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Lock } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import { products } from "@/data/mockData";

const checkoutItems = [
  { product: products[0], qty: 2 },
  { product: products[2], qty: 1 },
];
const subtotal = checkoutItems.reduce((s, i) => s + i.product.price * i.qty, 0);

const Checkout = () => (
  <CustomerLayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Shipping Address</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm">First Name</Label><Input placeholder="Priya" className="mt-1" /></div>
                <div><Label className="text-sm">Last Name</Label><Input placeholder="Sharma" className="mt-1" /></div>
              </div>
              <div><Label className="text-sm">Email</Label><Input type="email" placeholder="priya@email.com" className="mt-1" /></div>
              <div><Label className="text-sm">Phone</Label><Input placeholder="+91 98765 43210" className="mt-1" /></div>
              <div><Label className="text-sm">Address</Label><Input placeholder="123, Green Valley" className="mt-1" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-sm">City</Label><Input placeholder="Mumbai" className="mt-1" /></div>
                <div><Label className="text-sm">State</Label><Input placeholder="Maharashtra" className="mt-1" /></div>
                <div><Label className="text-sm">Pincode</Label><Input placeholder="400001" className="mt-1" /></div>
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
                    <span className="block text-xs text-muted-foreground">Cards, UPI, Net Banking, Wallets</span>
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
                    <span className="font-medium">Cash on Delivery</span>
                    <span className="block text-xs text-muted-foreground">Pay when you receive</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Order Summary</h3>
            {checkoutItems.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{product.name} × {qty}</span>
                <span>₹{product.price * qty}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-primary">Free</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{subtotal}</span></div>
            <Button className="w-full gap-2" size="lg"><Lock className="h-4 w-4" /> Place Order</Button>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" /> Secure & Encrypted Payment
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </CustomerLayout>
);

export default Checkout;
