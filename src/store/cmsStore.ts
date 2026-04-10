import { create } from "zustand";

export interface HeroBanner {
  id: string;
  tagline: string;
  heading: string;
  headingHighlight: string;
  subtitle: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
  badgeText: string;
  badgeSubtext: string;
  active: boolean;
}

export interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  active: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  location: string;
  active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  order: number;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  address: string;
  workingHours: string;
  footerText: string;
  announcementBar: string;
  announcementActive: boolean;
}

interface CMSStore {
  heroBanners: HeroBanner[];
  benefits: BenefitItem[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
  siteSettings: SiteSettings;
  updateHeroBanner: (id: string, data: Partial<HeroBanner>) => void;
  addHeroBanner: (banner: HeroBanner) => void;
  deleteHeroBanner: (id: string) => void;
  updateBenefit: (id: string, data: Partial<BenefitItem>) => void;
  addBenefit: (benefit: BenefitItem) => void;
  deleteBenefit: (id: string) => void;
  updateTestimonial: (id: string, data: Partial<TestimonialItem>) => void;
  addTestimonial: (testimonial: TestimonialItem) => void;
  deleteTestimonial: (id: string) => void;
  updateFAQ: (id: string, data: Partial<FAQItem>) => void;
  addFAQ: (faq: FAQItem) => void;
  deleteFAQ: (id: string) => void;
  updateSiteSettings: (data: Partial<SiteSettings>) => void;
}

export const useCMSStore = create<CMSStore>((set) => ({
  heroBanners: [
    {
      id: "1",
      tagline: "🌿 प्राचीन आयुर्वेद, आधुनिक स्वास्थ्य",
      heading: "– प्रकृति से स्वास्थ्य",
      headingHighlight: "Apsoncure",
      subtitle: "Authentic Ayurvedic products by Prachi Homeo Clinic. 5000 years of wisdom in pure, natural products.",
      subtext: "Transform your health naturally with certified Ayurvedic remedies.",
      ctaText: "Shop Now",
      ctaLink: "/products",
      secondaryCtaText: "💬 Talk to Doctor",
      secondaryCtaLink: "https://wa.me/919876543210?text=Hi Doctor! I need Ayurvedic consultation.",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=500&fit=crop",
      badgeText: "4.8/5 Rating",
      badgeSubtext: "5000+ Happy Customers",
      active: true,
    },
  ],
  benefits: [
    { id: "1", icon: "Leaf", title: "100% Pure & Natural", description: "Pure herbs sourced from Indian organic farms", active: true },
    { id: "2", icon: "Award", title: "Certified Quality", description: "Based on Ayurvedic scriptures and modern research", active: true },
    { id: "3", icon: "Truck", title: "Free Delivery", description: "Pan-India free shipping on orders above ₹499", active: true },
    { id: "4", icon: "HeartPulse", title: "Expert Guidance", description: "Free consultation with Dr. Prachi via WhatsApp", active: true },
  ],
  testimonials: [
    { id: "1", name: "Priya Sharma", text: "Apsoncure's Ashwagandha powder is amazing! My stress levels dropped significantly!", rating: 5, avatar: "PS", location: "Mumbai", active: true },
    { id: "2", name: "Rajesh Kumar", text: "Kumkumadi oil transformed my skin in just 3 weeks. Premium quality!", rating: 5, avatar: "RK", location: "Delhi", active: true },
    { id: "3", name: "Ananya Patel", text: "Been taking Triphala capsules for 2 months, digestion improved dramatically.", rating: 4, avatar: "AP", location: "Bangalore", active: true },
    { id: "4", name: "Vikram Desai", text: "Chyawanprash tastes just like grandma used to make! Authentic and pure.", rating: 5, avatar: "VD", location: "Pune", active: true },
  ],
  faqs: [
    { id: "1", question: "Are your products 100% natural?", answer: "Yes, all Apsoncure products are made from 100% natural, organic herbs sourced from certified Indian farms. We use no synthetic chemicals, preservatives, or artificial additives.", category: "Products", active: true, order: 1 },
    { id: "2", question: "How long does delivery take?", answer: "Metro cities: 3-5 business days. Tier 2 cities: 5-7 days. Remote areas: 7-10 days. Free shipping on orders above ₹499.", category: "Shipping", active: true, order: 2 },
    { id: "3", question: "Can I return a product?", answer: "Yes, you can return unused and unopened products within 7 days of delivery. Contact us via WhatsApp or email with your Order ID and product photos.", category: "Returns", active: true, order: 3 },
    { id: "4", question: "Do you offer Cash on Delivery?", answer: "Yes, COD is available on select pin codes for orders up to ₹5,000. A ₹30 COD handling fee applies.", category: "Payment", active: true, order: 4 },
    { id: "5", question: "Can I consult a doctor before buying?", answer: "Absolutely! Dr. Prachi offers free WhatsApp consultations. Just click 'Talk to Doctor' on any page or message us at +91 98765 43210.", category: "Consultation", active: true, order: 5 },
    { id: "6", question: "Are these products safe during pregnancy?", answer: "Some Ayurvedic products may not be suitable during pregnancy. We strongly recommend consulting Dr. Prachi or your healthcare provider before use.", category: "Products", active: true, order: 6 },
    { id: "7", question: "What payment methods do you accept?", answer: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and Cash on Delivery via Razorpay payment gateway.", category: "Payment", active: true, order: 7 },
    { id: "8", question: "How do I track my order?", answer: "Once shipped, you'll receive a tracking ID via WhatsApp and SMS. You can also contact us for real-time status updates.", category: "Shipping", active: true, order: 8 },
  ],
  siteSettings: {
    storeName: "Apsoncure PHC",
    tagline: "Prachi Homeo Clinic",
    phone: "+91 98765 43210",
    email: "hello@apsoncure.com",
    whatsappNumber: "919876543210",
    address: "Prachi Homeo Clinic, India",
    workingHours: "Mon-Sat: 9 AM – 7 PM",
    footerText: "Pure, Authentic & Trusted Ayurvedic Products. Ancient wisdom for modern health.",
    announcementBar: "🌿 Apsoncure PHC – Prachi Homeo Clinic | Free Delivery above ₹499 | ☎ +91 98765 43210",
    announcementActive: true,
  },

  updateHeroBanner: (id, data) => set((s) => ({ heroBanners: s.heroBanners.map((h) => h.id === id ? { ...h, ...data } : h) })),
  addHeroBanner: (banner) => set((s) => ({ heroBanners: [...s.heroBanners, banner] })),
  deleteHeroBanner: (id) => set((s) => ({ heroBanners: s.heroBanners.filter((h) => h.id !== id) })),

  updateBenefit: (id, data) => set((s) => ({ benefits: s.benefits.map((b) => b.id === id ? { ...b, ...data } : b) })),
  addBenefit: (benefit) => set((s) => ({ benefits: [...s.benefits, benefit] })),
  deleteBenefit: (id) => set((s) => ({ benefits: s.benefits.filter((b) => b.id !== id) })),

  updateTestimonial: (id, data) => set((s) => ({ testimonials: s.testimonials.map((t) => t.id === id ? { ...t, ...data } : t) })),
  addTestimonial: (testimonial) => set((s) => ({ testimonials: [...s.testimonials, testimonial] })),
  deleteTestimonial: (id) => set((s) => ({ testimonials: s.testimonials.filter((t) => t.id !== id) })),

  updateFAQ: (id, data) => set((s) => ({ faqs: s.faqs.map((f) => f.id === id ? { ...f, ...data } : f) })),
  addFAQ: (faq) => set((s) => ({ faqs: [...s.faqs, faq] })),
  deleteFAQ: (id) => set((s) => ({ faqs: s.faqs.filter((f) => f.id !== id) })),

  updateSiteSettings: (data) => set((s) => ({ siteSettings: { ...s.siteSettings, ...data } })),
}));
