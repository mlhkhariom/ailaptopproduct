import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, MessageCircle, Star, ArrowLeft, Minus, Plus, Play, Instagram, Youtube, Facebook, Heart, Share2, ZoomIn, ExternalLink, Copy, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import ReviewsSection from "@/components/ReviewsSection";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

const platformIcon: any = { instagram: Instagram, youtube: Youtube, facebook: Facebook };
const platformColor: any = { instagram: 'from-pink-500 to-purple-600', youtube: 'from-red-500 to-red-700', facebook: 'from-blue-500 to-blue-700' };

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, fetchProducts } = useProductStore();
  const [reels, setReels] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [copied, setCopied] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, hasItem } = useWishlistStore();

  useEffect(() => { if (products.length === 0) fetchProducts(); }, []);

  const product = products.find((p) => p.id === id || p.slug === id);

  useEffect(() => {
    if (product) {
      api.getReels({ product_id: product.id }).then(setReels).catch(() => {});
      // Recently viewed
      const stored = JSON.parse(localStorage.getItem("recently-viewed") || "[]") as string[];
      if (!stored.includes(product.id)) localStorage.setItem("recently-viewed", JSON.stringify([product.id, ...stored].slice(0, 8)));
    }
  }, [product?.id]);

  if (!product) return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button className="mt-4" onClick={() => navigate('/products')}>Go Back</Button>
      </div>
    </CustomerLayout>
  );

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const recentlyViewed = (JSON.parse(localStorage.getItem("recently-viewed") || "[]") as string[]).filter(rid => rid !== product.id).map(rid => products.find(p => p.id === rid)).filter(Boolean).slice(0, 4);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const wishlisted = hasItem(product.id);
  const allImages = [product.image];
  const pageUrl = `https://ailaptopwala.com/products/${product.slug || product.id}`;

  // Auto SEO
  const seoTitle = product.metaTitle || `${product.name} | Buy Online – AI Laptop Wala Indore`;
  const seoDesc = product.metaDescription || `Buy ${product.name} at ₹${product.price}. ${product.description?.slice(0, 120)}. Free delivery in Indore. AI Laptop Wala – Silver Mall, RNT Marg.`;
  const seoKeywords = product.focusKeywords?.join(', ') || `${product.name}, ${product.category}, buy laptop indore, refurbished laptop indore, AI Laptop Wala`;

  // Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "sku": product.sku,
    "brand": { "@type": "Brand", "name": "AI Laptop Wala" },
    "offers": {
      "@type": "Offer",
      "url": pageUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": "AI Laptop Wala" }
    },
    ...(product.rating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviews || 1,
        "bestRating": 5,
        "worstRating": 1
      }
    } : {}),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ailaptopwala.com" },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://ailaptopwala.com/products" },
        { "@type": "ListItem", "position": 3, "name": product.name }
      ]
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <CustomerLayout>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="INR" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={product.image} />
        {/* Schema.org */}
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

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
              <Button variant="outline" className="flex-1 gap-2" onClick={() => { toggleItem(product); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️"); }}>
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : ""}`} /> {wishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button variant="outline" className="gap-2" onClick={copyLink}>
                {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Copied!" : "Share"}
              </Button>
            </div>

            <a href={`https://wa.me/919893496163?text=Hi! I'd like to know more about ${encodeURIComponent(product.name)} (₹${product.price}) - ${pageUrl}`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5">
                <MessageCircle className="h-4 w-4" /> Ask AI Laptop Wala on WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Reels & Videos */}
        {reels.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" /> Videos & Reels
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {reels.map((reel) => {
                const Icon = platformIcon[reel.platform] || platformIcon.instagram;
                const gradient = platformColor[reel.platform] || platformColor.instagram;
                // YouTube embed
                const ytMatch = reel.video_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
                return (
                  <a key={reel.id} href={reel.video_url || '#'} target="_blank" rel="noreferrer" className="group block">
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-muted shadow hover:shadow-lg transition-shadow">
                      {ytMatch ? (
                        <img src={`https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      {/* Platform badge */}
                      <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white text-[10px] font-medium`}>
                        <Icon className="h-3 w-3" /> {reel.platform}
                      </div>
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      {/* Title + views */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-medium line-clamp-2">{reel.title}</p>
                        {reel.views && <p className="text-white/70 text-[10px] mt-0.5">👁 {reel.views}</p>}
                      </div>
                      <ExternalLink className="absolute top-2 right-2 h-3.5 w-3.5 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start flex-wrap h-auto">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 space-y-4">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            {product.benefits?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Key Features</h3>
                <ul className="space-y-1.5">
                  {product.benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.precautions && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                ⚠️ {product.precautions}
              </div>
            )}
          </TabsContent>
          <TabsContent value="specs" className="mt-4">
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                ['SKU', product.sku],
                ['Category', product.category],
                ['Stock', product.inStock ? `${product.stock} units` : 'Out of Stock'],
                ['Brand', 'AI Laptop Wala'],
                ['Warranty', '6 Months'],
                ['Condition', 'Certified Refurbished'],
              ].map(([k, v]) => v && (
                <div key={k} className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <ReviewsSection productId={product.id} rating={product.rating} reviewCount={product.reviews} />
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
        {recentlyViewed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewed.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ProductDetail;
