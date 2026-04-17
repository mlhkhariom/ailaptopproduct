import CustomerLayout from "@/components/CustomerLayout";

const Privacy = () => (
  <CustomerLayout>
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 2024</p>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-serif font-bold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">We collect information you provide directly — such as your name, email, phone number, shipping address, and payment details when you place an order. We also collect usage data like browser type, IP address, and pages visited through cookies and analytics tools.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates via WhatsApp/SMS/Email</li>
            <li>Provide personalized Laptop health recommendations</li>
            <li>Improve our website and product offerings</li>
            <li>Send promotional offers (only with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">3. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">We use industry-standard encryption (SSL/TLS) to protect your data. Payment processing is handled securely through Razorpay. We never store your full credit/debit card details on our servers.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">4. Sharing of Information</h2>
          <p className="text-muted-foreground leading-relaxed">We do not sell your personal data. We share information only with trusted service providers (shipping partners, payment gateways) necessary to fulfill your orders. We may disclose data if required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">5. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You can request access, correction, or deletion of your personal data at any time by contacting us at hello@ailaptopwala.com. You can unsubscribe from marketing emails using the link in any email.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">6. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For privacy-related queries, email us at hello@ailaptopwala.com or call +91 98765 43210.</p>
        </section>
      </div>
    </div>
  </CustomerLayout>
);

export default Privacy;
