import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const quickMessages = [
  { label: "💻 Laptop Price Inquiry", msg: "Hi, I want to know laptop prices at AI Laptop Wala." },
  { label: "🔧 Repair / Home Service", msg: "Hi, I need laptop repair / home service in Indore." },
  { label: "🍎 MacBook Availability", msg: "Hi, is any MacBook available at AI Laptop Wala?" },
  { label: "🎮 Gaming Laptop", msg: "Hi, I'm looking for a gaming laptop in Indore." },
  { label: "📦 Sell My Old Laptop", msg: "Hi, I want to sell my old laptop. Can you give me a price?" },
];

const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 sm:w-80 rounded-2xl shadow-2xl border border-border overflow-hidden bg-card animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">AI Laptop Wala</p>
              <p className="text-[10px] text-white/80">Usually replies within minutes</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-muted/30">
            <div className="bg-card rounded-xl p-3 shadow-sm border border-border/50 mb-4">
              <p className="text-xs font-medium mb-1">👋 Namaste!</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                AI Laptop Wala mein aapka swagat hai! Neeche se select karein ya apna message likhen.
              </p>
            </div>
            <div className="space-y-2">
              {quickMessages.map((qm) => (
                <a key={qm.label} href={`https://wa.me/919893496163?text=${encodeURIComponent(qm.msg)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 w-full text-xs font-medium bg-card hover:bg-green-50 border border-border/50 rounded-xl px-3 py-2.5 transition-colors group">
                  <Send size={11} className="text-[#25D366] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  {qm.label}
                </a>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-border/50">
            <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white hover:bg-[#20b858] transition-colors">
              <MessageCircle size={14} /> Open WhatsApp Chat
            </a>
          </div>
        </div>
      )}

      {/* Pulse button */}
      <button onClick={() => setOpen(!open)} aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform">
        {!open && <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />}
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
};

export default WhatsAppWidget;
