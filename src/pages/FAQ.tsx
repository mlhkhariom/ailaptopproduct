import { useState, useEffect } from "react";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { api } from "@/lib/api";

const FAQ = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => { api.getCMS('faq').then(d => setFaqs(d.filter((f: any) => f.is_active))).catch(() => {}); }, []);

  const categories = ["All", ...Array.from(new Set(faqs.map((f: any) => f.content?.category).filter(Boolean)))];

  const filtered = faqs
    .filter(f => category === "All" || f.content?.category === category)
    .filter(f => f.content?.question?.toLowerCase().includes(search.toLowerCase()) || f.content?.answer?.toLowerCase().includes(search.toLowerCase()));

  const faqSchema = filtered.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filtered.map(f => ({
      "@type": "Question",
      "name": f.content?.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.content?.answer }
    }))
  } : null;

  return (
    <CustomerLayout>
      <SEOHead title="FAQ — AI Laptop Wala Indore" description="Frequently asked questions about buying refurbished laptops, repair services, warranty, delivery and returns at AI Laptop Wala Indore." canonical="/faq" breadcrumbs={[{name:"FAQ"}]} jsonLd={faqSchema || undefined} />
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions about our products, shipping, payments, and more.</p>
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search questions..." className="pl-10 h-11 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((c: string) => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setCategory(c)}>
                {c}
              </Button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {filtered.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-xl px-4 data-[state=open]:shadow-md transition-shadow">
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[9px] shrink-0">{faq.content?.category}</Badge>
                      {faq.content?.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    {faq.content?.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No matching questions found. Try a different search.</p>
            </div>
          )}

          <div className="mt-12 text-center p-8 rounded-2xl bg-primary/5 border">
            <h3 className="text-xl font-serif font-bold mb-2">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-4">Our team is here to help. Reach out via WhatsApp for instant support.</p>
            <a href={`https://wa.me/${siteSettings.whatsappNumber}?text=Hi! I have a question.`} target="_blank" rel="noreferrer">
              <Button className="gap-2">💬 Ask on WhatsApp</Button>
            </a>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default FAQ;
