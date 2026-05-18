import SEOHead from "@/components/common/SEOHead";
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
import CustomerLayout from "@/components/layout/CustomerLayout";
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
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  useEffect(() => {
    api.getShipping(subtotal).then(setShipping).catch(() => {});
    api.getPaymentMethods().then(d => {
      setPaymentMethods(d);
      if (d.razorpay?.enabled) setPaymentMethod('razorpay');
      else if (d.phonepe?.enabled) setPaymentMethod('phonepe');
      else if (d.cashfree?.enabled) setPaymentMethod('cashfree');
      else if (d.paytm?.enabled) setPaymentMethod('paytm');
      else setPaymentMethod('cod');
    }).catch(() => {});
    // Fetch saved addresses
    if (user) {
      fetch('/api/addresses', { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } })
        .then(r => r.json()).then(addrs => {
          if (Array.isArray(addrs) && addrs.length > 0) {
            setSavedAddresses(addrs);
            const def = addrs.find((a: any) => a.is_default) || addrs[0];
            if (def) {
              setSelectedAddressId(def.id);
              setAddr({ firstName: def.name.split(' ')[0], lastName: def.name.split(' ').slice(1).join(' '), email: user?.email || '', phone: def.phone, address: def.address, city: def.city, state: def.state, pin: def.pin });
            }
          }
        }).catch(() => {});
    }
  }, [subtotal]);

  const shippingCharge = paymentMethod === 'cod' ? (shipping.standard + shipping.cod_charge) : shipping.standard;
  // Prepaid discount (if enabled and not COD)
  const prepaidDiscount = paymentMethod !== 'cod' && paymentMethods.prepaid_discount_enabled
    ? Math.round((total * (paymentMethods.prepaid_discount_percent || 0)) / 100)
    : 0;
  const finalTotal = total + shippingCharge - prepaidDiscount;

  const placeOrder = async (paymentId?: string, paymentStatus = 'pending') => {
    const orderData = {
      items: items.map(({ product, qty }) => ({ id: product.id, name: product.name, quantity: qty, price: product.price })),
      subtotal, discount, shipping_charge: shippingCharge, total: finalTotal,
      coupon_code: appliedCoupon || null,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      razorpay_id: paymentId || null,
      address: { name: `${addr.firstName} ${addr.lastName}`, email: addr.email, phone: addr.phone, line: addr.address, city: addr.city, state: addr.state, pin: addr.pin },
    };
    const { order_number } = await api.placeOrder(orderData);
    clearCart();
    // Auto-save address for future orders
    const token = localStorage.getItem('ailaptopwala_token');
    if (token && addr.address && addr.city && addr.pin && selectedAddressId !== 'new' && savedAddresses.length === 0) {
      fetch('/api/addresses', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ label: 'Home', name: `${addr.firstName} ${addr.lastName}`, phone: addr.phone, address: addr.address, city: addr.city, state: addr.state, pin: addr.pin, is_default: 1 }) }).catch(() => {});
    }
    toast.success(`Order ${order_number} placed! 🎉`);
    navigate(`/order-success?order=${order_number}${paymentId ? `&payment_id=${paymentId}` : ''}`);
  };

  const handlePhonePe = async () => {
    try {
      const orderData = {
        items: items.map(({ product, qty }) => ({ id: product.id, name: product.name, quantity: qty, price: product.price })),
        subtotal, discount, shipping_charge: shippingCharge, total: finalTotal,
        coupon_code: appliedCoupon || null,
        payment_method: 'phonepe',
        payment_status: 'pending',
        address: { name: `${addr.firstName} ${addr.lastName}`, email: addr.email, phone: addr.phone, line: addr.address, city: addr.city, state: addr.state, pin: addr.pin },
      };
      const { order_number } = await api.placeOrder(orderData);

      const token = localStorage.getItem('ailaptopwala_token');
      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: finalTotal, orderId: order_number, customerPhone: addr.phone }),
      }).then(r => r.json());

      if (res.error) { toast.error(res.error); setLoading(false); return; }

      clearCart();
      // Redirect to PhonePe hosted page
      window.location.href = res.redirect_url;
    } catch (e: any) {
      toast.error(e.message || 'PhonePe init failed');
      setLoading(false);
    }
  };

  const handleCashfree = async () => {
    try {
      // Place order first (pending)
      const orderData = {
        items: items.map(({ product, qty }) => ({ id: product.id, name: product.name, quantity: qty, price: product.price })),
        subtotal, discount, shipping_charge: shippingCharge, total: finalTotal,
        coupon_code: appliedCoupon || null,
        payment_method: 'cashfree',
        payment_status: 'pending',
        address: { name: `${addr.firstName} ${addr.lastName}`, email: addr.email, phone: addr.phone, line: addr.address, city: addr.city, state: addr.state, pin: addr.pin },
      };
      const { order_number } = await api.placeOrder(orderData);

      // Create Cashfree order
      const token = localStorage.getItem('ailaptopwala_token');
      const res = await fetch('/api/payment/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: finalTotal, orderId: order_number,
          customerName: `${addr.firstName} ${addr.lastName}`, customerEmail: addr.email, customerPhone: addr.phone,
        }),
      }).then(r => r.json());

      if (res.error) { toast.error(res.error); setLoading(false); return; }

      // Load Cashfree SDK
      if (!(window as any).Cashfree) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = res.environment === 'production' ? 'https://sdk.cashfree.com/js/v3/cashfree.js' : 'https://sdk.cashfree.com/js/v3/cashfree.sandbox.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const cashfree = (window as any).Cashfree({ mode: res.environment === 'production' ? 'production' : 'sandbox' });
      clearCart();
      cashfree.checkout({ paymentSessionId: res.payment_session_id, redirectTarget: '_self' });
    } catch (e: any) {
      toast.error(e.message || 'Cashfree init failed');
      setLoading(false);
    }
  };

  const handlePaytm = async () => {
    try {
      // First place order (pending) to get order_number
      const orderData = {
        items: items.map(({ product, qty }) => ({ id: product.id, name: product.name, quantity: qty, price: product.price })),
        subtotal, discount, shipping_charge: shippingCharge, total: finalTotal,
        coupon_code: appliedCoupon || null,
        payment_method: 'paytm',
        payment_status: 'pending',
        address: { name: `${addr.firstName} ${addr.lastName}`, email: addr.email, phone: addr.phone, line: addr.address, city: addr.city, state: addr.state, pin: addr.pin },
      };
      const { order_number } = await api.placeOrder(orderData);

      // Initiate Paytm
      const token = localStorage.getItem('ailaptopwala_token');
      const res = await fetch('/api/payment/paytm/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: finalTotal, orderId: order_number, customerId: user?.id, email: addr.email, phone: addr.phone }),
      }).then(r => r.json());

      if (res.error) { toast.error(res.error); setLoading(false); return; }

      // Auto-submit form to Paytm
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = res.transactionUrl;
      Object.entries(res.params).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = k; input.value = String(v);
        form.appendChild(input);
      });
      const csInput = document.createElement('input');
      csInput.type = 'hidden'; csInput.name = 'CHECKSUMHASH'; csInput.value = res.checksumHash;
      form.appendChild(csInput);
      clearCart();
      document.body.appendChild(form);
      form.submit();
    } catch (e: any) {
      toast.error(e.message || 'Paytm init failed');
      setLoading(false);
    }
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
        // Filter methods based on admin settings
        method: {
          upi: paymentMethods.upi?.enabled !== false,
          card: paymentMethods.card?.enabled !== false,
          netbanking: paymentMethods.netbanking?.enabled !== false,
          wallet: paymentMethods.wallet?.enabled === true,
          emi: paymentMethods.emi?.enabled === true,
        },
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
    // Min order check
    const minOrder = Number(paymentMethods.min_order) || 0;
    if (subtotal < minOrder) return toast.error(`Minimum order amount is ₹${minOrder}`);
    // Max COD check
    if (paymentMethod === 'cod') {
      const maxCod = Number(paymentMethods.max_cod) || 0;
      if (maxCod && finalTotal > maxCod) return toast.error(`COD not available for orders above ₹${maxCod}. Please use online payment.`);
    }
    if (!addr.phone) return toast.error('Phone number required');
    setLoading(true);
    try {
      if (paymentMethod === 'razorpay') {
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        await handleRazorpay();
      } else if (paymentMethod === 'cashfree') {
        await handleCashfree();
      } else if (paymentMethod === 'phonepe') {
        await handlePhonePe();
      } else if (paymentMethod === 'paytm') {
        await handlePaytm();
      } else if (paymentMethod === 'upi') {
        // UPI Direct — place order as pending, show UPI ID to customer
        await placeOrder(undefined, 'pending');
        setLoading(false);
        toast.success(`Pay ₹${finalTotal} to UPI: ${paymentMethods.merchant_upi}\nShare screenshot on WhatsApp for confirmation.`, { duration: 10000 });
      } else {
        // COD or default
        await placeOrder(undefined, 'pending');
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
      <SEOHead title="Checkout — AI Laptop Wala" canonical="/checkout" noindex={true} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Shipping Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Saved Addresses</p>
                    <div className="grid gap-2">
                      {savedAddresses.map((sa: any) => (
                        <button key={sa.id} onClick={() => {
                          setSelectedAddressId(sa.id);
                          setAddr({ firstName: sa.name.split(' ')[0], lastName: sa.name.split(' ').slice(1).join(' '), email: user?.email || '', phone: sa.phone, address: sa.address, city: sa.city, state: sa.state, pin: sa.pin });
                        }}
                          className={`text-left p-3 rounded-lg border-2 transition-all ${selectedAddressId === sa.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full border-2 ${selectedAddressId === sa.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                            <span className="text-sm font-semibold">{sa.label || 'Address'}</span>
                            {sa.is_default ? <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span> : null}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-5">{sa.name} • {sa.phone}</p>
                          <p className="text-xs text-muted-foreground ml-5">{sa.address}, {sa.city} - {sa.pin}</p>
                        </button>
                      ))}
                      <button onClick={() => { setSelectedAddressId('new'); setAddr({ firstName: '', lastName: '', email: user?.email || '', phone: '', address: '', city: '', state: '', pin: '' }); }}
                        className={`text-left p-3 rounded-lg border-2 border-dashed transition-all ${selectedAddressId === 'new' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                        <p className="text-sm font-medium text-primary">+ Add New Address</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Address Form (show if no saved or 'new' selected) */}
                {(savedAddresses.length === 0 || selectedAddressId === 'new' || !selectedAddressId) && (
                <>
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
                </>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium">Order Notes (optional)</Label>
                <textarea className="mt-1.5 w-full border rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none" placeholder="Special instructions, delivery timing, gift message..." value={(window as any).__orderNotes || ''} onChange={e => { (window as any).__orderNotes = e.target.value; }} />
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
                  {paymentMethods.phonepe?.enabled && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="phonepe" id="phonepe" />
                      <Label htmlFor="phonepe" className="cursor-pointer flex-1">
                        <span className="font-medium">PhonePe</span>
                        <span className="block text-xs text-muted-foreground">Pay via UPI, Cards, Wallet</span>
                      </Label>
                    </div>
                  )}
                  {paymentMethods.cashfree?.enabled && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="cashfree" id="cashfree" />
                      <Label htmlFor="cashfree" className="cursor-pointer flex-1">
                        <span className="font-medium">Cashfree</span>
                        <span className="block text-xs text-muted-foreground">UPI, Cards, NetBanking, Wallets</span>
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
                  {paymentMethods.upi?.enabled && paymentMethods.merchant_upi && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="cursor-pointer flex-1">
                        <span className="font-medium">UPI Direct (QR)</span>
                        <span className="block text-xs text-muted-foreground">Pay to {paymentMethods.merchant_upi} via any UPI app</span>
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
              <div className="text-xs text-muted-foreground text-center mt-1 p-2 bg-muted/50 rounded">
                📦 Estimated Delivery: <strong>{addr.pin?.startsWith('452') ? '1-2 days' : '3-5 days'}</strong>
                {addr.pin?.startsWith('452') && ' (Indore — Free)'}
              </div>

              {/* Wallet Balance */}
              <WalletAtCheckout />

              {/* Available Coupons */}
              {!appliedCoupon && (
                <AvailableCouponsCheckout subtotal={subtotal} />
              )}

              <Button className="w-full gap-2" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {loading ? 'Processing...' : paymentMethod === 'razorpay' ? 'Pay with Razorpay' : paymentMethod === 'phonepe' ? 'Pay with PhonePe' : paymentMethod === 'cashfree' ? 'Pay with Cashfree' : paymentMethod === 'paytm' ? 'Pay with Paytm' : paymentMethod === 'upi' ? 'Pay via UPI' : 'Place Order'}
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

function WalletAtCheckout() {
  const [balance, setBalance] = useState(0);
  const [applied, setApplied] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  useEffect(() => {
    if (!token) return;
    fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setBalance(d.balance || 0)).catch(() => {});
  }, []);
  if (!token || balance <= 0) return null;
  return (
    <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between">
      <div><p className="text-xs font-semibold text-purple-700">Wallet: ₹{balance}</p><p className="text-[10px] text-muted-foreground">Use at checkout</p></div>
      <Button size="sm" variant={applied ? "secondary" : "outline"} className="text-xs h-7" onClick={() => { setApplied(!applied); (window as any).__useWallet = !applied ? balance : 0; toast(applied ? 'Wallet removed' : `₹${balance} wallet applied!`); }}>
        {applied ? '✓ Applied' : 'Use'}
      </Button>
    </div>
  );
}

function AvailableCouponsCheckout({ subtotal }: { subtotal: number }) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const { applyCoupon } = useCartStore();
  useEffect(() => { fetch('/api/coupons/active').then(r => r.json()).then(d => { if (Array.isArray(d)) setCoupons(d.filter(c => !c.min_order || subtotal >= c.min_order)); }).catch(() => {}); }, [subtotal]);
  if (coupons.length === 0) return null;
  return (
    <div className="p-2 rounded-lg bg-green-50 border border-green-200">
      <p className="text-[10px] font-semibold text-green-700 mb-1.5">Available Coupons</p>
      {coupons.slice(0, 2).map(c => (
        <div key={c.code} className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} off</span>
          <button className="font-bold text-green-700 border border-dashed border-green-500 px-2 py-0.5 rounded text-[10px]" onClick={async () => { const ok = await applyCoupon(c.code); if (ok) toast.success(`${c.code} applied!`); else toast.error('Could not apply'); }}>{c.code}</button>
        </div>
      ))}
    </div>
  );
}

export default Checkout;
