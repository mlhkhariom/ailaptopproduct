import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

const sections = [
  { title: "Delivery Areas", content: "We deliver across India. Free delivery is available within Indore city. For other locations, a flat shipping charge of ₹150 applies on orders below ₹5,000. Orders above ₹5,000 get free shipping pan-India." },
  { title: "Delivery Timeline", content: "Indore city: Same day or next day delivery. Madhya Pradesh: 2-3 business days. Other states: 3-5 business days. Remote areas: 5-7 business days. Delivery timelines may vary during holidays and peak seasons." },
  { title: "Order Processing", content: "Orders are processed within 24 hours of payment confirmation. You will receive an order confirmation via WhatsApp and email. Once shipped, you will receive a tracking ID." },
  { title: "Tracking Your Order", content: "Track your order at ailaptopwala.com/track-order using your Order ID (format: ALW-XXXXXX). You can also WhatsApp us at +91 98934 96163 for real-time updates." },
  { title: "Packaging", content: "All products are carefully packed with bubble wrap and foam padding to prevent damage during transit. Laptops are packed in double-layer packaging with anti-static protection." },
  { title: "Failed Delivery", content: "If delivery fails due to incorrect address or unavailability, we will attempt delivery 2 more times. After 3 failed attempts, the order will be returned to our warehouse and a refund will be processed." },
  { title: "Contact for Shipping", content: "For shipping queries: WhatsApp +91 98934 96163 | Email: contact@ailaptopwala.com | Mon-Sat 10AM-8PM" },
];

const Shipping = () => (
  <CustomerLayout>
    <SEOHead title="Shipping Policy — AI Laptop Wala" canonical="/shipping" noindex />
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-black mb-2">Shipping Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: April 2026 | Free delivery in Indore</p>
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

export default Shipping;
