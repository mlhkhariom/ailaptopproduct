import { useParams, Link } from "react-router-dom";
import { ShoppingCart, MessageCircle, Star, ArrowLeft, Minus, Plus, Play, Instagram, Youtube, Facebook, Heart, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

const platformIcon: any = { instagram: Instagram, youtube: Youtube, facebook: Facebook };

const mockReviews = [
  { id: 1, name: "Priya S.", rating: 5, text: "Amazing product! Saw results in just 2 weeks.", date: "2024-01-15" },
  { id: 2, name: "Rahul V.", rating: 4, text: "Good quality, authentic Ayurvedic product.", date: "2024-01-10" },
  { id: 3, name: "Anita D.", rating: 5, text: "Been using this for a month now, excellent results!", date: "2024-01-08" },
];

const ProductDetail = () => {
  const { id } = useParams();
  const { products, fetchProducts } = useProductStore();
  const [reels, setReels] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [activeReel, setActiveReel] = useState(0);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, []);

  const product = products.find((p) => p.id === id || p.slug === id);

  useEffect(() => {
    if (product) {
      api.getReels({ product_id: product.id }).then(setReels).catch(() => {});
    }
  }, [product?.id]);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  // Recently viewed
  const [recentlyViewed] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("recently-viewed") || "[]") as string[];
    if (id && !stored.includes(id)) {
      const updated = [id, ...stored].slice(0, 8);
      localStorage.setItem("recently-viewed", JSON.stringify(updated));
    }
    return stored.filter(rid => rid !== id);
  });
  const recentProducts = recentlyViewed.map(rid => products.find(p => p.id === rid)).filter(Boolean).slice(0, 4);

  if (!product) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold">Product not found</h1>
          <Link to="/products"><Button className="mt-4">Go Back</Button></Link>
        </div>
      </CustomerLayout>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const wishlisted = isInWishlist(product.id);

  const allImages = [product.image];

  const ratingBreakdown = [
    { stars: 5, percent: 68 },
    { stars: 4, percent: 20 },
    { stars: 3, percent: 8 },
    { stars: 2, percent: 3 },
    { stars: 1, percent: 1 },
  ];

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div
              className="relative rounded-2xl overflow-hidden bg-muted aspect-square mb-3 cursor-crosshair group"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleZoomMove}
            >
              <img src={allImages[mainImage]} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground text-sm">{discount}% OFF</Badge>}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5 text-foreground/70" />
              </div>
              {/* Zoom lens */}
              {showZoom && (
                <div
                  className="absolute top-0 right-0 w-48 h-48 border-2 border-primary rounded-xl overflow-hidden shadow-xl pointer-events-none z-20 hidden md:block"
                  style={{ backgroundImage: `url(${allImages[mainImage]})`, backgroundSize: "400%", backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%` }}
                />
              )}
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {allImages.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${mainImage === i ? "border-primary ring-1 ring-primary" : "border-transparent hover:border-primary/30"}`}
                  onClick={() => setMainImage(i)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
            <h1 className="text-3xl font-serif font-bold mb-1">{product.name}</h1>
            {product.nameHi && <p className="text-lg text-muted-foreground font-serif mb-3">{product.nameHi}</p>}

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>}
              {discount > 0 && <Badge variant="secondary" className="text-xs">Save {discount}%</Badge>}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border rounded-lg">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              {product.inStock ? (
                <Badge variant="outline" className="text-primary border-primary/30">✓ In Stock ({product.stock})</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <Button size="lg" className="flex-1 gap-2" disabled={!product.inStock} onClick={() => { addItem(product, qty); toast.success("Added to cart!"); }}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
              <Button size="lg" variant="secondary" className="flex-1" onClick={() => { addItem(product, qty); toast.success("Redirecting to checkout..."); }}>Buy Now</Button>
            </div>

            <div className="flex gap-2 mb-6">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => { toggleItem(product.id); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️"); }}>
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : ""}`} /> {wishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>

            <a href={`https://wa.me/919876543210?text=Hi! I'd like to know more about ${product.name}`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5">
                <MessageCircle className="h-4 w-4" /> Ask Dr. Prachi on WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Reels Section */}
        {reels.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4">Product Reels & Videos</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {reels.map((reel) => {
                const Icon = platformIcon[reel.platform] || platformIcon.instagram;
                return (
                  <Card key={reel.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all">
                    <a href={reel.video_url || '#'} target="_blank" rel="noreferrer">
                    <div className="relative aspect-[9/16] bg-muted">
                      <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent flex flex-col justify-end p-4">
                        <div className="flex items-center justify-center mb-auto mt-auto">
                          <div className="h-14 w-14 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-7 w-7 text-primary-foreground fill-primary-foreground ml-1" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-primary-foreground" />
                          <span className="text-primary-foreground text-xs capitalize">{reel.platform}</span>
                        </div>
                        <p className="text-primary-foreground text-sm font-medium line-clamp-2">{reel.title}</p>
                        <p className="text-primary-foreground/70 text-xs mt-1">👁 {reel.views} views</p>
                      </div>
                    </div>
                    </a>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Tabs */}
        <Tabs defaultValue="ingredients" className="mb-12">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="usage">How to Use</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients" className="mt-4">
            <ul className="space-y-2">
              {product.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{ing}</li>
              ))}
            </ul>
            {product.precautions && (
              <div className="mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-1">⚠️ Precautions</p>
                <p className="text-xs text-muted-foreground">{product.precautions}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="benefits" className="mt-4">
            <ul className="space-y-2">
              {product.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{b}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="usage" className="mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{product.usage}</p>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{product.rating}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{product.reviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {ratingBreakdown.map((r) => (
                      <div key={r.stars} className="flex items-center gap-2">
                        <span className="text-xs w-3">{r.stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Progress value={r.percent} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{r.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{review.name[0]}</div>
                        <div>
                          <p className="text-sm font-medium">{review.name}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Sticky Mobile Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t p-3 flex gap-2 z-40">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-bold text-lg">₹{product.price * qty}</p>
          </div>
          <Button className="gap-2 h-11 flex-1" disabled={!product.inStock} onClick={() => { addItem(product, qty); toast.success("Added to cart!"); }}>
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </Button>
        </div>

        {/* Recently Viewed */}
        {recentProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recentProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ProductDetail;
