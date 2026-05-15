import Header from "./Header";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import CustomerBottomNav from "./CustomerBottomNav";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 pb-16 md:pb-0">{children}</main>
    <Footer />
    <WhatsAppWidget />
    <CustomerBottomNav />
  </div>
);

export default CustomerLayout;
