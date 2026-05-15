import { Eye, ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  product: any;
  open: boolean;
  onClose: () => void;
}

export default function QuickView({ product, open, onClose }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  if (!product) return null;

  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
  const wishlisted = hasItem(product.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-muted aspect-square">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {discount > 0 && <Badge className="absolute top-3 left-3 bg-primary text-white">{discount}% OFF</Badge>}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
            <h2 className="text-xl font-black mb-2 leading-tight">{product.name}</h2>

            {product.rating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className={`h-3.5 w-3.5 ${i <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />)}
                <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
              </div>
            )}

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-primary">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.original_price && <span className="text-sm text-muted-foreground line-through">₹{product.original_price?.toLocaleString('en-IN')}</span>}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{product.in_stock ? `In Stock (${product.stock})` : 'Out of Stock'}</span>
            </div>

            <div className="mt-auto space-y-2">
              <Button className="w-full gap-2" disabled={!product.in_stock} onClick={() => { addItem(product); toast.success('Added to cart!'); onClose(); }}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1" onClick={() => { toggleItem(product); toast(wishlisted ? 'Removed' : 'Added to wishlist'); }}>
                  <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} /> {wishlisted ? 'Wishlisted' : 'Wishlist'}
                </Button>
                <Link to={`/products/${product.slug || product.id}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-1" onClick={onClose}><Eye className="h-4 w-4" /> Full Details</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
