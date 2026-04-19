import { Award, Users, Laptop, Shield, Target, Wrench, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

const values = [
  { icon: Laptop, title: "Certified Refurbished", desc: "Every laptop is tested, cleaned and certified before sale. Grade A quality guaranteed." },
  { icon: Shield, title: "6 Month Warranty", desc: "All products come with 6 month warranty. Free repair if any issue within warranty period." },
  { icon: Wrench, title: "Expert Repair", desc: "Same day repair for all laptop brands. Screen, battery, keyboard, motherboard — we fix it all." },
  { icon: Target, title: "Best Price", desc: "Get premium laptops at 40-60% off MRP. No hidden charges, transparent pricing." },
];

const team = [
  { name: "Bhagwan Das Asati", role: "Founder — Asati Infotech", avatar: "BA", desc: "15+ years in laptop sales & repair. Started AI Laptop Wala in 2011 with a vision to make quality laptops affordable." },
  { name: "Technical Team", role: "Certified Laptop Engineers", avatar: "TT", desc: "Our engineers are trained on all major brands — Dell, HP, Lenovo, Apple, Asus, Acer." },
  { name: "Customer Support", role: "Sales & After-Sales", avatar: "CS", desc: "Dedicated support team available Mon-Sat 10AM-8PM. WhatsApp support always available." },
];

const stats = [
  { value: "5000+", label: "Happy Customers" },
  { value: "15+", label: "Years Experience" },
  { value: "4.8★", label: "Google Rating" },
  { value: "500+", label: "Laptops in Stock" },
];

const About = () => (
  <CustomerLayout>
      <SEOHead title="About Us — AI Laptop Wala Indore" description="AI Laptop Wala — Indore most trusted laptop store since 2011. Founded by Bhagwan Das Asati (Asati Infotech). 5000+ happy customers at Silver Mall, RNT Marg." canonical="/about" breadcrumbs={[{name:"About Us"}]} />
    {/* Hero */}
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">💻 Since 2011</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About AI Laptop Wala</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Indore's most trusted laptop store. We buy, sell and repair laptops since 2011. 
          Located at Silver Mall, RNT Marg — serving 5000+ happy customers across Madhya Pradesh.
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
        <h2 className="text-3xl font-bold text-center mb-2">Why Choose Us</h2>
        <p className="text-muted-foreground text-center mb-10">What makes AI Laptop Wala different</p>
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

    {/* Store Info */}
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">Visit Our Store</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" /><p>LG-21, B-Block, Silver Mall, RNT Marg, Indore, MP – 452001</p></div>
          <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><a href="tel:+919893496163" className="hover:text-primary">+91 98934 96163</a></div>
          <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><a href="mailto:contact@ailaptopwala.com" className="hover:text-primary">contact@ailaptopwala.com</a></div>
          <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><p>Monday – Saturday: 10:00 AM – 8:00 PM</p></div>
        </div>
        <div className="flex justify-center gap-3 mt-8">
          <Link to="/products"><Button size="lg">Browse Laptops</Button></Link>
          <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer"><Button size="lg" variant="outline">💬 WhatsApp Us</Button></a>
        </div>
      </div>
    </section>
  </CustomerLayout>
);

export default About;
