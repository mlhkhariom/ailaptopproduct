import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Laptop, Shield, Wrench, Truck, CheckCircle, Phone, MessageCircle, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import BusinessDetails from "@/components/BusinessDetails";
import ReelsSection from "@/components/ReelsSection";
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";
import logo from "@/assets/logo.jpeg";
import refurbishedImg from "@/assets/refurbished-laptop.jpg";
import homeRepairImg from "@/assets/homeservies.jpeg";

const iconMap: Record<string, any> = { Laptop, Shield, Wrench, Truck, CheckCircle, Star };

const Index = () => {
  const { products, fetchProducts } = useProductStore();
  const [benefits, setBenefits] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    api.getCMS('benefit').then(d => setBenefits(d.map((i: any) => ({ ...i.content, _id: i.id })))).catch(() => {});
    api.getCMS('testimonial').then(d => setTestimonials(d.map((i: any) => ({ ...i.content, _id: i.id })))).catch(() => {});
  }, []);

  return (
    <CustomerLayout>
      <SEOHead canonical="/" jsonLd={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://ailaptopwala.com/#business",
        "name": "AI Laptop Wala",
        "alternateName": "Asati Infotech",
        "description": "Indore's most trusted laptop store since 2011. Certified refurbished laptops, MacBooks, gaming laptops. Expert repair at Silver Mall, RNT Marg.",
        "url": "https://ailaptopwala.com",
        "telephone": "+919893496163",
        "email": "ailaptopwala@gmail.com",
        "foundingDate": "2011",
        "priceRange": "₹₹",
        "image": "https://ailaptopwala.com/logo.jpeg",
        "logo": "https://ailaptopwala.com/logo.jpeg",
        "address": { "@type": "PostalAddress", "streetAddress": "LB-21, Block-B, Silver Mall, RNT Marg", "addressLocality": "Indore", "addressRegion": "Madhya Pradesh", "postalCode": "452001", "addressCountry": "IN" },
        "geo": { "@type": "GeoCoordinates", "latitude": 22.7166372, "longitude": 75.8737741 },
        "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "11:00", "closes": "21:00" }],
        "sameAs": ["https://www.instagram.com/ailaptopwala", "https://www.facebook.com/profile.php?id=61563386652422", "https://www.youtube.com/@AiLaptopwalaindore"],
        "hasMap": "https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9",
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "500", "bestRating": "5" }
      }} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[90svh] flex items-center justify-center overflow-hidden"
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
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-orange-300 border border-primary/25 bg-primary/10 backdrop-blur-sm mb-6">
            <Zap size={12} className="text-yellow-400" /> Powered by Asati Infotech — Since 2011
          </div>

          {/* Heading */}
          <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] mb-4 tracking-tight">
            <span className="text-white">Your Trusted </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500">Laptop Partner</span>
            <br />
            <span className="text-white text-[1.5rem] sm:text-3xl md:text-4xl">in Indore</span>
          </h1>

          <p className="text-white/60 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Buy certified refurbished laptops, MacBooks & gaming laptops. Expert repair & home service across Indore.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link to="/products">
              <Button size="lg" className="gap-2 px-8 h-12 text-base font-bold shadow-lg shadow-primary/30">
                <Laptop size={18} /> Shop Laptops <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base font-bold border-primary text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors">
                <Wrench size={18} /> Book Repair
              </Button>
            </Link>
            <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer">
              <Button size="lg" variant="ghost" className="gap-2 px-6 h-12 text-[#25D366] hover:bg-[#25D366]/10 border border-[#25D366]/30">
                <MessageCircle size={18} /> WhatsApp
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[["5000+","Happy Customers"],["15+","Years Experience"],["4.8★","Google Rating"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-primary">{v}</p>
                <p className="text-[10px] md:text-xs text-white/50 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────── */}
      {benefits.length > 0 && (
        <section className="py-10 bg-card border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {benefits.map((b) => {
                const Icon = iconMap[b.icon] || Laptop;
                return (
                  <div key={b._id || b.title} className="flex flex-col items-center text-center gap-2 p-3">
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

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section className="py-16">
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

      {/* ── HOME REPAIR BANNER ───────────────────────────── */}
      <section className="py-16 bg-muted/40">
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
                <a href="https://wa.me/919893496163?text=Hi, I need laptop repair service" target="_blank" rel="noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 border-green-500 text-green-600 hover:bg-green-50"><MessageCircle size={16} /> WhatsApp</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MORE PRODUCTS ────────────────────────────────── */}
      {products.length > 4 && (
        <section className="py-16">
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

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-black text-center mb-2">Happy <span className="gradient-text">Customers</span></h2>
            <p className="text-muted-foreground text-center text-sm mb-3">5000+ satisfied customers trust AI Laptop Wala</p>
            <div className="section-divider mb-10" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.slice(0, 6).map((t) => (
                <Card key={t._id || t.name} className="border-border/50 hover:shadow-md transition-shadow">
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
      <ReelsSection />
      <section className="py-14 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-black mb-2">Need Help Choosing a Laptop?</h2>
          <p className="text-muted-foreground text-sm mb-6">Chat with our expert on WhatsApp — free consultation, instant reply!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://wa.me/919893496163?text=Hi, I need help choosing a laptop" target="_blank" rel="noreferrer">
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
