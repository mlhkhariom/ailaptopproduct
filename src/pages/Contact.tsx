import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CustomerLayout from "@/components/CustomerLayout";

const contactInfo = [
  { icon: Phone, title: "Phone", value: "+91 98765 43210", link: "tel:+919876543210" },
  { icon: Mail, title: "Email", value: "hello@apsoncure.com", link: "mailto:hello@apsoncure.com" },
  { icon: MapPin, title: "Address", value: "Prachi Homeo Clinic, India", link: "#" },
  { icon: Clock, title: "Hours", value: "Mon-Sat: 9 AM – 7 PM", link: "#" },
];

const Contact = () => (
  <CustomerLayout>
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">Have a question? We'd love to hear from you. Reach out and we'll respond as soon as we can.</p>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Get in Touch</h2>
            <div className="space-y-4 mb-8">
              {contactInfo.map((c) => (
                <a key={c.title} href={c.link} className="flex items-start gap-4 p-4 rounded-xl border hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>
            <a href="https://wa.me/919876543210?text=Hi! I have a query." target="_blank" rel="noreferrer">
              <Button className="w-full gap-2" size="lg">
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </Button>
            </a>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-serif font-bold">Send a Message</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Full Name</Label><Input className="mt-1" placeholder="Your name" /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1" placeholder="+91 XXXXX XXXXX" /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="mt-1" placeholder="you@example.com" /></div>
              <div><Label className="text-xs">Subject</Label><Input className="mt-1" placeholder="Order inquiry, consultation, etc." /></div>
              <div><Label className="text-xs">Message</Label><Textarea className="mt-1" rows={4} placeholder="Tell us how we can help..." /></div>
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </CustomerLayout>
);

export default Contact;
