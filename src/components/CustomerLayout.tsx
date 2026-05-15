import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import CustomerBottomNav from "./CustomerBottomNav";
import { useCartStore } from "@/store/cartStore";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  // Save abandoned cart on page leave
  useEffect(() => {
    const saveAbandonedCart = () => {
      const { items, getTotal } = useCartStore.getState();
      if (items.length === 0) return;
      const token = localStorage.getItem('ailaptopwala_token');
      const phone = localStorage.getItem('user_phone') || '';
      navigator.sendBeacon('/api/orders/abandoned-cart', new Blob([JSON.stringify({
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total: getTotal(), phone, user_id: token ? 'logged-in' : null
      })], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', saveAbandonedCart);
    return () => window.removeEventListener('beforeunload', saveAbandonedCart);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppWidget />
      <CustomerBottomNav />
    </div>
  );
};

export default CustomerLayout;
