import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, ShieldCheck, Star, Heart, Share2, CheckCheck, ShoppingCart, Clock, Wrench, Phone, CheckCircle, ZoomIn, Scale, Zap, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import ReviewsSection from "@/components/ReviewsSection";
import ProductCard from "@/components/ProductCard";
import ProductReels from "@/components/ProductReels";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { trackProductView } from "@/components/SiteWidgets";
import { toast } from "sonner";
import { api } from "@/lib/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  const { product_zoom, emi_calculator, enable_reels, compare_enabled, recently_viewed } = useSiteSettings();
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Fetch full product data (with images + variants)
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`).then(r => r.json()).then(data => {
      if (data.error) { setLoading(false); return; }
      setProductData(data);
      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
        const attrs = typeof data.variants[0].attributes === 'string' ? JSON.parse(data.variants[0].attributes) : data.variants[0].attributes;
        setSelectedOptions(attrs || {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
    if (products.length === 0) fetchProducts();
    fetch('/api/coupons/active').then(r => r.json()).then(c => { if (Array.isArray(c)) setAvailableCoupons(c); }).catch(() => {});
  }, [id]);

  const product = productData || products.find((p) => p.id === id || p.slug === id);

  useEffect(() => {
    if (product) {
      const stored = JSON.parse(localStorage.getItem("recently-viewed") || "[]") as string[];
      if (!stored.includes(product.id)) localStorage.setItem("recently-viewed", JSON.stringify([product.id, ...stored].slice(0, 8)));
      if (recently_viewed) trackProductView(product);
    }
  }, [product?.id, recently_viewed]);

  if (loading) return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    </CustomerLayout>
  );

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

  // Images — from product_images or fallback to single image
  const allImages = product.images?.length > 0 ? product.images : (product.image ? [{ id: 'main', url: product.image, alt: product.name }] : []);

  // Variant options
  const variantOptions = product.variant_options || [];
  const variants = product.variants || [];

  // Active price (variant or base)
  const activePrice = selectedVariant?.price || product.price;
  const activeOriginalPrice = selectedVariant?.original_price || product.originalPrice || product.original_price;
  const activeStock = selectedVariant?.stock ?? product.stock;
  const activeInStock = selectedVariant ? selectedVariant.in_stock : product.inStock;

  // Select variant based on chosen options
  const selectOption = (optName: string, optValue: string) => {
    const newOptions = { ...selectedOptions, [optName]: optValue };
    setSelectedOptions(newOptions);
    // Find matching variant
    const match = variants.find((v: any) => {
      const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
      return Object.entries(newOptions).every(([k, val]) => attrs[k] === val);
    });
    if (match) setSelectedVariant(match);
  };

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
          {/* ── IMAGE GALLERY ─────────────────────────────── */}
          <div>
            {/* Main Image */}
            <div
              className="relative rounded-2xl overflow-hidden bg-muted/30 border aspect-square group"
              onMouseEnter={() => product_zoom && setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={(e) => {
                if (!product_zoom) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
              }}
              style={product_zoom && zoomActive ? { cursor: 'zoom-in' } : {}}
            >
              <img
                src={allImages[mainImage]?.url || product.image}
                alt={allImages[mainImage]?.alt || product.name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={product_zoom && zoomActive ? { transform: `scale(2.2)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              />
              {product_zoom && !zoomActive && (
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                  <ZoomIn className="h-3 w-3" /> Hover to zoom
                </div>
              )}
              {discount > 0 && <Badge className="absolute top-4 left-4 bg-primary text-white text-sm px-3 py-1">{discount}% OFF</Badge>}
              {product.badge && <Badge className="absolute top-4 right-4 bg-secondary text-white text-xs">{product.badge}</Badge>}
              {product.stock <= 3 && product.inStock && <Badge className="absolute bottom-4 left-4 bg-destructive text-white text-xs">Only {product.stock} left!</Badge>}
              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white" onClick={() => setMainImage(i => i > 0 ? i - 1 : allImages.length - 1)}><ChevronLeft className="h-4 w-4" /></button>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white" onClick={() => setMainImage(i => i < allImages.length - 1 ? i + 1 : 0)}><ChevronRight className="h-4 w-4" /></button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {allImages.map((img: any, i: number) => (
                  <button key={img.id || i} onClick={() => setMainImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${i === mainImage ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'}`}>
                    <img src={img.url} alt={img.alt || `${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {enable_reels && <ProductReels productId={product.id} />}
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
              <span className={`w-2.5 h-2.5 rounded-full ${activeInStock ? 'bg-green-500' : 'bg-destructive'}`} />
              <span className="text-sm font-medium">{activeInStock ? `In Stock (${activeStock} units)` : 'Out of Stock'}</span>
            </div>

            {/* ── VARIANT SELECTOR ─────────────────────────── */}
            {variantOptions.length > 0 && (
              <div className="space-y-4 mb-5 p-4 rounded-xl border bg-muted/20">
                {variantOptions.map((opt: any) => {
                  const values = typeof opt.option_values === 'string' ? JSON.parse(opt.option_values) : opt.option_values;
                  return (
                    <div key={opt.id}>
                      <p className="text-sm font-semibold mb-2">{opt.option_name}: <span className="text-primary">{selectedOptions[opt.option_name] || '—'}</span></p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((val: string) => (
                          <button key={val} onClick={() => selectOption(opt.option_name, val)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedOptions[opt.option_name] === val ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'hover:border-primary/50 bg-card'}`}>
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {selectedVariant && (
                  <div className="flex items-baseline gap-2 pt-2 border-t">
                    <span className="text-2xl font-black text-primary">₹{activePrice.toLocaleString('en-IN')}</span>
                    {activeOriginalPrice && activeOriginalPrice > activePrice && (
                      <span className="text-sm text-muted-foreground line-through">₹{activeOriginalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                )}
              </div>
            )}

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

            {/* EMI Calculator (feature toggle) */}
            {emi_calculator && product.price >= 3000 && (
              <div className="mb-4 p-3 rounded-xl border-2 border-primary/20 bg-primary/5">
                <p className="text-xs font-semibold text-primary mb-2">💳 EMI Options (No Cost EMI available)</p>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 6, 12].map(months => (
                    <div key={months} className="text-center p-2 rounded-lg bg-card border">
                      <p className="text-[10px] text-muted-foreground">{months} months</p>
                      <p className="text-sm font-bold">₹{Math.round(product.price / months).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] text-muted-foreground">/month</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Available on Visa, MasterCard & RuPay credit cards</p>
              </div>
            )}

            {/* Available Coupons */}
            {availableCoupons.length > 0 && (
              <div className="mb-4 p-3 rounded-xl border bg-green-50/50">
                <p className="text-xs font-semibold text-green-700 mb-2">🎟️ Available Offers</p>
                <div className="space-y-1.5">
                  {availableCoupons.slice(0, 3).map((c: any) => (
                    <div key={c.code} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                        {c.min_order ? ` on orders above ₹${c.min_order}` : ''}
                      </span>
                      <button className="font-bold text-primary border border-dashed border-primary px-2 py-0.5 rounded"
                        onClick={() => { navigator.clipboard.writeText(c.code); toast.success(`Coupon ${c.code} copied!`); }}>
                        {c.code}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add to Cart + Buy Now */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center border rounded-xl overflow-hidden">
                <button className="px-3 py-2.5 hover:bg-muted transition-colors text-lg font-bold" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="px-4 py-2.5 font-bold min-w-[3rem] text-center">{qty}</span>
                <button className="px-3 py-2.5 hover:bg-muted transition-colors text-lg font-bold" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <Button size="lg" className="flex-1 gap-2 h-11 font-bold" disabled={!activeInStock}
                onClick={() => { addItem({ ...product, price: activePrice, variant: selectedVariant?.name }, qty); toast.success("Added to cart!"); }}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>

            {/* Buy Now */}
            <Button size="lg" variant="secondary" className="w-full gap-2 h-11 font-bold mb-4" disabled={!activeInStock}
              onClick={() => { addItem({ ...product, price: activePrice, variant: selectedVariant?.name }, qty); navigate('/checkout'); }}>
              <Zap className="h-4 w-4" /> Buy Now
            </Button>

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
              {compare_enabled && (
                <Button variant="outline" className="gap-2" onClick={() => {
                  const comp = JSON.parse(localStorage.getItem('compare') || '[]');
                  if (comp.length >= 4) { toast.error('Can compare max 4 products'); return; }
                  if (comp.find((p: any) => p.id === product.id)) { toast('Already in compare'); return; }
                  comp.push({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug });
                  localStorage.setItem('compare', JSON.stringify(comp));
                  toast.success(`Added to compare (${comp.length}/4)`);
                }}>
                  <Scale className="h-4 w-4" /> Compare
                </Button>
              )}
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
