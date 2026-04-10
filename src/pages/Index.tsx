import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, Leaf, Star, Play, Award, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { products, testimonials } from "@/data/mockData";

const benefits = [
  { icon: Leaf, title: "100% शुद्ध", titleEn: "Pure & Natural", desc: "भारतीय जैविक खेतों से शुद्ध जड़ी-बूटियां" },
  { icon: Award, title: "प्रमाणित गुणवत्ता", titleEn: "Certified Quality", desc: "आयुर्वेदिक ग्रंथों और रिसर्च पर आधारित" },
  { icon: Truck, title: "फ्री डिलीवरी", titleEn: "Free Shipping", desc: "₹499 से ऊपर के ऑर्डर पर पूरे भारत में" },
  { icon: HeartPulse, title: "डॉक्टर की सलाह", titleEn: "Expert Guidance", desc: "डॉ. प्राची से WhatsApp पर परामर्श लें" },
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
              Prachi Homeo Clinic द्वारा प्रमाणित आयुर्वेदिक उत्पाद। 5000 वर्षों की विद्या से बने शुद्ध और असली प्रोडक्ट्स।
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg">
              Authentic Ayurvedic products crafted with pure herbs. Transform your health naturally.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2">अभी खरीदें (Shop Now) <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <a href="https://wa.me/919876543210?text=नमस्ते डॉक्टर! मुझे आयुर्वेदिक सलाह चाहिए।" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="gap-2">💬 डॉक्टर से बात करें</Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=500&fit=crop"
              alt="Apsoncure - आयुर्वेदिक जड़ी-बूटियां"
              className="rounded-2xl shadow-2xl w-full object-cover max-h-[420px]"
            />
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">4.8/5 रेटिंग</p>
                <p className="text-xs text-muted-foreground">5000+ खुश ग्राहक</p>
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
              <p className="text-[10px] text-muted-foreground">{b.titleEn}</p>
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
            <h2 className="text-3xl font-serif font-bold">हमारे बेस्टसेलर</h2>
            <p className="text-muted-foreground mt-1">Featured Products – आपकी सेहत के लिए चुने हुए</p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="gap-2">सभी देखें <ArrowRight className="h-4 w-4" /></Button>
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
        <h2 className="text-3xl font-serif font-bold text-center mb-2">📱 हमारी Reels देखें</h2>
        <p className="text-muted-foreground text-center mb-8">Instagram & YouTube से हमारे लेटेस्ट वीडियो</p>
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
        <h2 className="text-3xl font-serif font-bold text-center mb-2">हमारे ग्राहक क्या कहते हैं</h2>
        <p className="text-muted-foreground text-center mb-8">Customer Reviews – असली लोग, असली अनुभव</p>
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
        <h2 className="text-2xl font-serif font-bold mb-2">🙏 डॉ. प्राची से निःशुल्क परामर्श लें</h2>
        <p className="text-muted-foreground mb-6">WhatsApp पर अभी बात करें – Free Consultation by Dr. Prachi</p>
        <a href="https://wa.me/919876543210?text=नमस्ते डॉक्टर! मुझे आयुर्वेदिक सलाह चाहिए।" target="_blank" rel="noreferrer">
          <Button size="lg" className="gap-2 text-base px-8">💬 WhatsApp पर संपर्क करें</Button>
        </a>
      </div>
    </section>
  </CustomerLayout>
);

export default Index;
