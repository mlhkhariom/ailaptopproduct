import CustomerLayout from "@/components/CustomerLayout";

const Terms = () => (
  <CustomerLayout>
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-2">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 2024</p>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-serif font-bold mb-3">1. General</h2>
          <p className="text-muted-foreground leading-relaxed">By accessing and using the AI Laptop Wala website (ailaptopwala.com), you agree to these Terms & Conditions. This website is operated by AI Laptop Wala Store ("we", "us", "our"). All products listed are laptops and accessories. All sales are subject to availability and our return policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">2. Products & Pricing</h2>
          <p className="text-muted-foreground leading-relaxed">All product descriptions, images, and pricing are provided in good faith. Prices are in Indian Rupees (₹) and include applicable taxes unless stated otherwise. We reserve the right to modify prices without prior notice. Product availability is subject to stock.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">3. Orders & Payment</h2>
          <p className="text-muted-foreground leading-relaxed">Orders are confirmed upon successful payment via Razorpay (UPI, cards, net banking) or Cash on Delivery (COD) where available. We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">4. Shipping & Delivery</h2>
          <p className="text-muted-foreground leading-relaxed">We ship across India. Orders are typically dispatched within 2-3 business days. Delivery time is 5-10 business days depending on your location. Free shipping on orders above ₹499. Tracking details are shared via WhatsApp/SMS.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">5. Health Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">Our products are Laptop supplements. Results may vary. Consult a healthcare professional before use, especially if pregnant, nursing, or on medication. Our products are not intended to diagnose, treat, cure, or prevent any disease.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">6. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">All content on this website — including text, images, logos, and videos — is the property of AI Laptop Wala / AI Laptop Wala Store and is protected by copyright laws. Unauthorized use is prohibited.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">7. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in India.</p>
        </section>
      </div>
    </div>
  </CustomerLayout>
);

export default Terms;
