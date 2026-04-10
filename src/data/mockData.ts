export interface Product {
  id: string;
  name: string;
  nameHi?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  inStock: boolean;
  stock: number;
  sku: string;
  slug: string;
  reels: ProductReel[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string[];
  precautions?: string;
  status: "active" | "draft";
}

export interface ProductReel {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  platform: "instagram" | "youtube" | "facebook";
  views: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  tax: number;
  shipping: number;
  subtotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'paid' | 'failed' | 'refunded' | 'pending';
  paymentMethod: string;
  razorpayId?: string;
  date: string;
  address: string;
  billingAddress?: string;
  trackingId?: string;
  courierPartner?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lifetimeValue: number;
  lastOrder: string;
  joinDate: string;
  city: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  status: "published" | "draft";
  metaTitle?: string;
  metaDescription?: string;
  linkedProducts?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  productCount: number;
  metaDescription?: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  location: string;
}

export interface SocialPost {
  id: number;
  platform: string;
  product: string;
  caption: string;
  status: "published" | "scheduled" | "draft" | "failed";
  date: string;
  likes: number;
  views: string;
  comments: number;
  shares: number;
  embedOnWebsite: boolean;
}

const makeReels = (productName: string, thumbBase: number): ProductReel[] => [
  { id: "r1", title: `${productName} - कैसे इस्तेमाल करें`, thumbnail: `https://images.unsplash.com/photo-${thumbBase}?w=300&h=500&fit=crop`, videoUrl: "#", platform: "instagram", views: "12.5K" },
  { id: "r2", title: `${productName} के फायदे जानिये`, thumbnail: `https://images.unsplash.com/photo-${thumbBase + 1000}?w=300&h=500&fit=crop`, videoUrl: "#", platform: "youtube", views: "8.2K" },
  { id: "r3", title: `Customer Review - ${productName}`, thumbnail: `https://images.unsplash.com/photo-${thumbBase + 2000}?w=300&h=500&fit=crop`, videoUrl: "#", platform: "instagram", views: "5.7K" },
];

export const products: Product[] = [
  {
    id: "1", name: "Ashwagandha Root Powder", nameHi: "अश्वगंधा चूर्ण", price: 599, originalPrice: 799,
    image: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400&h=400&fit=crop",
    category: "जड़ी-बूटी (Herbs)", rating: 4.8, reviews: 234, stock: 45, sku: "APC-ASH-001", slug: "ashwagandha-churna", status: "active",
    description: "शुद्ध जैविक अश्वगंधा चूर्ण। तनाव कम करने और ऊर्जा बढ़ाने में सहायक।",
    ingredients: ["100% Organic Ashwagandha Root (Withania somnifera) - शुद्ध अश्वगंधा जड़"],
    benefits: ["तनाव और चिंता कम करे", "ऊर्जा और स्टैमिना बढ़ाये", "इम्युनिटी मजबूत करे", "नींद में सुधार"],
    usage: "आधा चम्मच गर्म दूध या पानी में मिलाकर दिन में दो बार लें।",
    precautions: "गर्भवती महिलाएं चिकित्सक की सलाह से लें।",
    metaTitle: "Ashwagandha Powder – Buy Organic | Apsoncure PHC",
    metaDescription: "शुद्ध जैविक अश्वगंधा चूर्ण। तनाव, ऊर्जा, इम्युनिटी के लिए।",
    focusKeywords: ["ashwagandha", "अश्वगंधा", "stress relief"],
    inStock: true, reels: makeReels("Ashwagandha", 1515377905703),
  },
  {
    id: "2", name: "Triphala Capsules", nameHi: "त्रिफला कैप्सूल", price: 449, originalPrice: 599,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    category: "कैप्सूल (Capsules)", rating: 4.6, reviews: 189, stock: 3, sku: "APC-TRI-002", slug: "triphala-capsules", status: "active",
    description: "पारंपरिक त्रिफला मिश्रण कैप्सूल में। पाचन के लिए सर्वोत्तम।",
    ingredients: ["आंवला (Amla)", "बहेड़ा (Bibhitaki)", "हरड़ (Haritaki)"],
    benefits: ["पाचन सुधारे", "शरीर की सफाई", "एंटीऑक्सीडेंट से भरपूर", "पेट स्वास्थ्य"],
    usage: "रात को सोने से पहले गर्म पानी के साथ 2 कैप्सूल लें।",
    inStock: true, stock: 3, reels: makeReels("Triphala", 1556228578000), status: "active", sku: "APC-TRI-002", slug: "triphala-capsules",
  },
  {
    id: "3", name: "Kumkumadi Face Oil", nameHi: "कुमकुमादि तेल", price: 1299, originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    category: "त्वचा देखभाल (Skin Care)", rating: 4.9, reviews: 312, stock: 28, sku: "APC-KUM-003", slug: "kumkumadi-face-oil", status: "active",
    description: "प्रीमियम कुमकुमादि तैलम – आयुर्वेदिक स्किनकेयर का स्वर्ण मानक।",
    ingredients: ["केसर (Saffron)", "चंदन (Sandalwood)", "कमल (Lotus)", "खस (Vetiver)", "मंजिष्ठा (Manjistha)", "तिल तेल (Sesame Oil)"],
    benefits: ["रंग निखारे", "दाग-धब्बे कम करे", "एंटी-एजिंग", "गहरा पोषण"],
    usage: "रात को साफ चेहरे पर 3-4 बूंदें लगाएं।",
    inStock: true, reels: makeReels("Kumkumadi Oil", 1608571423902),
  },
  {
    id: "4", name: "Brahmi Memory Tonic", nameHi: "ब्राह्मी स्मृति टॉनिक", price: 399,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    category: "टॉनिक (Tonics)", rating: 4.5, reviews: 156, stock: 60, sku: "APC-BRA-004", slug: "brahmi-memory-tonic", status: "active",
    description: "क्लासिकल ब्राह्मी फॉर्मूला – याददाश्त और दिमागी शक्ति बढ़ाने के लिए।",
    ingredients: ["ब्राह्मी (Bacopa monnieri)", "शंखपुष्पी (Shankhpushpi)", "ज्योतिष्मती (Jyotishmati)", "शहद (Honey base)"],
    benefits: ["याददाश्त बढ़ाये", "एकाग्रता सुधारे", "मन शांत करे", "पढ़ाई में मदद"],
    usage: "10ml दिन में दो बार पानी के साथ लें।",
    inStock: true, reels: makeReels("Brahmi Tonic", 1587854692152),
  },
  {
    id: "5", name: "Chyawanprash Premium", nameHi: "च्यवनप्राश प्रीमियम", price: 549, originalPrice: 699,
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop",
    category: "इम्युनिटी (Immunity)", rating: 4.7, reviews: 278, stock: 4, sku: "APC-CHY-005", slug: "chyawanprash-premium", status: "active",
    description: "48 जड़ी-बूटियों और आंवले से बना पारंपरिक च्यवनप्राश।",
    ingredients: ["आंवला (Amla)", "अश्वगंधा", "पिप्पली", "घी (Ghee)", "शहद (Honey)", "40+ जड़ी-बूटियाँ"],
    benefits: ["इम्युनिटी बढ़ाये", "विटामिन C से भरपूर", "श्वसन स्वास्थ्य", "एंटी-एजिंग"],
    usage: "रोज सुबह 1-2 चम्मच गर्म दूध के साथ लें।",
    inStock: true, reels: makeReels("Chyawanprash", 1505751172876),
  },
  {
    id: "6", name: "Neem & Turmeric Soap", nameHi: "नीम हल्दी साबुन", price: 199,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop",
    category: "त्वचा देखभाल (Skin Care)", rating: 4.4, reviews: 145, stock: 120, sku: "APC-NTS-006", slug: "neem-turmeric-soap", status: "active",
    description: "हाथ से बना आयुर्वेदिक साबुन – नीम और हल्दी के गुणों से भरपूर।",
    ingredients: ["नीम अर्क (Neem)", "हल्दी (Turmeric)", "नारियल तेल (Coconut oil)", "एलोवेरा (Aloe vera)"],
    benefits: ["एंटीबैक्टीरियल", "त्वचा साफ करे", "प्राकृतिक नमी", "कोमल सफाई"],
    usage: "नहाते समय गीली त्वचा पर लगाएं।",
    inStock: true, reels: makeReels("Neem Turmeric Soap", 1600857544200),
  },
  {
    id: "7", name: "Tulsi Green Tea", nameHi: "तुलसी ग्रीन टी", price: 349,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop",
    category: "चाय (Teas)", rating: 4.6, reviews: 203, stock: 85, sku: "APC-TGT-007", slug: "tulsi-green-tea", status: "active",
    description: "ऑर्गेनिक तुलसी युक्त ग्रीन टी – रोज़ की तंदुरुस्ती के लिए।",
    ingredients: ["ग्रीन टी पत्तियां", "तुलसी (Holy Basil)", "लेमनग्रास", "अदरक (Ginger)"],
    benefits: ["इम्युनिटी बढ़ाये", "पाचन में मदद", "तनाव कम करे", "एंटीऑक्सीडेंट"],
    usage: "एक टी बैग को गर्म पानी में 3-5 मिनट डुबोएं।",
    inStock: true, reels: makeReels("Tulsi Tea", 1556881286000),
  },
  {
    id: "8", name: "Bhringraj Hair Oil", nameHi: "भृंगराज केश तेल", price: 499, originalPrice: 649,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
    category: "बालों की देखभाल (Hair Care)", rating: 4.7, reviews: 267, stock: 0, sku: "APC-BHO-008", slug: "bhringraj-hair-oil", status: "active",
    description: "पारंपरिक भृंगराज तेल – बालों को घना और मजबूत बनाये।",
    ingredients: ["भृंगराज (Bhringraj)", "आंवला (Amla)", "नारियल तेल (Coconut oil)", "ब्राह्मी", "गुड़हल (Hibiscus)"],
    benefits: ["बाल उगाये", "सफेद बाल रोके", "झड़ना कम करे", "स्कैल्प पोषण"],
    usage: "तेल हल्का गर्म करें, स्कैल्प पर मालिश करें।",
    inStock: false, reels: makeReels("Bhringraj Oil", 1535585209827),
  },
];

export const categories: string[] = [
  "All",
  "जड़ी-बूटी (Herbs)",
  "कैप्सूल (Capsules)",
  "त्वचा देखभाल (Skin Care)",
  "बालों की देखभाल (Hair Care)",
  "टॉनिक (Tonics)",
  "इम्युनिटी (Immunity)",
  "चाय (Teas)",
];

export const categoryList: Category[] = [
  { id: "1", name: "जड़ी-बूटी", nameEn: "Herbs", slug: "herbs", productCount: 1, metaDescription: "शुद्ध आयुर्वेदिक जड़ी-बूटी प्रोडक्ट्स", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300" },
  { id: "2", name: "कैप्सूल", nameEn: "Capsules", slug: "capsules", productCount: 1, metaDescription: "आयुर्वेदिक कैप्सूल और गोलियां" },
  { id: "3", name: "त्वचा देखभाल", nameEn: "Skin Care", slug: "skin-care", productCount: 2, metaDescription: "प्राकृतिक त्वचा देखभाल उत्पाद" },
  { id: "4", name: "बालों की देखभाल", nameEn: "Hair Care", slug: "hair-care", productCount: 1, metaDescription: "आयुर्वेदिक बाल देखभाल" },
  { id: "5", name: "टॉनिक", nameEn: "Tonics", slug: "tonics", productCount: 1 },
  { id: "6", name: "इम्युनिटी", nameEn: "Immunity", slug: "immunity", productCount: 1, metaDescription: "इम्युनिटी बूस्टर प्रोडक्ट्स" },
  { id: "7", name: "चाय", nameEn: "Teas", slug: "teas", productCount: 1, metaDescription: "हर्बल और आयुर्वेदिक चाय" },
];

export const orders: Order[] = [
  { id: "APC-001", customer: "प्रिया शर्मा (Priya Sharma)", email: "priya@email.com", phone: "+91 98765 43210", items: [{ productId: "1", name: "Ashwagandha Root Powder", quantity: 2, price: 599 }], subtotal: 1198, tax: 96, shipping: 0, total: 1294, status: "delivered", paymentStatus: "paid", paymentMethod: "Razorpay", razorpayId: "pay_N1x2y3z4A5B6C7", date: "2024-01-15", address: "A-12, Andheri West, मुंबई, महाराष्ट्र 400058", trackingId: "DTDC123456789", courierPartner: "DTDC" },
  { id: "APC-002", customer: "राहुल वर्मा (Rahul Verma)", email: "rahul@email.com", phone: "+91 87654 32109", items: [{ productId: "3", name: "Kumkumadi Face Oil", quantity: 1, price: 1299 }, { productId: "6", name: "Neem & Turmeric Soap", quantity: 3, price: 199 }], subtotal: 1896, tax: 152, shipping: 50, total: 2098, status: "shipped", paymentStatus: "paid", paymentMethod: "UPI", razorpayId: "pay_M9x8y7z6W5V4", date: "2024-01-18", address: "B-45, Dwarka Sector 12, दिल्ली 110078", trackingId: "BLUEDART987654", courierPartner: "BlueDart" },
  { id: "APC-003", customer: "अनीता देसाई (Anita Desai)", email: "anita@email.com", phone: "+91 76543 21098", items: [{ productId: "5", name: "Chyawanprash Premium", quantity: 1, price: 549 }], subtotal: 549, tax: 44, shipping: 50, total: 643, status: "pending", paymentStatus: "pending", paymentMethod: "COD", date: "2024-01-20", address: "45, Koramangala, बैंगलोर 560034" },
  { id: "APC-004", customer: "विक्रम सिंह (Vikram Singh)", email: "vikram@email.com", phone: "+91 99887 76655", items: [{ productId: "2", name: "Triphala Capsules", quantity: 2, price: 449 }, { productId: "7", name: "Tulsi Green Tea", quantity: 1, price: 349 }], subtotal: 1247, tax: 100, shipping: 0, total: 1347, status: "processing", paymentStatus: "paid", paymentMethod: "Razorpay", razorpayId: "pay_K5x4y3z2Q1P0", date: "2024-01-21", address: "C-78, Malviya Nagar, जयपुर 302017" },
  { id: "APC-005", customer: "मीरा पटेल (Meera Patel)", email: "meera@email.com", phone: "+91 88776 65544", items: [{ productId: "4", name: "Brahmi Memory Tonic", quantity: 1, price: 399 }], subtotal: 399, tax: 32, shipping: 50, total: 481, status: "delivered", paymentStatus: "paid", paymentMethod: "UPI", date: "2024-01-10", address: "D-90, Satellite, अहमदाबाद 380015" },
  { id: "APC-006", customer: "अर्जुन नायर (Arjun Nair)", email: "arjun@email.com", phone: "+91 77665 54433", items: [{ productId: "8", name: "Bhringraj Hair Oil", quantity: 2, price: 499 }], subtotal: 998, tax: 80, shipping: 0, total: 1078, status: "shipped", paymentStatus: "paid", paymentMethod: "Razorpay", razorpayId: "pay_J8x7y6z5R4S3", date: "2024-01-19", address: "E-22, Kakkanad, कोच्चि 682030", trackingId: "DELHIVERY456789", courierPartner: "Delhivery" },
  { id: "APC-007", customer: "सुनीता गुप्ता (Sunita Gupta)", email: "sunita@email.com", phone: "+91 66554 43322", items: [{ productId: "1", name: "Ashwagandha Root Powder", quantity: 1, price: 599 }, { productId: "5", name: "Chyawanprash Premium", quantity: 2, price: 549 }], subtotal: 1697, tax: 136, shipping: 0, total: 1833, status: "pending", paymentStatus: "failed", paymentMethod: "Razorpay", date: "2024-01-22", address: "F-33, Gomti Nagar, लखनऊ 226010" },
];

export const customers: Customer[] = [
  { id: "1", name: "प्रिया शर्मा", email: "priya@email.com", phone: "+91 98765 43210", totalOrders: 5, lifetimeValue: 6470, lastOrder: "2024-01-15", joinDate: "2023-06-10", city: "मुंबई" },
  { id: "2", name: "राहुल वर्मा", email: "rahul@email.com", phone: "+91 87654 32109", totalOrders: 3, lifetimeValue: 4290, lastOrder: "2024-01-18", joinDate: "2023-08-22", city: "दिल्ली" },
  { id: "3", name: "अनीता देसाई", email: "anita@email.com", phone: "+91 76543 21098", totalOrders: 2, lifetimeValue: 1192, lastOrder: "2024-01-20", joinDate: "2023-11-05", city: "बैंगलोर" },
  { id: "4", name: "विक्रम सिंह", email: "vikram@email.com", phone: "+91 99887 76655", totalOrders: 4, lifetimeValue: 3890, lastOrder: "2024-01-21", joinDate: "2023-07-15", city: "जयपुर" },
  { id: "5", name: "मीरा पटेल", email: "meera@email.com", phone: "+91 88776 65544", totalOrders: 1, lifetimeValue: 481, lastOrder: "2024-01-10", joinDate: "2024-01-08", city: "अहमदाबाद" },
  { id: "6", name: "अर्जुन नायर", email: "arjun@email.com", phone: "+91 77665 54433", totalOrders: 6, lifetimeValue: 8540, lastOrder: "2024-01-19", joinDate: "2023-04-20", city: "कोच्चि" },
  { id: "7", name: "सुनीता गुप्ता", email: "sunita@email.com", phone: "+91 66554 43322", totalOrders: 2, lifetimeValue: 2450, lastOrder: "2024-01-22", joinDate: "2023-09-12", city: "लखनऊ" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1", title: "अश्वगंधा के चमत्कारी फायदे – The Ancient Wisdom of Ashwagandha", slug: "ashwagandha-benefits",
    excerpt: "जानिए कैसे यह शक्तिशाली जड़ी-बूटी 3000 सालों से तनाव कम करने और ताकत बढ़ाने में काम आ रही है।",
    content: "अश्वगंधा, आयुर्वेद की सबसे महत्वपूर्ण जड़ी-बूटियों में से एक है...",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=400&fit=crop",
    author: "डॉ. प्राची (Dr. Prachi)", date: "2024-01-15", category: "जड़ी-बूटी", readTime: "5 मिनट", status: "published",
    metaTitle: "अश्वगंधा के फायदे | Apsoncure PHC Blog", linkedProducts: ["1"],
  },
  {
    id: "2", title: "दिनचर्या – Morning Rituals for Modern Life", slug: "dincharya-morning-rituals",
    excerpt: "आयुर्वेदिक सुबह की दिनचर्या को अपनी व्यस्त ज़िंदगी में कैसे शामिल करें।",
    content: "दिनचर्या आयुर्वेदिक जीवनशैली की नींव है...",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop",
    author: "डॉ. प्राची (Dr. Prachi)", date: "2024-01-10", category: "जीवनशैली", readTime: "7 मिनट", status: "published",
    linkedProducts: ["5", "7"],
  },
  {
    id: "3", title: "आयुर्वेदिक स्किनकेयर – चमकती त्वचा का प्राकृतिक रास्ता", slug: "ayurvedic-skincare-guide",
    excerpt: "समय-परीक्षित आयुर्वेदिक सामग्रियों से पाएं निखरी और स्वस्थ त्वचा।",
    content: "आयुर्वेदिक स्किनकेयर सतही उपचार से कहीं आगे है...",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=400&fit=crop",
    author: "वैद्य मीरा जोशी", date: "2024-01-05", category: "त्वचा देखभाल", readTime: "6 मिनट", status: "published",
    linkedProducts: ["3", "6"],
  },
  {
    id: "4", title: "अपनी प्रकृति पहचानें – Understanding Vata, Pitta, Kapha", slug: "prakriti-dosha-guide",
    excerpt: "आयुर्वेद के अनुसार अपनी शरीर प्रकृति (दोष) को समझने की पूरी गाइड।",
    content: "आयुर्वेद में हर व्यक्ति की एक अद्वितीय प्रकृति होती है...",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
    author: "डॉ. प्राची (Dr. Prachi)", date: "2024-01-01", category: "शिक्षा", readTime: "8 मिनट", status: "draft",
  },
];

export const socialPosts: SocialPost[] = [
  { id: 1, platform: "Instagram", product: "Ashwagandha Root Powder", caption: "अश्वगंधा के फायदे जानिये 🌿", status: "published", date: "2024-01-18", likes: 234, views: "12.5K", comments: 45, shares: 23, embedOnWebsite: true },
  { id: 2, platform: "Facebook", product: "Kumkumadi Face Oil", caption: "चमकती त्वचा का राज ✨", status: "scheduled", date: "2024-01-22", likes: 0, views: "—", comments: 0, shares: 0, embedOnWebsite: false },
  { id: 3, platform: "Instagram", product: "Chyawanprash Premium", caption: "इम्युनिटी बूस्ट करें 💪", status: "draft", date: "2024-01-25", likes: 0, views: "—", comments: 0, shares: 0, embedOnWebsite: false },
  { id: 4, platform: "YouTube", product: "Bhringraj Hair Oil", caption: "बालों को बनाएं मजबूत 💇‍♀️", status: "published", date: "2024-01-16", likes: 189, views: "8.7K", comments: 32, shares: 15, embedOnWebsite: true },
  { id: 5, platform: "Instagram", product: "Triphala Capsules", caption: "पाचन सुधारें प्राकृतिक तरीके से 🍃", status: "failed", date: "2024-01-19", likes: 0, views: "—", comments: 0, shares: 0, embedOnWebsite: false },
];

export const testimonials: Testimonial[] = [
  { id: "1", name: "प्रिया शर्मा", text: "Apsoncure का अश्वगंधा पाउडर कमाल का है! मेरा तनाव बहुत कम हो गया!", rating: 5, avatar: "प्रि", location: "मुंबई" },
  { id: "2", name: "राजेश कुमार", text: "कुमकुमादि तेल ने सिर्फ 3 हफ्तों में मेरी त्वचा बदल दी। बहुत प्रीमियम क्वालिटी!", rating: 5, avatar: "रा", location: "दिल्ली" },
  { id: "3", name: "अनन्या पटेल", text: "त्रिफला कैप्सूल 2 महीने से ले रही हूं, पाचन में गजब का सुधार हुआ।", rating: 4, avatar: "अ", location: "बैंगलोर" },
  { id: "4", name: "विक्रम देसाई", text: "च्यवनप्राश बिल्कुल दादी-नानी वाला स्वाद! असली और शुद्ध।", rating: 5, avatar: "वि", location: "पुणे" },
];

export const salesData = [
  { month: "जुला", sales: 35000, orders: 45 },
  { month: "अग", sales: 42000, orders: 52 },
  { month: "सित", sales: 38000, orders: 48 },
  { month: "अक्टू", sales: 55000, orders: 67 },
  { month: "नव", sales: 62000, orders: 78 },
  { month: "दिस", sales: 78000, orders: 95 },
  { month: "जन", sales: 71000, orders: 88 },
];

export const categoryData = [
  { name: "जड़ी-बूटी", value: 30, fill: "hsl(120, 37%, 25%)" },
  { name: "त्वचा देखभाल", value: 25, fill: "hsl(28, 52%, 64%)" },
  { name: "कैप्सूल", value: 18, fill: "hsl(90, 15%, 53%)" },
  { name: "इम्युनिटी", value: 15, fill: "hsl(40, 33%, 70%)" },
  { name: "अन्य", value: 12, fill: "hsl(20, 33%, 50%)" },
];

export const whatsappTemplates = [
  { id: "1", name: "प्रोडक्ट पूछताछ", message: "नमस्ते! मुझे {{product_name}} के बारे में जानकारी चाहिए। कृपया इसके फायदे और उपयोग बताएं। 🌿", variables: ["product_name"] },
  { id: "2", name: "ऑर्डर स्टेटस", message: "नमस्ते! मेरे ऑर्डर {{order_id}} का स्टेटस क्या है? धन्यवाद! 📦", variables: ["order_id"] },
  { id: "3", name: "डॉक्टर से सलाह", message: "नमस्ते डॉक्टर प्राची! मुझे {{health_concern}} के बारे में सलाह चाहिए। कब मिल सकते हैं? 🙏", variables: ["health_concern"] },
  { id: "4", name: "थोक ऑर्डर", message: "नमस्ते! {{product_name}} का बल्क ऑर्डर देना है। मात्रा: {{quantity}}। कृपया रेट बताएं। 📋", variables: ["product_name", "quantity"] },
  { id: "5", name: "शिपिंग अपडेट", message: "नमस्ते {{customer_name}}! आपका ऑर्डर {{order_id}} भेज दिया गया है। ट्रैकिंग: {{tracking_id}} 🚚", variables: ["customer_name", "order_id", "tracking_id"] },
  { id: "6", name: "पेमेंट रिमाइंडर", message: "नमस्ते {{customer_name}}! आपके ऑर्डर {{order_id}} का भुगतान अभी बाकी है। कृपया जल्द भुगतान करें। 💳", variables: ["customer_name", "order_id"] },
];
