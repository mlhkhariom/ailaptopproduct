import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CustomerLayout from "@/components/CustomerLayout";
import { products } from "@/data/mockData";

const initialCart = [
  { product: products[0], qty: 2 },
  { product: products[2], qty: 1 },
  { product: products[4], qty: 1 },
];

const Cart = () => {
  const [items, setItems] = useState(initialCart);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => prev.map((i) => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/products"><Button>Continue Shopping</Button></Link>
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
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-lg">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(product.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(product.id, 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">₹{product.price * qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(product.id)}><Trash2 className="h-4 w-4" /></Button>
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
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-primary">Free</span></div>
                <Separator />
                <div className="flex justify-between font-bold"><span>Total</span><span>₹{subtotal}</span></div>
                <Link to="/checkout">
                  <Button className="w-full gap-2 mt-2">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default Cart;
