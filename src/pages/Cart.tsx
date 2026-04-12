import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQty, removeItem, getSubtotal, getTotal, discount, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { products } = useProductStore();
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();
  const suggested = products.filter((p) => !items.find((i) => i.product.id === p.id)).slice(0, 4);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      const ok = await applyCoupon(couponInput);
      if (ok) toast.success("Coupon applied!");
      else toast.error("Invalid coupon or minimum order not met");
      setCouponInput("");
    } finally { setApplying(false); }
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-xl font-medium mb-2">Your cart is empty</p>
            <p className="text-muted-foreground mb-6">Browse our products and add your favorites!</p>
            <Link to="/products"><Button size="lg">Continue Shopping</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, qty }) => (
                <Card key={product.id}>
                  <CardContent className="p-4 flex gap-4">
                    <img src={product.image} alt={product.name} className="h-24 w-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <Link to={`/products/${product.id}`} className="font-semibold text-sm hover:text-primary">{product.name}</Link>
                      {product.nameHi && <p className="text-xs text-muted-foreground">{product.nameHi}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-lg">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(product.id, qty - 1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(product.id, qty + 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">₹{product.price * qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="h-fit">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal ({items.length} items)</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className="text-primary">Free</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-primary flex items-center gap-1"><Tag className="h-3 w-3" /> {appliedCoupon}</span>
                    <span className="text-primary">−₹{discount}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold"><span>Total</span><span>₹{total}</span></div>

                {/* Coupon */}
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="h-9 text-sm uppercase" />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={applying}>{applying ? '...' : 'Apply'}</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px]">{appliedCoupon}</Badge>
                      <span className="text-xs text-primary">−₹{discount} off</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={removeCoupon}>Remove</Button>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground">Try: AYUR10, FLAT100, WELCOME20</p>

                <Link to="/checkout">
                  <Button className="w-full gap-2 mt-2">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suggested */}
        {suggested.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggested.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default Cart;
