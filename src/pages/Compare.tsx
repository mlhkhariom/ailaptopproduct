import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Scale, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export default function Compare() {
  const [items, setItems] = useState<any[]>([]);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => { setItems(JSON.parse(localStorage.getItem('compare') || '[]')); }, []);

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('compare', JSON.stringify(updated));
  };

  const clearAll = () => { setItems([]); localStorage.setItem('compare', '[]'); };

  if (items.length === 0) return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-black mb-2">Compare Products</h1>
        <p className="text-muted-foreground mb-4">Add products to compare from product pages</p>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <SEOHead title="Compare Products | AI Laptop Wala" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2"><Scale className="h-6 w-6" /> Compare ({items.length})</h1>
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">Clear All</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground w-32">Feature</th>
                {items.map(item => (
                  <th key={item.id} className="p-3 text-center border-l relative">
                    <button onClick={() => remove(item.id)} className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    <Link to={`/products/${item.slug || item.id}`}>
                      {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg mx-auto mb-2" />}
                      <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 text-sm text-muted-foreground">Price</td>
                {items.map(item => (
                  <td key={item.id} className="p-3 text-center border-l">
                    <span className="text-lg font-black text-primary">₹{item.price?.toLocaleString('en-IN')}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-t bg-muted/30">
                <td className="p-3 text-sm text-muted-foreground">Category</td>
                {items.map(item => <td key={item.id} className="p-3 text-center border-l text-sm">{item.category || '-'}</td>)}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-sm text-muted-foreground">Rating</td>
                {items.map(item => <td key={item.id} className="p-3 text-center border-l text-sm">{item.rating ? `⭐ ${item.rating}/5` : '-'}</td>)}
              </tr>
              <tr className="border-t bg-muted/30">
                <td className="p-3 text-sm text-muted-foreground">Stock</td>
                {items.map(item => (
                  <td key={item.id} className="p-3 text-center border-l">
                    <Badge variant={item.in_stock ? 'default' : 'destructive'}>{item.in_stock ? 'In Stock' : 'Out of Stock'}</Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-3 text-sm text-muted-foreground">Action</td>
                {items.map(item => (
                  <td key={item.id} className="p-3 text-center border-l">
                    <Button size="sm" className="gap-1" onClick={() => { addItem(item); toast.success('Added!'); }}>
                      <ShoppingCart className="h-3 w-3" /> Add to Cart
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CustomerLayout>
  );
}
