import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

const sections = [
  { title: "Return Eligibility", content: "You can return a product within 7 days of delivery if: the product has a manufacturing defect, wrong product was delivered, or the product is damaged during shipping. Products must be in original condition with all accessories and packaging." },
  { title: "Non-Returnable Items", content: "The following cannot be returned: products with physical damage caused by the customer, products with broken seals or missing accessories, software-related issues, and products returned after 7 days of delivery." },
  { title: "Return Process", content: "1. Contact us via WhatsApp (+91 98934 96163) or email (contact@ailaptopwala.com) within 7 days of delivery. 2. Share your Order ID and photos/video of the issue. 3. Our team will verify and approve the return. 4. We will arrange free pickup from your location in Indore." },
  { title: "Refund Policy", content: "Once the returned product is received and verified, refunds are processed within 5-7 business days. Refunds are credited to the original payment method. COD orders are refunded via bank transfer (NEFT/IMPS)." },
  { title: "Exchange Policy", content: "We offer free exchange for defective products within the warranty period. Exchange is subject to product availability. If the same product is unavailable, we will offer a similar product or full refund." },
  { title: "Warranty Claims", content: "For warranty claims (within 6 months of purchase): Contact us with your Order ID and description of the issue. Our technician will diagnose the problem. Covered issues will be repaired or replaced free of charge." },
  { title: "Contact for Returns", content: "WhatsApp: +91 98934 96163 | Email: contact@ailaptopwala.com | Visit: LB-21, Block-B, Silver Mall, RNT Marg, Indore | Timing: Mon-Sat 10AM-8PM" },
];

const Refund = () => (
  <CustomerLayout>
    <SEOHead title="Refund & Return Policy — AI Laptop Wala" canonical="/refund" noindex />
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-black mb-2">Refund & Return Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: April 2026 | 7-day return policy</p>
      <div className="space-y-6">
        {sections.map(s => (
          <div key={s.title}>
            <h2 className="text-lg font-bold mb-2">{s.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  </CustomerLayout>
);

export default Refund;
