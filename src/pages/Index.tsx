import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Laptop, Shield, Wrench, Truck, CheckCircle, Phone, MessageCircle, Zap, ChevronRight, Users2, Trophy, Clock, MapPin, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import ProductCard from "@/components/ecommerce/ProductCard";
import BusinessDetails from "@/components/common/BusinessDetails";
import { lazy, Suspense } from "react";
const ReelsSection = lazy(() => import("@/components/ReelsSection"));
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";
import logo from "@/assets/logo.jpeg";
import refurbishedImg from "@/assets/refurbished-laptop.jpg";
import homeRepairImg from "@/assets/homeservies.jpeg";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const iconMap: Record<string, any> = { Laptop, Shield, Wrench, Truck, CheckCircle, Star };

// Recently Viewed section
const RecentlyViewedSection = ({ products }: { products: any[] }) => {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  useEffect(() => { setRecentIds(JSON.parse(localStorage.getItem('recently-viewed') || '[]')); }, []);
  const recentProducts = recentIds.map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, 4);
  if (recentProducts.length === 0) return null;
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-black mb-5">Recently <span className="gradient-text">Viewed</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {recentProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
};

// Deal countdown timer (resets daily at midnight)
const DealTimer = () => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-1">
      {[['h', time.h], ['m', time.m], ['s', time.s]].map(([l, v]) => (
        <div key={l as string} className="bg-red-600 text-white rounded-lg px-2 py-1 text-center min-w-[36px]">
          <span className="text-sm font-bold">{String(v).padStart(2, '0')}</span>
          <span className="text-[8px] block -mt-0.5">{l}</span>
        </div>
      ))}
    </div>
  );
};

const Index = () => {
  const { products, fetchProducts } = useProductStore();
  const siteSettings = useSiteSettings() as any;
  const [benefits, setBenefits] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetch('/api/cms/banners').then(r => r.json()).then((d: any) => {
      if (Array.isArray(d)) setBanners(d);
    }).catch(() => {});
    fetch('/api/categories').then(r => r.json()).then((d: any) => { if (Array.isArray(d)) setDbCategories(d); }).catch(() => {});
    api.getCMS('benefit').then((d: any) => {
      const list = Array.isArray(d) ? d : [];
      setBenefits(list.map((i: any) => {
        const c = typeof i.content === 'string' ? JSON.parse(i.content) : i.content;
        return { ...c, _id: i.id };
      }));
    }).catch(() => {});
    api.getCMS('testimonial').then((d: any) => {
      const list = Array.isArray(d) ? d : [];
      setTestimonials(list.map((i: any) => {
        const c = typeof i.content === 'string' ? JSON.parse(i.content) : i.content;
        return { ...c, _id: i.id };
      }));
    }).catch(() => {});
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrentBanner(b => (b + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <CustomerLayout>
      <SEOHead canonical="/" />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[85svh] md:min-h-[90svh] flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(30 40% 8%) 0%, hsl(32 60% 14%) 40%, hsl(35 50% 18%) 70%, hsl(30 40% 6%) 100%)" }}>
        {/* Glow blobs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[100px] pointer-events-none" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl pt-20 pb-12">
          {/* Logo */}
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full scale-[2]" />
            <img src={logo} alt="AI Laptop Wala" className="relative h-20 md:h-28 w-auto mx-auto drop-shadow-2xl rounded-xl" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-orange-200 border border-primary/30 bg-primary/15 backdrop-blur-md mb-6 shadow-lg shadow-primary/10">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>Open Now — Since {siteSettings.founded_year || '2011'}</span>
            <span className="mx-1 text-white/30">•</span>
            <span>Trusted by {siteSettings.stat_customers || '5000+'}</span>
          </div>

          {/* Heading */}
          <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] mb-4 tracking-tight">
            <span className="text-white">{siteSettings.hero_title || 'Your Trusted '}</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500">{siteSettings.hero_title2 || 'Laptop Partner'}</span>
            <br />
            <span className="text-white text-[1.5rem] sm:text-3xl md:text-4xl">{siteSettings.hero_subtitle || 'in Indore'}</span>
          </h1>

          <p className="text-white/60 text-sm md:text-base mb-8 max-w-xl mx-auto">
            {siteSettings.hero_description || 'Buy certified refurbished laptops, MacBooks & gaming laptops. Expert repair & home service across Indore.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link to="/products">
              <Button size="lg" className="gap-2 px-8 h-12 text-base font-bold shadow-lg shadow-primary/30 pulse-glow">
                <Laptop size={18} /> Shop Laptops <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base font-bold border-primary text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors">
                <Wrench size={18} /> Book Repair
              </Button>
            </Link>
            <a href={`https://wa.me/${siteSettings.whatsapp_number || "919893496163"}`} target="_blank" rel="noreferrer">
              <Button size="lg" variant="ghost" className="gap-2 px-6 h-12 text-[#25D366] hover:bg-[#25D366]/10 border border-[#25D366]/30">
                <MessageCircle size={18} /> WhatsApp
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[[siteSettings.stat_customers || "5000+","Happy Customers"],[siteSettings.stat_experience || "15+","Years Experience"],[siteSettings.stat_rating || "4.8","Google Rating"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-primary">{v}</p>
                <p className="text-[10px] md:text-xs text-white/50 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CMS BANNERS CAROUSEL (admin-controlled, below hero) ── */}
      {banners.length > 0 && (
        <section className="relative h-[280px] md:h-[360px] overflow-hidden bg-muted">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === currentBanner ? 1 : 0, zIndex: i === currentBanner ? 2 : 1 }}
            >
              {b.image && <img src={b.image} alt={b.title} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="relative z-10 container mx-auto h-full flex items-center px-4">
                <div className="max-w-lg text-white">
                  {b.title && <h2 className="text-2xl md:text-4xl font-serif font-bold mb-3">{b.title}</h2>}
                  {b.subtitle && <p className="text-sm md:text-base mb-5 opacity-90">{b.subtitle}</p>}
                  {b.button_text && b.link && <Link to={b.link}><Button size="lg" className="gap-2">{b.button_text} <ArrowRight className="h-4 w-4" /></Button></Link>}
                  {b.button_text && !b.link && <Button size="lg" className="gap-2">{b.button_text} <ArrowRight className="h-4 w-4" /></Button>}
                </div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`h-2 rounded-full transition-all ${i === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── BENEFITS ─────────────────────────────────────── */}
      {benefits.length > 0 && (
        <section className="py-8 bg-card border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {benefits.map((b) => {
                const Icon = iconMap[b.icon] || Laptop;
                return (
                  <div key={b.id || b.title} className="flex flex-col items-center text-center gap-2 p-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm">{b.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">{b.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── DEAL OF THE DAY ─────────────────────────────── */}
      {products.filter(p => p.badge === 'Deal' || p.original_price > p.price * 1.15).length > 0 && (
        <section className="py-10 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-red-500" />
                <div>
                  <h2 className="text-xl md:text-2xl font-black">Deal of the <span className="text-red-600">Day</span></h2>
                  <p className="text-xs text-muted-foreground">Limited time offers — grab before they're gone!</p>
                </div>
              </div>
              <DealTimer />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {products.filter(p => p.badge === 'Deal' || p.original_price > p.price * 1.15).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black">Featured <span className="gradient-text">Laptops</span></h2>
              <div className="section-divider mt-2 mx-0" />
            </div>
            <Link to="/products">
              <Button variant="outline" size="sm" className="gap-1.5">View All <ChevronRight size={14} /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────── */}
      {products.filter(p => (p.reviews || 0) > 0).length > 0 && (
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black">Best <span className="gradient-text">Sellers</span></h2>
                <p className="text-xs text-muted-foreground">Most popular products</p>
              </div>
              <Link to="/products?sort=popular"><Button variant="outline" size="sm">View All</Button></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {[...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ──────────────────────────────── */}
      {products.filter(p => p.created_at && (Date.now() - new Date(p.created_at).getTime()) < 14 * 24 * 3600 * 1000).length > 0 && (
        <section className="py-10 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black">New <span className="gradient-text">Arrivals</span></h2>
                <p className="text-xs text-muted-foreground">Added in last 14 days</p>
              </div>
              <Link to="/products?sort=newest"><Button variant="outline" size="sm">View All</Button></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {products.filter(p => p.created_at && (Date.now() - new Date(p.created_at).getTime()) < 14 * 24 * 3600 * 1000).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── HOME REPAIR BANNER ───────────────────────────── */}
      <section className="py-12 bg-muted/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              <img src={homeRepairImg} alt="Home Repair Service Indore" className="w-full h-64 md:h-80 object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                <Phone size={12} /> Home Service Available — All Over Indore
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Expert Repair <span className="gradient-text">at Your Doorstep</span></h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">Screen replacement, battery, keyboard, SSD/RAM upgrade, virus removal — all at your home or office in Indore. Free pickup available.</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {["Screen Replacement","Battery Replacement","SSD/RAM Upgrade","Virus Removal","OS Installation","Motherboard Repair"].map(s => (
                  <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle size={12} className="text-primary shrink-0" /> {s}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/services"><Button size="lg" className="gap-2"><Wrench size={16} /> Book Service</Button></Link>
                <a href={`https://wa.me/${siteSettings.whatsapp_number || "919893496163"}?text=Hi, I need laptop repair service`} target="_blank" rel="noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 border-green-500 text-green-600 hover:bg-green-50"><MessageCircle size={16} /> WhatsApp</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MORE PRODUCTS ────────────────────────────────── */}
      {products.length > 4 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black">More <span className="gradient-text">Laptops</span></h2>
                <div className="section-divider mt-2 mx-0" />
              </div>
              <Link to="/products"><Button variant="outline" size="sm" className="gap-1.5">View All <ChevronRight size={14} /></Button></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {products.slice(4, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── RECENTLY VIEWED ──────────────────────────────── */}
      <RecentlyViewedSection products={products} />

      {/* ── STATS / WHY CHOOSE US ─────────────────────────── */}
      <section className="py-12 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black">Why Choose <span className="gradient-text">AI Laptop Wala</span></h2>
            <p className="text-sm text-muted-foreground mt-2">15+ years of trust, thousands of happy customers</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: '5000+', label: 'Happy Customers', Icon: Users2, color: 'from-blue-500 to-blue-600' },
              { num: '15+', label: 'Years Experience', Icon: Trophy, color: 'from-yellow-500 to-orange-500' },
              { num: '24/7', label: 'Home Service', Icon: Clock, color: 'from-green-500 to-emerald-600' },
              { num: '4.8★', label: 'Google Rating', Icon: Star, color: 'from-purple-500 to-pink-500' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-card rounded-2xl p-5 text-center shadow-sm card-lift border group">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-3 bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <s.Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-3xl md:text-4xl font-black gradient-text">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { Icon: Shield, title: 'Certified Refurbished', desc: '6-month warranty on all products', color: 'text-green-600 bg-green-100' },
              { Icon: MapPin, title: 'Physical Store', desc: 'Visit us at Silver Mall, Indore', color: 'text-blue-600 bg-blue-100' },
              { Icon: Headphones, title: 'WhatsApp Support', desc: 'Quick reply within 2 hours', color: 'text-green-600 bg-green-100' },
            ].map(f => (
              <div key={f.title} className="bg-white dark:bg-card rounded-xl p-4 border card-lift flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
                  <f.Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-12 bg-muted/40">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-black text-center mb-2">Happy <span className="gradient-text">Customers</span></h2>
            <p className="text-muted-foreground text-center text-sm mb-3">5000+ satisfied customers trust AI Laptop Wala</p>
            <div className="section-divider mb-8" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.slice(0, 6).map((t) => (
                <Card key={t._id || t.name} className="border-border/50 card-lift">
                  <CardContent className="p-5">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{t.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INSTAGRAM REELS ──────────────────────────────── */}
      <Suspense fallback={<div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <ReelsSection />
      </Suspense>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="py-14 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-2">Shop by <span className="gradient-text">Category</span></h2>
          <div className="section-divider mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(dbCategories.length > 0 ? dbCategories.map(c => ({ name: c.name, slug: c.name, icon: c.image || '', desc: c.description || '' })) : [
              { name: 'Laptops', slug: 'Laptops', icon: '', desc: 'Dell, HP, Lenovo refurbished' },
              { name: 'MacBooks', slug: 'MacBooks', icon: '', desc: 'Open-box Apple MacBooks' },
              { name: 'Gaming', slug: 'Gaming', icon: '', desc: 'ROG, Legion, Omen' },
              { name: 'Desktops', slug: 'Desktops', icon: '', desc: 'HP, Dell, Lenovo desktops' },
            ]).slice(0, 8).map(cat => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="group">
                <div className="bg-card border rounded-xl p-5 text-center hover:border-primary hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 text-2xl">{cat.icon}</div>
                  <h3 className="font-bold text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-2">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <div className="section-divider mb-8" />
          <div className="space-y-3">
            {[
              { q: 'Kya refurbished laptops reliable hote hain?', a: 'Haan! AI Laptop Wala ke sab laptops certified refurbished hain — thoroughly tested, cleaned aur 6 month warranty ke saath.' },
              { q: 'Kya home delivery available hai Indore mein?', a: 'Haan, hum poore Indore mein home delivery karte hain. WhatsApp karein: +91 98934 96163' },
              { q: 'EMI available hai kya?', a: 'Haan! Bajaj Finance EMI available hai. Minimum age 25 years, Indore ke 60km radius mein.' },
              { q: 'Laptop repair kitne time mein hoti hai?', a: 'Most repairs same day ya 24 hours mein complete hoti hain. Screen replacement, battery, RAM/SSD upgrade available.' },
            ].map((faq, i) => (
              <details key={i} className="border rounded-lg p-4 group">
                <summary className="font-semibold text-sm cursor-pointer list-none flex justify-between items-center">
                  {faq.q} <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-2">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/faq"><Button variant="outline" size="sm">View All FAQs</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-14 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-black mb-2">Need Help Choosing a Laptop?</h2>
          <p className="text-muted-foreground text-sm mb-6">Chat with our expert on WhatsApp — free consultation, instant reply!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={`https://wa.me/${siteSettings.whatsapp_number || "919893496163"}?text=Hi, I need help choosing a laptop`} target="_blank" rel="noreferrer">
              <Button size="lg" className="gap-2 bg-[#25D366] hover:bg-[#20b858] text-white px-8">
                <MessageCircle size={18} /> Chat on WhatsApp
              </Button>
            </a>
            <a href="tel:+919893496163">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <Phone size={18} /> Call Now
              </Button>
            </a>
          </div>
        </div>
      </section>

      <BusinessDetails />
    </CustomerLayout>
  );
};

export default Index;
