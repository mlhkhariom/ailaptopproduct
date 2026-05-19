import { Laptop, Shield, Wrench, Target, MapPin, Phone, Mail, Clock, Instagram, Youtube, Facebook, MessageCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useEffect, useState } from "react";

const values = [
  { icon: Laptop, title: "Certified Refurbished", desc: "Every laptop tested, cleaned & certified. Grade A quality. Dell, HP, Lenovo, Apple, Asus, Acer — all brands." },
  { icon: Shield, title: "6 Month Warranty", desc: "All products come with 6 month warranty. Free repair if any issue within warranty period." },
  { icon: Wrench, title: "Expert Repair & Home Service", desc: "Same day repair for all brands. Free home pickup & delivery across Indore city." },
  { icon: Target, title: "Best Price Guarantee", desc: "Get premium laptops at 40-60% off MRP. Transparent pricing, no hidden charges." },
];

const team = [
  { name: "Bhagwan Das Asati", role: "Founder — Asati Infotech", avatar: "BA", desc: "15+ years in laptop sales & repair. Started AI Laptop Wala in 2011 with a vision to make quality laptops affordable for everyone in Indore." },
  { name: "Technical Team", role: "Certified Laptop Engineers", avatar: "TT", desc: "Our engineers are trained on all major brands — Dell, HP, Lenovo, Apple MacBook, Asus, Acer. Screen, battery, motherboard, data recovery." },
  { name: "Customer Support", role: "Sales & After-Sales", avatar: "CS", desc: "Dedicated support team available Mon-Sat 10AM-8PM. WhatsApp support always available at +91 98934 96163." },
];

const About = () => {
  const settings = useSiteSettings() as any;
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/erp/branches/public').then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d.filter((b: any) => b.is_active)); }).catch(() => {});
  }, []);

  const storeName = settings.store_name || 'AI Laptop Wala';
  const storePhone = settings.store_phone || '+91 98934 96163';
  const storeEmail = settings.store_email || 'contact@ailaptopwala.com';
  const whatsapp = settings.whatsapp_number || '919893496163';
  const foundedYear = settings.founded_year || '2011';
  const businessHours = settings.business_hours || 'Mon-Sat 10:00 AM - 9:00 PM';
  const address = settings.store_address || 'Silver Mall, RNT Marg, Indore';

  const socials = [
    settings.social_instagram && { icon: Instagram, label: "Instagram", url: settings.social_instagram, color: "text-pink-500" },
    settings.social_youtube && { icon: Youtube, label: "YouTube", url: settings.social_youtube, color: "text-red-500" },
    settings.social_facebook && { icon: Facebook, label: "Facebook", url: settings.social_facebook, color: "text-blue-500" },
    { icon: MessageCircle, label: "WhatsApp", url: `https://wa.me/${whatsapp}`, color: "text-green-500" },
  ].filter(Boolean);

  return (
  <CustomerLayout>
    <SEOHead
      title={`About Us — ${storeName} Indore | Since ${foundedYear}`}
      description={`${storeName} — Indore's most trusted laptop store since ${foundedYear}. ${branches.length} branches. 5000+ happy customers.`}
      canonical="/about"
      breadcrumbs={[{ name: "About Us" }]}
    />

    {/* Hero */}
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">Since {foundedYear} — {settings.legal_name || 'Asati Infotech'}</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About {storeName}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Indore's most trusted laptop store. We buy, sell and repair laptops since {foundedYear}.
          {branches.length > 0 && ` ${branches.length} branches across Indore.`}
          {' '}Serving 5000+ happy customers across Madhya Pradesh.
        </p>
      </div>
    </section>

    {/* Stats */}
    <section className="py-10 border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          { [{value: settings.stat_customers || "5000+", label: "Happy Customers"}, {value: `${new Date().getFullYear() - parseInt(foundedYear || "2011")}+`, label: "Years Experience"}, {value: settings.stat_rating || "4.8", label: "Google Rating"}, {value: String(branches.length || 2), label: "Branches"}].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Why Choose AI Laptop Wala</h2>
        <p className="text-muted-foreground text-center mb-10">What makes us Indore's #1 laptop store</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <Card key={v.title} className="text-center border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Our Team</h2>
        <p className="text-muted-foreground text-center mb-10">The people behind AI Laptop Wala</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {team.map((t) => (
            <Card key={t.name} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">{t.avatar}</span>
                </div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-primary mb-2">{t.role}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Branches */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Our Branches</h2>
        <p className="text-muted-foreground text-center mb-10">{branches.length} convenient location{branches.length > 1 ? 's' : ''} in Indore</p>
        <div className={`grid gap-6 max-w-4xl mx-auto ${branches.length === 1 ? 'max-w-lg' : branches.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {branches.map((b: any) => (
            <Card key={b.id || b.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-primary">{b.name}</h3>
                {b.address && <div className="flex items-start gap-2 text-sm"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" /><p className="text-muted-foreground">{b.address}</p></div>}
                {b.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><a href={`tel:${b.phone}`} className="text-muted-foreground hover:text-primary">{b.phone}</a></div>}
                {b.manager && <p className="text-xs text-muted-foreground">Manager: {b.manager}</p>}
                {b.map_url && (
                  <a href={b.map_url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 w-full mt-2">
                      <MapPin className="h-3.5 w-3.5" /> Get Directions
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 inline mr-1" /> {businessHours || 'Open Monday – Saturday: 10:00 AM – 8:00 PM'}
        </div>
      </div>
    </section>

    {/* Social + Listings */}
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-6">Find Us Online</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {socials.map((s: any) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              <Button variant="outline" className={`gap-2 ${s.color}`}>
                <s.icon className="h-4 w-4" /> {s.label}
              </Button>
            </a>
          ))}
        </div>
        <h3 className="text-center text-sm font-medium text-muted-foreground mb-3">Business Listings</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {(settings.social_justdial || settings.social_indiamart ? [{label: "JustDial", url: settings.social_justdial}, {label: "IndiaMart", url: settings.social_indiamart}].filter((l: any) => l.url) : []).map((l: any) => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> {l.label}
            </a>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-12 bg-primary/5 text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-2">Ready to Buy or Repair?</h2>
        <p className="text-muted-foreground mb-6">Visit any of our 2 branches or WhatsApp us for instant help.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/products"><Button size="lg">Browse Laptops</Button></Link>
          <Link to="/services"><Button size="lg" variant="outline">Book Repair</Button></Link>
          <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer"><Button size="lg" variant="outline">💬 WhatsApp</Button></a>
        </div>
      </div>
    </section>
  </CustomerLayout>
  );
};

export default About;
