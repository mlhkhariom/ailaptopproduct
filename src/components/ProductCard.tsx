import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: any }) => {
  const { show_reviews, show_stock_count, show_hindi_names } = useSiteSettings();
  const origPrice = product.original_price || product.originalPrice;
  const inStock = product.in_stock ?? product.inStock ?? true;
  const nameHi = product.name_hi || product.nameHi;
  const discount = origPrice ? Math.round(((origPrice - product.price) / origPrice) * 100) : 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      <Link to={`/products/${product.slug || product.id}`}>
        <div className="relative overflow-hidden aspect-square bg-muted">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {discount > 0 && <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{discount}% OFF</Badge>}
          {isLowStock && show_stock_count && <Badge variant="destructive" className="absolute top-3 left-3 text-[9px]" style={discount > 0 ? { top: '2.5rem' } : {}}>Only {product.stock} left!</Badge>}
          {!inStock && (
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <Link to={`/products/${product.slug || product.id}`}>
          <h3 className="font-semibold text-sm leading-tight mb-0.5 hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          {nameHi && show_hindi_names && <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{nameHi}</p>}
        </Link>
        {show_reviews && (
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">₹{product.price}</span>
            {origPrice && <span className="text-xs text-muted-foreground line-through">₹{origPrice}</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8"
              onClick={(e) => { e.preventDefault(); toggleItem(product.id); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}>
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary hover:text-primary-foreground"
              disabled={!inStock}
              onClick={(e) => { e.preventDefault(); addItem(product); toast.success("Added to cart!"); }}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
