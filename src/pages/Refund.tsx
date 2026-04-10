import CustomerLayout from "@/components/CustomerLayout";

const Refund = () => (
  <CustomerLayout>
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-2">Refund & Return Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 2024</p>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-serif font-bold mb-3">1. Return Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">You can request a return within 7 days of delivery if the product is damaged, defective, or incorrect. Products must be unused, unopened, and in their original packaging. Opened or used products are not eligible for return (due to hygiene and safety reasons).</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">2. How to Request a Return</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Contact us via WhatsApp (+91 98765 43210) or email (hello@apsoncure.com)</li>
            <li>Share your Order ID and photos of the damaged/incorrect product</li>
            <li>Our team will review and respond within 24-48 hours</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">3. Refund Process</h2>
          <p className="text-muted-foreground leading-relaxed">Once we receive and inspect the returned product, refunds are processed within 5-7 business days. Refunds are credited to the original payment method. For COD orders, refunds are processed via bank transfer (NEFT/UPI).</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">4. Non-Returnable Items</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Opened or used products</li>
            <li>Products returned after 7 days</li>
            <li>Items marked as "Non-Returnable" on the product page</li>
            <li>Free samples or promotional items</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">5. Exchanges</h2>
          <p className="text-muted-foreground leading-relaxed">We offer one-time free exchange for damaged or incorrect items. For size/variant changes, please place a new order and return the original.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">6. Contact for Returns</h2>
          <p className="text-muted-foreground leading-relaxed">Email: hello@apsoncure.com | WhatsApp: +91 98765 43210 | Working Hours: Mon-Sat, 9 AM – 7 PM</p>
        </section>
      </div>
    </div>
  </CustomerLayout>
);

export default Refund;
