import { useState } from "react";
import { HelpCircle, MessageCircle, Phone, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";

const HELP_TOPICS = [
  { category: 'Orders', questions: [
    { q: 'How do I track my order?', a: 'Go to Track Order page, enter your order number (ALW-XXXXX). You can also check in My Account → Orders.' },
    { q: 'Can I cancel my order?', a: 'Yes, you can cancel if status is "Placed" or "Processing". Go to Account → Orders → Cancel button.' },
    { q: 'How long does delivery take?', a: 'Indore: 1-2 days (free). Rest of India: 3-5 days (₹99-149 shipping).' },
    { q: 'I received a damaged product', a: 'Please request a return within 7 days. Go to Account → Returns → Request Return. We will arrange pickup.' },
  ]},
  { category: 'Payments', questions: [
    { q: 'What payment methods are accepted?', a: 'Razorpay (cards/UPI/wallets), PhonePe, Cashfree, Paytm, UPI Direct, Cash on Delivery, and Wallet balance.' },
    { q: 'Is EMI available?', a: 'Yes! No-cost EMI on 3 & 6 months. Bajaj Finance EMI also available (Indore, 25+ age). Check our EMI Calculator.' },
    { q: 'Payment failed but money deducted', a: 'Don\'t worry! If payment failed, amount will be refunded within 5-7 business days automatically.' },
  ]},
  { category: 'Returns & Refunds', questions: [
    { q: 'What is the return policy?', a: '7-day return for defective products. Go to Account → Returns to request. Refund processed within 5-7 days.' },
    { q: 'How do I get a refund?', a: 'After return is approved, refund goes to original payment method or wallet (your choice).' },
    { q: 'Can I exchange instead of return?', a: 'Yes! Select "Exchange" when requesting return. We will arrange replacement.' },
  ]},
  { category: 'Products & Warranty', questions: [
    { q: 'Are products genuine?', a: 'All products are certified refurbished — thoroughly tested, cleaned, and come with 90-day warranty.' },
    { q: 'What warranty do I get?', a: '90 days standard warranty on refurbished. 1 year on new products. Extended warranty available.' },
    { q: 'Do you sell new laptops?', a: 'Yes! We have both new and certified refurbished laptops. Check product badge for condition.' },
  ]},
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const filtered = search ? HELP_TOPICS.map(t => ({ ...t, questions: t.questions.filter(q => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())) })).filter(t => t.questions.length > 0) : HELP_TOPICS;

  return (
    <CustomerLayout>
      <SEOHead title="Help Center — AI Laptop Wala" description="Get help with orders, payments, returns, and more. Contact support or find answers to common questions." canonical="/help" />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black flex items-center justify-center gap-2"><HelpCircle className="h-8 w-8" /> Help <span className="gradient-text">Center</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Find answers or contact our support team</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search for help..." className="pl-10 h-11" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <a href="https://wa.me/919893496163?text=Hi, I need help" target="_blank" rel="noreferrer">
            <Card className="hover:border-green-500 transition-colors cursor-pointer"><CardContent className="p-4 text-center"><MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" /><p className="text-xs font-medium">WhatsApp</p><p className="text-[10px] text-muted-foreground">Instant reply</p></CardContent></Card>
          </a>
          <a href="tel:+919893496163">
            <Card className="hover:border-blue-500 transition-colors cursor-pointer"><CardContent className="p-4 text-center"><Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" /><p className="text-xs font-medium">Call Us</p><p className="text-[10px] text-muted-foreground">+91 98934 96163</p></CardContent></Card>
          </a>
          <a href="mailto:ailaptopwala@gmail.com">
            <Card className="hover:border-orange-500 transition-colors cursor-pointer"><CardContent className="p-4 text-center"><Mail className="h-6 w-6 text-orange-600 mx-auto mb-2" /><p className="text-xs font-medium">Email</p><p className="text-[10px] text-muted-foreground">24hr response</p></CardContent></Card>
          </a>
        </div>

        {/* FAQ by Category */}
        {filtered.map(topic => (
          <div key={topic.category} className="mb-6">
            <h2 className="font-bold text-lg mb-3">{topic.category}</h2>
            <Accordion type="single" collapsible>
              {topic.questions.map((q, i) => (
                <AccordionItem key={i} value={`${topic.category}-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{q.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{q.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </CustomerLayout>
  );
}
