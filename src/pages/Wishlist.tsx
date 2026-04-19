import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const moveToCart = (item: any) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image, slug: item.slug });
    removeItem(item.id);
    toast.success(`${item.name} moved to cart`);
  };

  return (
    <CustomerLayout>
      <SEOHead title="My Wishlist — AI Laptop Wala" canonical="/wishlist" noindex={true} />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <span className="text-muted-foreground text-sm">({items.length} items)</span>
          </div>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={clearWishlist}>
              <Trash2 className="h-4 w-4" /> Clear All
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
            <Button asChild><Link to="/products">Browse Laptops</Link></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="relative group">
                <ProductCard product={item} />
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" className="h-8 w-8 bg-primary shadow" onClick={() => moveToCart(item)}>
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 shadow" onClick={() => { removeItem(item.id); toast.success('Removed from wishlist'); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default Wishlist;
