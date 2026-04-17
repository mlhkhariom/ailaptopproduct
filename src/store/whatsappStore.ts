import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AutoReplyRule {
  id: string;
  name: string;
  keywords: string[];
  responseTemplate: string;
  isActive: boolean;
  type: "greeting" | "product" | "order" | "custom";
  matchCount: number;
}

export interface SimulatedMessage {
  id: string;
  text: string;
  time: string;
  fromMe: boolean;
  isBot?: boolean;
}

interface WhatsAppStore {
  rules: AutoReplyRule[];
  simulatedMessages: SimulatedMessage[];
  addRule: (rule: Omit<AutoReplyRule, "id" | "matchCount">) => void;
  updateRule: (id: string, updates: Partial<AutoReplyRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  matchMessage: (message: string) => AutoReplyRule | null;
  addSimulatedMessage: (msg: Omit<SimulatedMessage, "id">) => void;
  clearSimulation: () => void;
}

const defaultRules: AutoReplyRule[] = [
  {
    id: "1",
    name: "Greeting",
    keywords: ["hello", "hi", "namaste", "नमस्ते", "हैलो"],
    responseTemplate: "नमस्ते! 🙏 AI Laptop Wala में आपका स्वागत है। हम आयुर्वेदिक उत्पादों के विशेषज्ञ हैं। कैसे मदद कर सकते हैं?",
    isActive: true,
    type: "greeting",
    matchCount: 45,
  },
  {
    id: "2",
    name: "Price Inquiry",
    keywords: ["price", "rate", "kitna", "कीमत", "दाम", "cost"],
    responseTemplate: "{{product_name}} की कीमत ₹{{price}} है। {{original_price_info}} 🌿\n\nऑर्डर करने के लिए यहां क्लिक करें: ailaptopwala.com/products/{{slug}}",
    isActive: true,
    type: "product",
    matchCount: 32,
  },
  {
    id: "3",
    name: "Order Status",
    keywords: ["order", "status", "track", "tracking", "ऑर्डर", "कहां पहुंचा"],
    responseTemplate: "आपके ऑर्डर {{order_id}} का स्टेटस: {{status}} 📦\n\nट्रैकिंग: {{tracking_id}}\nExpected delivery: 2-3 दिन",
    isActive: true,
    type: "order",
    matchCount: 28,
  },
  {
    id: "4",
    name: "Stock Inquiry",
    keywords: ["stock", "available", "उपलब्ध", "मिलेगा", "hai kya"],
    responseTemplate: "{{product_name}} अभी {{stock_status}} है। {{stock_info}} 🌿",
    isActive: true,
    type: "product",
    matchCount: 15,
  },
  {
    id: "5",
    name: "Thank You",
    keywords: ["thank", "thanks", "धन्यवाद", "शुक्रिया", "shukriya"],
    responseTemplate: "आपका धन्यवाद! 🙏 AI Laptop Wala के साथ जुड़े रहने के लिए शुक्रिया। कोई और मदद चाहिए तो बताइए! 🌿",
    isActive: true,
    type: "greeting",
    matchCount: 22,
  },
];

export const useWhatsAppStore = create<WhatsAppStore>()(
  persist(
    (set, get) => ({
      rules: defaultRules,
      simulatedMessages: [],

      addRule: (rule) => {
        const id = Date.now().toString();
        set((s) => ({ rules: [...s.rules, { ...rule, id, matchCount: 0 }] }));
      },

      updateRule: (id, updates) => {
        set((s) => ({
          rules: s.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      deleteRule: (id) => {
        set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }));
      },

      toggleRule: (id) => {
        set((s) => ({
          rules: s.rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
        }));
      },

      matchMessage: (message) => {
        const lower = message.toLowerCase();
        const activeRules = get().rules.filter((r) => r.isActive);
        for (const rule of activeRules) {
          if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
            set((s) => ({
              rules: s.rules.map((r) =>
                r.id === rule.id ? { ...r, matchCount: r.matchCount + 1 } : r
              ),
            }));
            return rule;
          }
        }
        return null;
      },

      addSimulatedMessage: (msg) => {
        const id = Date.now().toString();
        set((s) => ({
          simulatedMessages: [...s.simulatedMessages, { ...msg, id }],
        }));
      },

      clearSimulation: () => set({ simulatedMessages: [] }),
    }),
    { name: "ailaptopwala-whatsapp" }
  )
);
