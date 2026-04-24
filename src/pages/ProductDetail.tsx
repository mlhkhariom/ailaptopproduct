import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, ShieldCheck, Star, Heart, Share2, CheckCheck, ShoppingCart, Clock, Wrench, Phone, CheckCircle, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import ReviewsSection from "@/components/ReviewsSection";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (products.length === 0) fetchProducts(); }, []);

  const product = products.find((p) => p.id === id || p.slug === id);

  useEffect(() => {
    if (product) {
      const stored = JSON.parse(localStorage.getItem("recently-viewed") || "[]") as string[];
      if (!stored.includes(product.id)) localStorage.setItem("recently-viewed", JSON.stringify([product.id, ...stored].slice(0, 8)));
    }
  }, [product?.id]);

  if (!product) return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Button onClick={() => navigate('/products')}>← Back to Products</Button>
      </div>
    </CustomerLayout>
  );

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const recentlyViewed = (JSON.parse(localStorage.getItem("recently-viewed") || "[]") as string[]).filter(rid => rid !== product.id).map(rid => products.find(p => p.id === rid)).filter(Boolean).slice(0, 4);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const wishlisted = hasItem(product.id);
  const pageUrl = `https://ailaptopwala.com/products/${product.slug || product.id}`;

  const seoTitle = product.metaTitle || `${product.name} | Buy in Indore – AI Laptop Wala`;
  const seoDesc = product.metaDescription || `Buy ${product.name} at ₹${product.price.toLocaleString()} in Indore. ${product.description?.slice(0, 100)}. 6 month warranty. AI Laptop Wala — Silver Mall.`;
  const productImage = product.image?.startsWith('http') ? product.image : `https://ailaptopwala.com${product.image}`;

  const productSchema = {
    "@context": "https://schema.org", "@type": "Product",
    "name": product.name,
    "image": [productImage],
    "description": product.description,
    "sku": product.sku,
    "mpn": product.sku,
    "brand": { "@type": "Brand", "name": product.name.split(' ')[0] || "AI Laptop Wala" },
    "offers": {
      "@type": "Offer",
      "url": pageUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/RefurbishedCondition",
      "seller": { "@type": "Organization", "name": "AI Laptop Wala", "url": "https://ailaptopwala.com" },
      "shippingDetails": { "@type": "OfferShippingDetails", "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "INR" }, "deliveryTime": { "@type": "ShippingDeliveryTime", "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" }, "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY" } } },
      "hasMerchantReturnPolicy": { "@type": "MerchantReturnPolicy", "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow", "merchantReturnDays": 7, "returnMethod": "https://schema.org/ReturnInStore" }
    },
    ...(product.rating ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": product.rating, "reviewCount": product.reviews || 1, "bestRating": 5, "worstRating": 1 } } : {})
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `What is the price of ${product.name}?`, "acceptedAnswer": { "@type": "Answer", "text": `${product.name} is available at ₹${product.price?.toLocaleString('en-IN')} at AI Laptop Wala, Indore.${product.original_price ? ` Original MRP was ₹${product.original_price?.toLocaleString('en-IN')}.` : ''}` } },
      { "@type": "Question", "name": `Is ${product.name} available in Indore?`, "acceptedAnswer": { "@type": "Answer", "text": `Yes, ${product.name} is ${product.inStock ? 'available in stock' : 'currently out of stock'} at AI Laptop Wala, Silver Mall, RNT Marg, Indore. Call +91 98934 96163 for availability.` } },
      { "@type": "Question", "name": `What warranty comes with ${product.name}?`, "acceptedAnswer": { "@type": "Answer", "text": `${product.name} comes with 6 months warranty from AI Laptop Wala. We also offer extended warranty options.` } },
      { "@type": "Question", "name": `Can I get home delivery for ${product.name} in Indore?`, "acceptedAnswer": { "@type": "Answer", "text": `Yes, AI Laptop Wala offers home delivery across Indore for ${product.name}. Contact us at +91 98934 96163 or WhatsApp for delivery details.` } },
    ]
  };

  const copyLink = () => { navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Link copied!"); };

  const benefits = Array.isArray(product.benefits) ? product.benefits : (typeof product.benefits === 'string' ? JSON.parse(product.benefits || '[]') : []);

  return (
    <CustomerLayout>
      <SEOHead title={seoTitle} description={seoDesc} canonical={`/products/${product.slug || product.id}`} image={productImage} type="product"
        breadcrumbs={[{ name: "Products", url: "/products" }, { name: product.category, url: `/products?category=${product.category}` }, { name: product.name }]}
        jsonLd={[productSchema, faqSchema]} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary">Home</Link><span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link><span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary">{product.category}</Link><span>/</span>
          <span className="text-foreground font-medium truncate max-w-[180px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* ── IMAGE ─────────────────────────────────────── */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-muted/30 border aspect-square group">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {discount > 0 && <Badge className="absolute top-4 left-4 bg-primary text-white text-sm px-3 py-1">{discount}% OFF</Badge>}
              {product.badge && <Badge className="absolute top-4 right-4 bg-secondary text-white text-xs">{product.badge}</Badge>}
              {product.stock <= 3 && product.inStock && <Badge className="absolute bottom-4 left-4 bg-destructive text-white text-xs">Only {product.stock} left!</Badge>}
            </div>
          </div>

          {/* ── DETAILS ───────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Brand + Category */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{product.category}</span>
              {product.badge && <Badge variant="outline" className="text-[10px]">{product.badge}</Badge>}
            </div>

            <h1 className="text-2xl md:text-3xl font-black mb-3 leading-tight">{product.name}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />)}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-4xl font-black text-primary">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
              {discount > 0 && <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">Save {discount}%</span>}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-destructive'}`} />
              <span className="text-sm font-medium">{product.inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'}</span>
            </div>

            {/* Key specs from benefits */}
            {benefits.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {benefits.slice(0, 6).map((b: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-medium">{b}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border rounded-xl overflow-hidden">
                <button className="px-3 py-2.5 hover:bg-muted transition-colors text-lg font-bold" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="px-4 py-2.5 font-bold min-w-[3rem] text-center">{qty}</span>
                <button className="px-3 py-2.5 hover:bg-muted transition-colors text-lg font-bold" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <Button size="lg" className="flex-1 gap-2 h-11 font-bold" disabled={!product.inStock}
                onClick={() => { addItem(product, qty); toast.success("Added to cart!"); }}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>

            {/* WhatsApp Buy */}
            <a href={`https://wa.me/919893496163?text=Hi, I'm interested in ${encodeURIComponent(product.name)} (₹${product.price.toLocaleString('en-IN')}) - ${pageUrl}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] py-3 text-base font-bold text-white hover:bg-[#20b858] transition-colors mb-4">
              <MessageCircle className="h-5 w-5" /> Buy on WhatsApp
            </a>

            {/* Secondary actions */}
            <div className="flex gap-2 mb-5">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => { toggleItem(product); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️"); }}>
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-destructive text-destructive' : ''}`} />
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={copyLink}>
                {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Share'}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-muted/30 rounded-xl border">
              {[
                { icon: ShieldCheck, text: "6 Month Warranty" },
                { icon: Clock, text: "Same Day Delivery" },
                { icon: Wrench, text: "Free Home Service" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ──────────────────────────────────────────── */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4 space-y-4">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            {benefits.length > 0 && (
              <div>
                <h3 className="font-bold mb-3">Key Features</h3>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                ['SKU', product.sku],
                ['Category', product.category],
                ['Stock', product.inStock ? `${product.stock} units` : 'Out of Stock'],
                ['Condition', 'Certified Refurbished'],
                ['Warranty', '6 Months'],
                ['Brand', 'AI Laptop Wala'],
              ].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 px-3 rounded-lg bg-muted/30 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <ReviewsSection productId={product.id} rating={product.rating} reviewCount={product.reviews || 0} />
          </TabsContent>
        </Tabs>

        {/* ── RELATED ───────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-black mb-5">Related <span className="gradient-text">Products</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* ── RECENTLY VIEWED ───────────────────────────────── */}
        {recentlyViewed.length > 0 && (
          <div>
            <h2 className="text-xl font-black mb-5">Recently <span className="gradient-text">Viewed</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {recentlyViewed.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t p-3 flex gap-2 z-40">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-black text-lg text-primary">₹{(product.price * qty).toLocaleString('en-IN')}</p>
        </div>
        <a href={`https://wa.me/919893496163?text=Hi, I want to buy ${encodeURIComponent(product.name)}`} target="_blank" rel="noreferrer">
          <Button className="gap-1.5 bg-[#25D366] hover:bg-[#20b858] h-11"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
        </a>
        <Button className="gap-1.5 h-11" disabled={!product.inStock} onClick={() => { addItem(product, qty); toast.success("Added!"); }}>
          <ShoppingCart className="h-4 w-4" /> Add
        </Button>
      </div>
    </CustomerLayout>
  );
};

export default ProductDetail;
