import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useSiteSettings, useAppSettings } from "@/contexts/SiteSettingsContext";

export const WhatsAppButton = () => {
  const { whatsapp_chat_button } = useSiteSettings();
  const { store_phone } = useAppSettings();
  const [visible, setVisible] = useState(false);
  const phone = store_phone?.replace(/[^0-9]/g, '') || '919876543210';

  useEffect(() => { setTimeout(() => setVisible(true), 2000); }, []);

  if (!whatsapp_chat_button || !visible) return null;

  return (
    <a href={`https://wa.me/${phone}?text=Hi! I need help with Apsoncure products.`}
      target="_blank" rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-all hover:scale-110 group">
      <MessageCircle className="h-7 w-7 text-white fill-white" />
      <span className="absolute right-16 bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Chat on WhatsApp
      </span>
    </a>
  );
};

export const CookieConsent = () => {
  const { cookie_consent } = useSiteSettings();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (cookie_consent && !localStorage.getItem('cookie_accepted')) {
      setTimeout(() => setShow(true), 1500);
    }
  }, [cookie_consent]);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          🍪 We use cookies to improve your experience. By continuing, you agree to our <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setShow(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Decline</button>
          <button onClick={() => { localStorage.setItem('cookie_accepted', '1'); setShow(false); }}
            className="text-xs bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-medium hover:opacity-90">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
