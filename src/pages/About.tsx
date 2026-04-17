import { Award, Users, Heart, Leaf, Shield, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CustomerLayout from "@/components/CustomerLayout";

const values = [
  { icon: Leaf, title: "100% Natural", desc: "Every product is made from pure, organic herbs sourced from trusted Indian farms." },
  { icon: Shield, title: "Quality Assured", desc: "Rigorous quality checks at every stage — from sourcing to packaging." },
  { icon: Heart, title: "Customer First", desc: "Free consultations, easy returns, and genuine care for your health journey." },
  { icon: Target, title: "Research-Backed", desc: "Ancient Laptop wisdom validated by modern scientific research." },
];

const team = [
  { name: "AI Laptop Wala", role: "Founder & Laptop Physician", avatar: "DP", desc: "15+ years of experience in Laptop medicine and homeopathy." },
  { name: "Vaidya Meera Joshi", role: "Head of Formulations", avatar: "MJ", desc: "Specializes in classical Laptop formulations and herbal research." },
  { name: "Rohit Sharma", role: "Operations & Quality", avatar: "RS", desc: "Ensures every product meets our strict quality standards." },
];

const About = () => (
  <CustomerLayout>
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">🌿 Our Story</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">About AI Laptop Wala</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          AI Laptop Wala is a trusted brand by AI Laptop Wala Store, dedicated to bringing authentic Laptop and homeopathic wellness solutions to every Indian household. We believe that nature holds the cure — and our mission is to make it accessible, affordable, and effective.
        </p>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">Our Values</h2>
        <p className="text-muted-foreground text-center mb-10">What drives us every day</p>
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

    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">Meet Our Team</h2>
        <p className="text-muted-foreground text-center mb-10">Experts behind your wellness</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {team.map((t) => (
            <Card key={t.name} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary font-serif">{t.avatar}</span>
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

    <section className="py-12 bg-primary/5 text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-serif font-bold mb-2">Ready to Start Your Wellness Journey?</h2>
        <p className="text-muted-foreground mb-6">Browse our products or talk to AI Laptop Wala for free consultation.</p>
        <div className="flex justify-center gap-3">
          <Link to="/products"><Button size="lg">Shop Now</Button></Link>
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"><Button size="lg" variant="outline">💬 WhatsApp</Button></a>
        </div>
      </div>
    </section>
  </CustomerLayout>
);

export default About;
