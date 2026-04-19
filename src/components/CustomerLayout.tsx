import Header from "./Header";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <WhatsAppWidget />
    <CookieConsent />
  </div>
);

export default CustomerLayout;
