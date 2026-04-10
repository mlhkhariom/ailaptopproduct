import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, Leaf, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { products, testimonials } from "@/data/mockData";

const benefits = [
  { icon: Leaf, title: "100% Natural", desc: "Pure herbs sourced from organic farms across India" },
  { icon: Shield, title: "Clinically Tested", desc: "Backed by research and traditional Ayurvedic texts" },
  { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹499 across India" },
  { icon: Star, title: "5000+ Reviews", desc: "Trusted by thousands of happy customers" },
];

const Index = () => (
  <CustomerLayout>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              🌿 Ancient Wisdom, Modern Wellness
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-4">
              Heal Naturally with <span className="text-primary">Ayurveda</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-lg">
              Discover authentic Ayurvedic products crafted from pure herbs. Transform your health with the wisdom of 5000 years.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2">Shop Now <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="gap-2">Consult a Vaidya</Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=500&fit=crop"
              alt="Ayurvedic herbs and ingredients"
              className="rounded-2xl shadow-2xl w-full object-cover max-h-[420px]"
            />
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">4.8/5 Rating</p>
                <p className="text-xs text-muted-foreground">5000+ Reviews</p>
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
            <h2 className="text-3xl font-serif font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-1">Handpicked for your wellness journey</p>
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

    {/* Instagram Reels */}
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">From Our Instagram</h2>
        <p className="text-muted-foreground text-center mb-8">Watch our latest wellness reels</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="group overflow-hidden cursor-pointer">
              <div className="relative aspect-[9/16] bg-muted">
                <img
                  src={`https://images.unsplash.com/photo-${1515377905703 + i * 1000}-c4788e51af15?w=300&h=500&fit=crop`}
                  alt={`Reel ${i}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-10 w-10 text-primary-foreground fill-primary-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">What Our Customers Say</h2>
        <p className="text-muted-foreground text-center mb-8">Real reviews from real people</p>
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
  </CustomerLayout>
);

export default Index;
