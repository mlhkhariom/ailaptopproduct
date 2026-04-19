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
      headingHighlight: "AI Laptop Wala",
      subtitle: "Authentic Laptop products by AI Laptop Wala Store. 5000 years of wisdom in pure, natural products.",
      subtext: "Transform your health naturally with certified Laptop remedies.",
      ctaText: "Shop Now",
      ctaLink: "/products",
      secondaryCtaText: "💬 Talk to Doctor",
      secondaryCtaLink: "https://wa.me/919893496163?text=Hi! I need help with laptop.",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=500&fit=crop",
      badgeText: "4.8/5 Rating",
      badgeSubtext: "5000+ Happy Customers",
      active: true,
    },
  ],
  benefits: [
    { id: "1", icon: "Laptop", title: "Certified Refurbished", description: "Every laptop tested & certified. Grade A quality guaranteed.", active: true },
    { id: "2", icon: "Shield", title: "6 Month Warranty", description: "All products come with 6 month warranty. Free repair if any issue.", active: true },
    { id: "3", icon: "Truck", title: "Free Delivery Indore", description: "Free home delivery in Indore. Pan-India shipping available.", active: true },
    { id: "4", icon: "Wrench", title: "Expert Repair", description: "Same day repair for all brands. Screen, battery, keyboard & more.", active: true },
  ],
  testimonials: [
    { id: "1", name: "Rahul Sharma", text: "MacBook Pro open-box liya AI Laptop Wala se — bilkul naya condition mein mila at 40% discount! Best deal ever. Highly recommended!", rating: 5, avatar: "RS", location: "Indore", active: true },
    { id: "2", name: "Priya Patel", text: "Refurbished laptop liya budget mein — ekdum smooth chalti hai. Nitin bhaiya ne bahut acha guide kiya. Thank you AI Laptop Wala!", rating: 5, avatar: "PP", location: "Indore", active: true },
    { id: "3", name: "Amit Verma", text: "Office ke liye 5 laptops liye bulk mein. Sabka condition excellent tha aur price bhi market se kaafi kam. After-sales support bhi zabardast!", rating: 5, avatar: "AV", location: "Indore", active: true },
    { id: "4", name: "Sneha Joshi", text: "Gaming laptop liya content creation ke liye — RTX wala. Performance outstanding hai aur Bhagwan Das Asati ji ne personally setup karke diya.", rating: 5, avatar: "SJ", location: "Indore", active: true },
    { id: "5", name: "Vikram Singh", text: "Home repair service use ki — screen replacement ke liye. Technician ghar aaya, 1 ghante mein fix kar diya. Very professional service!", rating: 5, avatar: "VS", location: "Indore", active: true },
    { id: "6", name: "Anita Gupta", text: "Refurbished desktop liya online classes ke liye. Bahut smooth run hota hai. Price bhi pocket-friendly tha. Thank you team!", rating: 4, avatar: "AG", location: "Indore", active: true },
  ],
  faqs: [
    { id: "1", question: "Are refurbished laptops reliable?", answer: "Yes! All our laptops are thoroughly tested, cleaned and certified before sale. We provide 6 month warranty on every product. Grade A quality guaranteed.", category: "Products", active: true, order: 1 },
    { id: "2", question: "How long does repair take?", answer: "Most repairs are done same day — screen replacement, battery, keyboard, RAM/SSD upgrade. Complex repairs like motherboard may take 2-3 days.", category: "Repair", active: true, order: 2 },
    { id: "3", question: "Do you offer home pickup for repair?", answer: "Yes! We offer free home pickup and delivery for repair in Indore city. Call or WhatsApp us at +91 98934 96163 to schedule.", category: "Repair", active: true, order: 3 },
    { id: "4", question: "What payment methods do you accept?", answer: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and Cash on Delivery via Razorpay payment gateway.", category: "Payment", active: true, order: 4 },
    { id: "5", question: "Can I return a product?", answer: "Yes, you can return within 7 days if the product has any defect. Contact us via WhatsApp with your Order ID and photos.", category: "Returns", active: true, order: 5 },
    { id: "6", question: "Do you buy old laptops?", answer: "Yes! We buy old laptops, MacBooks and desktops. WhatsApp us photos and we'll give you the best price. Visit our store at Silver Mall, Indore.", category: "Sell", active: true, order: 6 },
    { id: "7", question: "How do I track my order?", answer: "Once shipped, you'll receive a tracking ID via WhatsApp and SMS. You can also track at ailaptopwala.com/track-order.", category: "Shipping", active: true, order: 7 },
    { id: "8", question: "Where is your store located?", answer: "LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001. Open Mon-Sat 10AM-8PM. Call: +91 98934 96163.", category: "Store", active: true, order: 8 },
  ],
  siteSettings: {
    storeName: "AI Laptop Wala",
    tagline: "Buy, Sell & Repair Laptops in Indore",
    phone: "+91 98934 96163",
    email: "contact@ailaptopwala.com",
    whatsappNumber: "919893496163",
    address: "LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001",
    address2: "21, G3, Sai Residency, Near Bangali Chouraha, Indore, MP 452016",
    workingHours: "Mon-Sat: 10 AM – 8 PM",
    footerText: "Indore's most trusted laptop store since 2011. Certified refurbished laptops & expert repair.",
    announcementBar: "💻 AI Laptop Wala — Indore's #1 Laptop Store | Free Delivery in Indore | ☎ +91 98934 96163",
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
