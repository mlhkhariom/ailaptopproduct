import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing ailaptopwala.com, you agree to these Terms & Conditions. This website is operated by Asati Infotech (AI Laptop Wala). All products listed are certified refurbished laptops, desktops, and accessories." },
  { title: "2. Products & Pricing", content: "All products are certified refurbished unless stated otherwise. Prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to change prices without prior notice. Product images are for illustration purposes." },
  { title: "3. Orders & Payment", content: "Orders are confirmed only after successful payment. We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD) via Razorpay. COD is available on select pin codes for orders up to ₹50,000." },
  { title: "4. Warranty", content: "All products come with a 6-month warranty from AI Laptop Wala. Warranty covers manufacturing defects and hardware failures. It does not cover physical damage, liquid damage, or software issues caused by the user." },
  { title: "5. Intellectual Property", content: "All content on this website including text, images, logos, and design is the property of Asati Infotech. Unauthorized use, reproduction, or distribution is prohibited." },
  { title: "6. Limitation of Liability", content: "AI Laptop Wala is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the purchase price of the product." },
  { title: "7. Governing Law", content: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Indore, Madhya Pradesh." },
  { title: "8. Contact", content: "Asati Infotech, LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001. Email: contact@ailaptopwala.com | Phone: +91 98934 96163" },
];

const Terms = () => (
  <CustomerLayout>
    <SEOHead title="Terms & Conditions — AI Laptop Wala" canonical="/terms" noindex />
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-black mb-2">Terms & Conditions</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: April 2026 | Asati Infotech (AI Laptop Wala)</p>
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

export default Terms;
