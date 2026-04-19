import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Play, Leaf, Award, Truck, HeartPulse, Shield, Heart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";

const iconMap: Record<string, typeof Leaf> = { Leaf, Award, Truck, HeartPulse, Shield, Heart, Target, Star };

const Index = () => {
  const { products, fetchProducts } = useProductStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ whatsappNumber: '919893496163' });

  useEffect(() => {
    fetchProducts();
    api.getCMS('banner').then(d => setBanners(d.map((i: any) => i.content))).catch(() => {});
    api.getCMS('benefit').then(d => setBenefits(d.map((i: any) => i.content))).catch(() => {});
    api.getCMS('testimonial').then(d => setTestimonials(d.map((i: any) => i.content))).catch(() => {});
    api.getCMS('setting').then(d => { if (d[0]) setSettings(d[0].content); }).catch(() => {});
  }, []);

  const activeBanner = banners[0];
  const activeBenefits = benefits;
  const activeTestimonials = testimonials;
  const siteSettings = settings;

  return (
    <CustomerLayout>
      <SEOHead canonical="/" />
      {/* Hero */}
      {activeBanner && (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-4">
                  {activeBanner.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6 max-w-lg">{activeBanner.subtitle}</p>
                <Link to="/products"><Button size="lg" className="gap-2">{activeBanner.cta || 'Shop Now'} <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
              <div className="relative">
                <img src={activeBanner.image} alt="AI Laptop Wala" className="rounded-2xl shadow-2xl w-full object-cover max-h-[420px]" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {activeBenefits.length > 0 && (
        <section className="py-12 bg-card border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {activeBenefits.map((b) => {
                const Icon = iconMap[b.icon] || Leaf;
                return (
                  <div key={b.id} className="flex flex-col items-center text-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold">Our Bestsellers</h2>
              <p className="text-muted-foreground mt-1">Certified refurbished laptops at best prices</p>
            </div>
            <Link to="/products"><Button variant="outline" className="gap-2">View All <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Video Reels */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-2">Watch Our Reels</h2>
          <p className="text-muted-foreground text-center mb-8">Latest videos from our Instagram & YouTube</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 4).map((p) => (
              <Link to={`/products/${p.id}`} key={p.id}>
                <Card className="group overflow-hidden cursor-pointer">
                  <div className="relative aspect-[9/16] bg-muted">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent flex flex-col justify-end p-3">
                      <Play className="h-8 w-8 text-primary-foreground mb-2 opacity-80" />
                      <p className="text-primary-foreground text-xs font-medium line-clamp-2">{p.name}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {activeTestimonials.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-2">What Our Customers Say</h2>
            <p className="text-muted-foreground text-center mb-8">Real people, real experiences</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeTestimonials.map((t) => (
                <Card key={t.id} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{t.avatar}</div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
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

      {/* WhatsApp CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif font-bold mb-2">🙏 Free Consultation with AI Laptop Wala</h2>
          <p className="text-muted-foreground mb-6">Chat on WhatsApp now — personalized Laptop guidance</p>
          <a href={`https://wa.me/${siteSettings.whatsappNumber}?text=Hi Doctor! I need Laptop consultation.`} target="_blank" rel="noreferrer">
            <Button size="lg" className="gap-2 text-base px-8">💬 Chat on WhatsApp</Button>
          </a>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default Index;
