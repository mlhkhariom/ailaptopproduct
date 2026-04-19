import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide when creating an account, placing orders, or contacting us: name, email, phone number, shipping address, and payment information (processed securely via Razorpay). We also collect device/browser data for analytics." },
  { title: "How We Use Your Information", content: "We use your information to: process and fulfill orders, send order confirmations and updates via WhatsApp/email, provide customer support, improve our website and services, send promotional offers (you can opt out anytime)." },
  { title: "Information Sharing", content: "We do not sell or rent your personal information. We share data only with: payment processors (Razorpay), shipping partners for order delivery, and as required by law. All third parties are bound by confidentiality agreements." },
  { title: "Data Security", content: "We implement industry-standard security measures including SSL encryption, secure payment processing via Razorpay, and restricted access to personal data. However, no internet transmission is 100% secure." },
  { title: "Cookies", content: "We use cookies to maintain your session, remember cart items, and analyze website traffic. You can disable cookies in your browser settings, though some features may not work properly." },
  { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at contact@ailaptopwala.com or WhatsApp +91 98934 96163." },
  { title: "Contact Us", content: "For privacy concerns: AI Laptop Wala (Asati Infotech), LB-21, Block-B, Silver Mall, RNT Marg, Indore, MP 452001. Email: contact@ailaptopwala.com | Phone: +91 98934 96163" },
];

const Privacy = () => (
  <CustomerLayout>
    <SEOHead title="Privacy Policy — AI Laptop Wala" canonical="/privacy" noindex />
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: April 2026 | AI Laptop Wala (Asati Infotech)</p>
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

export default Privacy;
