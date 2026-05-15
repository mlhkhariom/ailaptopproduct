import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromoPopup() {
  const [popup, setPopup] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('popup_dismissed');
    if (dismissed) return;

    fetch('/api/cms/popups/active').then(r => r.json()).then(data => {
      if (!data || !data.title) return;
      setPopup(data);
      const delay = Number(data.trigger_value || 5) * 1000;
      if (data.trigger_type === 'delay') {
        setTimeout(() => setShow(true), delay);
      } else if (data.trigger_type === 'scroll') {
        const handler = () => { if (window.scrollY > 300) { setShow(true); window.removeEventListener('scroll', handler); } };
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
      } else if (data.trigger_type === 'exit') {
        const handler = (e: MouseEvent) => { if (e.clientY < 10) { setShow(true); document.removeEventListener('mouseleave', handler); } };
        document.addEventListener('mouseleave', handler);
        return () => document.removeEventListener('mouseleave', handler);
      }
    }).catch(() => {});
  }, []);

  const dismiss = () => { setShow(false); sessionStorage.setItem('popup_dismissed', '1'); };

  if (!show || !popup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 animate-in fade-in" onClick={dismiss}>
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <button onClick={dismiss} className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-1 hover:bg-white"><X className="h-4 w-4" /></button>
        {popup.image && <img src={popup.image} alt={popup.title} className="w-full h-40 object-cover" />}
        <div className="p-6 text-center">
          <h2 className="text-xl font-black mb-2">{popup.title}</h2>
          {popup.body && <p className="text-sm text-muted-foreground mb-4">{popup.body}</p>}
          {popup.button_text && (
            <a href={popup.button_link || '/products'}>
              <Button className="w-full">{popup.button_text}</Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
