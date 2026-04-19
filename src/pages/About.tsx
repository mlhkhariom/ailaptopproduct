import { Laptop, Shield, Wrench, Target, MapPin, Phone, Mail, Clock, Instagram, Youtube, Facebook, MessageCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

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

const stats = [
  { value: "5000+", label: "Happy Customers" },
  { value: "15+", label: "Years Experience" },
  { value: "4.8★", label: "Google Rating" },
  { value: "2", label: "Branches in Indore" },
];

const branches = [
  {
    name: "Branch 1 — Silver Mall",
    address: "LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001",
    map: "https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9",
    note: "Near Shrimaya Hotel, RNT Road",
  },
  {
    name: "Branch 2 — Bangali Chouraha",
    address: "21, G3, Sai Residency, Ashish Nagar, Near Bangali Chouraha, Indore, MP 452016",
    map: "https://maps.app.goo.gl/drVLkuS9tGjEmwUF7",
    note: "Near Bangali Chouraha",
  },
];

const socials = [
  { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/ailaptopwala", color: "text-pink-500" },
  { icon: Youtube, label: "YouTube", url: "https://www.youtube.com/@AiLaptopwalaindore", color: "text-red-500" },
  { icon: Facebook, label: "Facebook", url: "https://www.facebook.com/profile.php?id=61563386652422", color: "text-blue-500" },
  { icon: MessageCircle, label: "WhatsApp", url: "https://wa.me/919893496163", color: "text-green-500" },
];

const listings = [
  { label: "JustDial — Silver Mall", url: "https://www.justdial.com/Indore/Ai-Laptop-Wala/0731PX731-X731-251014151403-Y2S4_BZDET" },
  { label: "JustDial — RNT Road", url: "https://www.justdial.com/Indore/Ai-Laptopwala-Rnt-Road/0731PX731-X731-260220122854-E9T8_BZDET" },
  { label: "JustDial — Asati Infotech", url: "https://www.justdial.com/Indore/Asati-Infotech-Silver-Mall-Near-Shrimaya-Hotel-Rnt-Road/0731PX731-X731-111212153207-K3X8_BZDET" },
  { label: "IndiaMart — Asati Infotech", url: "https://www.indiamart.com/asati-infotech" },
];

const About = () => (
  <CustomerLayout>
    <SEOHead
      title="About Us — AI Laptop Wala Indore | Asati Infotech Since 2011"
      description="AI Laptop Wala — Indore's most trusted laptop store since 2011. Founded by Bhagwan Das Asati (Asati Infotech). 2 branches: Silver Mall & Bangali Chouraha. 5000+ happy customers."
      canonical="/about"
      breadcrumbs={[{ name: "About Us" }]}
    />

    {/* Hero */}
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">💻 Since 2011 — Asati Infotech</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About AI Laptop Wala</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Indore's most trusted laptop store. We buy, sell and repair laptops since 2011.
          2 branches across Indore — Silver Mall (RNT Marg) & Bangali Chouraha.
          Serving 5000+ happy customers across Madhya Pradesh.
        </p>
      </div>
    </section>

    {/* Stats */}
    <section className="py-10 border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
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
        <p className="text-muted-foreground text-center mb-10">2 convenient locations in Indore</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {branches.map((b) => (
            <Card key={b.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-primary">{b.name}</h3>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{b.address}</p>
                </div>
                <p className="text-xs text-muted-foreground">{b.note}</p>
                <a href={b.map} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="gap-1.5 w-full">
                    <MapPin className="h-3.5 w-3.5" /> Get Directions
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 inline mr-1" /> Open Monday – Saturday: 10:00 AM – 8:00 PM
        </div>
      </div>
    </section>

    {/* Social + Listings */}
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-6">Find Us Online</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {socials.map(s => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              <Button variant="outline" className={`gap-2 ${s.color}`}>
                <s.icon className="h-4 w-4" /> {s.label}
              </Button>
            </a>
          ))}
        </div>
        <h3 className="text-center text-sm font-medium text-muted-foreground mb-3">Business Listings</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {listings.map(l => (
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

export default About;
