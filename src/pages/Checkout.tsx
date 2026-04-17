import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Tag, Loader2, Truck, CreditCard, Smartphone } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

declare global { interface Window { Razorpay: any; } }

const Checkout = () => {
  const { items, getSubtotal, getTotal, discount, appliedCoupon, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const subtotal = getSubtotal();
  const total = getTotal();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shipping, setShipping] = useState<any>({ free: false, standard: 50, cod_charge: 30 });
  const [paymentMethods, setPaymentMethods] = useState<any>({ razorpay: { enabled: false }, paytm: { enabled: false }, cod: { enabled: true } });
  const [addr, setAddr] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    address: '', city: '', state: '', pin: '',
  });

  useEffect(() => {
    api.getShipping(subtotal).then(setShipping).catch(() => {});
    api.getPaymentMethods().then(d => {
      setPaymentMethods(d);
      // Auto-select first enabled method
      if (d.razorpay?.enabled) setPaymentMethod('razorpay');
      else if (d.paytm?.enabled) setPaymentMethod('paytm');
      else setPaymentMethod('cod');
    }).catch(() => {});
  }, [subtotal]);

  const shippingCharge = paymentMethod === 'cod' ? (shipping.standard + shipping.cod_charge) : shipping.standard;
  const finalTotal = total + shippingCharge;

  const placeOrder = async (paymentId?: string, paymentStatus = 'pending') => {
    const orderData = {
      items: items.map(({ product, qty }) => ({ id: product.id, name: product.name, quantity: qty, price: product.price })),
      subtotal, discount, total: finalTotal,
      coupon_code: appliedCoupon || null,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      razorpay_id: paymentId || null,
      address: { name: `${addr.firstName} ${addr.lastName}`, email: addr.email, phone: addr.phone, line: addr.address, city: addr.city, state: addr.state, pin: addr.pin },
    };
    const { order_number } = await api.placeOrder(orderData);
    clearCart();
    toast.success(`Order ${order_number} placed! 🎉`);
    navigate(`/order-success?order=${order_number}${paymentId ? `&payment_id=${paymentId}` : ''}`);
  };

  const handleRazorpay = async () => {
    try {
      const { order_id, key_id, amount } = await api.createRazorpayOrder(finalTotal);
      const options = {
        key: key_id,
        amount,
        currency: 'INR',
        name: 'AI Laptop Wala',
        description: 'Laptop Products',
        order_id,
        prefill: { name: `${addr.firstName} ${addr.lastName}`, email: addr.email, contact: addr.phone },
        handler: async (response: any) => {
          try {
            await api.verifyRazorpay(response);
            await placeOrder(response.razorpay_payment_id, 'paid');
          } catch { toast.error('Payment verification failed'); }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e.message + ' — Falling back to COD');
      setPaymentMethod('cod');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!addr.address || !addr.city || !addr.pin) return toast.error('Please fill shipping address');
    if (!addr.phone) return toast.error('Phone number required');
    setLoading(true);
    try {
      if (paymentMethod === 'razorpay') {
        // Load Razorpay script if not loaded
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        await handleRazorpay();
      } else {
        await placeOrder(undefined, paymentMethod === 'cod' ? 'pending' : 'pending');
        setLoading(false);
      }
    } catch (e: any) {
      toast.error(e.message);
      setLoading(false);
    }
  };

  if (items.length === 0) { navigate("/cart"); return null; }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Shipping Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm">First Name</Label><Input className="mt-1" value={addr.firstName} onChange={e => setAddr(a => ({ ...a, firstName: e.target.value }))} /></div>
                  <div><Label className="text-sm">Last Name</Label><Input className="mt-1" value={addr.lastName} onChange={e => setAddr(a => ({ ...a, lastName: e.target.value }))} /></div>
                </div>
                <div><Label className="text-sm">Email</Label><Input type="email" className="mt-1" value={addr.email} onChange={e => setAddr(a => ({ ...a, email: e.target.value }))} /></div>
                <div><Label className="text-sm">Mobile *</Label><Input className="mt-1" value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
                <div><Label className="text-sm">Address *</Label><Input className="mt-1" value={addr.address} onChange={e => setAddr(a => ({ ...a, address: e.target.value }))} placeholder="House no, Street, Area..." /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-sm">City *</Label><Input className="mt-1" value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} /></div>
                  <div><Label className="text-sm">State</Label><Input className="mt-1" value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} /></div>
                  <div><Label className="text-sm">PIN *</Label><Input className="mt-1" value={addr.pin} onChange={e => setAddr(a => ({ ...a, pin: e.target.value }))} /></div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Payment Method</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {paymentMethods.razorpay?.enabled && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-600" /><span className="font-medium">Razorpay</span><Badge className="text-[9px] bg-blue-100 text-blue-700">Recommended</Badge></div>
                        <span className="block text-xs text-muted-foreground">UPI, Card, Net Banking, Wallets</span>
                      </Label>
                    </div>
                  )}
                  {paymentMethods.paytm?.enabled && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="paytm" id="paytm" />
                      <Label htmlFor="paytm" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-blue-500" /><span className="font-medium">Paytm</span></div>
                        <span className="block text-xs text-muted-foreground">UPI, Paytm Wallet, Cards</span>
                      </Label>
                    </div>
                  )}
                  {paymentMethods.upi?.enabled && !paymentMethods.razorpay?.enabled && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="cursor-pointer flex-1">
                        <span className="font-medium">UPI Direct</span>
                        <span className="block text-xs text-muted-foreground">GPay, PhonePe, Paytm</span>
                      </Label>
                    </div>
                  )}
                  {paymentMethods.cod?.enabled && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        <span className="font-medium">Cash on Delivery</span>
                        <span className="block text-xs text-muted-foreground">Pay when order arrives (+₹{shipping.cod_charge} handling)</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="h-fit">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 flex-1">{product.name} × {qty}</span>
                  <span className="ml-2">₹{product.price * qty}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> Shipping</span>
                <span className={shipping.free && paymentMethod !== 'cod' ? 'text-primary' : ''}>
                  {shipping.free && paymentMethod !== 'cod' ? 'Free' : `₹${shipping.standard}`}
                </span>
              </div>
              {paymentMethod === 'cod' && <div className="flex justify-between text-sm"><span className="text-muted-foreground">COD Charge</span><span>₹{shipping.cod_charge}</span></div>}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary flex items-center gap-1"><Tag className="h-3 w-3" />{appliedCoupon}</span>
                  <span className="text-primary">−₹{discount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{finalTotal}</span></div>
              {shipping.free && paymentMethod !== 'cod' && <p className="text-xs text-primary text-center">🎉 Free shipping applied!</p>}
              <Button className="w-full gap-2" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {loading ? 'Processing...' : paymentMethod === 'razorpay' ? 'Pay with Razorpay' : paymentMethod === 'paytm' ? 'Pay with Paytm' : 'Place Order'}
              </Button>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" /> Secure & Encrypted Payment
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Checkout;
