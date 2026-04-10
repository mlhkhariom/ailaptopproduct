import { Link } from "react-router-dom";
import { Star, ShoppingCart, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/mockData";

const ProductCard = ({ product }: { product: Product }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const hasReels = product.reels && product.reels.length > 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      <Link to={`/products/${product.id}`}>
        <div className="relative overflow-hidden aspect-square bg-muted">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {discount > 0 && <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{discount}% OFF</Badge>}
          {hasReels && (
            <div className="absolute top-3 right-3 bg-foreground/60 text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center">
              <Play className="h-3.5 w-3.5 fill-primary-foreground ml-0.5" />
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm leading-tight mb-0.5 hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          {product.nameHi && <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{product.nameHi}</p>}
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary hover:text-primary-foreground" disabled={!product.inStock}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
        {hasReels && <p className="text-[10px] text-primary mt-1.5">📹 {product.reels.length} Reels Available</p>}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
