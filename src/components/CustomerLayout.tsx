import Header from "./Header";
import Footer from "./Footer";
import { WhatsAppButton, CookieConsent } from "./SiteFeatures";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <WhatsAppButton />
    <CookieConsent />
  </div>
);

export default CustomerLayout;
