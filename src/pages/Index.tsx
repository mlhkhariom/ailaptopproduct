import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, Leaf, Star, Play, Award, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { products, testimonials } from "@/data/mockData";

const benefits = [
  { icon: Leaf, title: "100% Pure & Natural", desc: "Pure herbs sourced from Indian organic farms" },
  { icon: Award, title: "Certified Quality", desc: "Based on Ayurvedic scriptures and modern research" },
  { icon: Truck, title: "Free Delivery", desc: "Pan-India free shipping on orders above ₹499" },
  { icon: HeartPulse, title: "Expert Guidance", desc: "Free consultation with Dr. Prachi via WhatsApp" },
];

const Index = () => (
  <CustomerLayout>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              🌿 प्राचीन आयुर्वेद, आधुनिक स्वास्थ्य
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-4">
              <span className="text-primary">Apsoncure</span> – प्रकृति से स्वास्थ्य
            </h1>
            <p className="text-lg text-muted-foreground mb-3 max-w-lg">
              Authentic Ayurvedic products by Prachi Homeo Clinic. 5000 years of wisdom in pure, natural products.
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg">
              Transform your health naturally with certified Ayurvedic remedies.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2">Shop Now <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <a href="https://wa.me/919876543210?text=Hi Doctor! I need Ayurvedic consultation." target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="gap-2">💬 Talk to Doctor</Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=500&fit=crop"
              alt="Apsoncure - Ayurvedic Herbs"
              className="rounded-2xl shadow-2xl w-full object-cover max-h-[420px]"
            />
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">4.8/5 Rating</p>
                <p className="text-xs text-muted-foreground">5000+ Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Benefits */}
    <section className="py-12 bg-card border-y">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{b.title}</h3>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Featured Products */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold">Our Bestsellers</h2>
            <p className="text-muted-foreground mt-1">Handpicked products for your wellness journey</p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="gap-2">View All <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>

    {/* Video Reels Section */}
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">Watch Our Reels</h2>
        <p className="text-muted-foreground text-center mb-8">Latest videos from our Instagram & YouTube</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => (
            <Link to={`/products/${p.id}`} key={p.id}>
              <Card className="group overflow-hidden cursor-pointer">
                <div className="relative aspect-[9/16] bg-muted">
                  <img
                    src={p.reels[0]?.thumbnail || p.image}
                    alt={`${p.name} Reel`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent flex flex-col justify-end p-3">
                    <Play className="h-8 w-8 text-primary-foreground mb-2 opacity-80" />
                    <p className="text-primary-foreground text-xs font-medium line-clamp-2">{p.reels[0]?.title}</p>
                    <p className="text-primary-foreground/70 text-[10px] mt-1">👁 {p.reels[0]?.views} views</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">What Our Customers Say</h2>
        <p className="text-muted-foreground text-center mb-8">Real people, real experiences</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
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

    {/* WhatsApp CTA */}
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-serif font-bold mb-2">🙏 Free Consultation with Dr. Prachi</h2>
        <p className="text-muted-foreground mb-6">Chat on WhatsApp now — personalized Ayurvedic guidance</p>
        <a href="https://wa.me/919876543210?text=Hi Doctor! I need Ayurvedic consultation." target="_blank" rel="noreferrer">
          <Button size="lg" className="gap-2 text-base px-8">💬 Chat on WhatsApp</Button>
        </a>
      </div>
    </section>
  </CustomerLayout>
);

export default Index;
