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
  reels: ProductReel[];
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
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
  address: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  location: string;
}

const makeReels = (productName: string, thumbBase: number): ProductReel[] => [
  { id: "r1", title: `${productName} - कैसे इस्तेमाल करें`, thumbnail: `https://images.unsplash.com/photo-${thumbBase}?w=300&h=500&fit=crop`, videoUrl: "#", platform: "instagram", views: "12.5K" },
  { id: "r2", title: `${productName} के फायदे जानिये`, thumbnail: `https://images.unsplash.com/photo-${thumbBase + 1000}?w=300&h=500&fit=crop`, videoUrl: "#", platform: "youtube", views: "8.2K" },
  { id: "r3", title: `Customer Review - ${productName}`, thumbnail: `https://images.unsplash.com/photo-${thumbBase + 2000}?w=300&h=500&fit=crop`, videoUrl: "#", platform: "instagram", views: "5.7K" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Ashwagandha Root Powder",
    nameHi: "अश्वगंधा चूर्ण",
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400&h=400&fit=crop",
    category: "जड़ी-बूटी (Herbs)",
    rating: 4.8,
    reviews: 234,
    description: "शुद्ध जैविक अश्वगंधा चूर्ण। तनाव कम करने और ऊर्जा बढ़ाने में सहायक। Pure organic Ashwagandha root powder sourced from pristine Indian farms.",
    ingredients: ["100% Organic Ashwagandha Root (Withania somnifera) - शुद्ध अश्वगंधा जड़"],
    benefits: ["तनाव और चिंता कम करे (Reduces stress)", "ऊर्जा और स्टैमिना बढ़ाये (Boosts energy)", "इम्युनिटी मजबूत करे (Supports immunity)", "नींद में सुधार (Improves sleep)"],
    usage: "आधा चम्मच गर्म दूध या पानी में मिलाकर दिन में दो बार लें। Mix ½ tsp with warm milk or water, twice daily.",
    inStock: true,
    reels: makeReels("Ashwagandha", 1515377905703),
  },
  {
    id: "2",
    name: "Triphala Capsules",
    nameHi: "त्रिफला कैप्सूल",
    price: 449,
    originalPrice: 599,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    category: "कैप्सूल (Capsules)",
    rating: 4.6,
    reviews: 189,
    description: "पारंपरिक त्रिफला मिश्रण कैप्सूल में। पाचन के लिए सर्वोत्तम। Traditional Triphala blend in easy-to-take capsule form.",
    ingredients: ["आंवला (Amla)", "बहेड़ा (Bibhitaki)", "हरड़ (Haritaki)"],
    benefits: ["पाचन सुधारे (Improves digestion)", "शरीर की सफाई (Natural detox)", "एंटीऑक्सीडेंट से भरपूर (Rich in antioxidants)", "पेट स्वास्थ्य (Gut health)"],
    usage: "रात को सोने से पहले गर्म पानी के साथ 2 कैप्सूल लें। Take 2 capsules with warm water before bedtime.",
    inStock: true,
    reels: makeReels("Triphala", 1556228578000),
  },
  {
    id: "3",
    name: "Kumkumadi Face Oil",
    nameHi: "कुमकुमादि तेल",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    category: "त्वचा देखभाल (Skin Care)",
    rating: 4.9,
    reviews: 312,
    description: "प्रीमियम कुमकुमादि तैलम – आयुर्वेदिक स्किनकेयर का स्वर्ण मानक। केसर और 16 शक्तिशाली जड़ी-बूटियों से बना।",
    ingredients: ["केसर (Saffron)", "चंदन (Sandalwood)", "कमल (Lotus)", "खस (Vetiver)", "मंजिष्ठा (Manjistha)", "तिल तेल (Sesame Oil)"],
    benefits: ["रंग निखारे (Brightens complexion)", "दाग-धब्बे कम करे (Reduces dark spots)", "एंटी-एजिंग (Anti-aging)", "गहरा पोषण (Deep nourishment)"],
    usage: "रात को साफ चेहरे पर 3-4 बूंदें लगाएं, गोलाकार मसाज करें। Apply 3-4 drops on clean face at night.",
    inStock: true,
    reels: makeReels("Kumkumadi Oil", 1608571423902),
  },
  {
    id: "4",
    name: "Brahmi Memory Tonic",
    nameHi: "ब्राह्मी स्मृति टॉनिक",
    price: 399,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    category: "टॉनिक (Tonics)",
    rating: 4.5,
    reviews: 156,
    description: "क्लासिकल ब्राह्मी फॉर्मूला – याददाश्त, एकाग्रता और दिमागी शक्ति बढ़ाने के लिए।",
    ingredients: ["ब्राह्मी (Bacopa monnieri)", "शंखपुष्पी (Shankhpushpi)", "ज्योतिष्मती (Jyotishmati)", "शहद (Honey base)"],
    benefits: ["याददाश्त बढ़ाये (Enhances memory)", "एकाग्रता सुधारे (Improves focus)", "मन शांत करे (Calms the mind)", "पढ़ाई में मदद (Supports learning)"],
    usage: "10ml दिन में दो बार पानी के साथ लें। Take 10ml twice daily with water.",
    inStock: true,
    reels: makeReels("Brahmi Tonic", 1587854692152),
  },
  {
    id: "5",
    name: "Chyawanprash Premium",
    nameHi: "च्यवनप्राश प्रीमियम",
    price: 549,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop",
    category: "इम्युनिटी (Immunity)",
    rating: 4.7,
    reviews: 278,
    description: "48 जड़ी-बूटियों और आंवले से बना पारंपरिक च्यवनप्राश। इम्युनिटी बूस्टर।",
    ingredients: ["आंवला (Amla)", "अश्वगंधा", "पिप्पली", "घी (Ghee)", "शहद (Honey)", "40+ जड़ी-बूटियाँ"],
    benefits: ["इम्युनिटी बढ़ाये (Boosts immunity)", "विटामिन C से भरपूर", "श्वसन स्वास्थ्य (Respiratory health)", "एंटी-एजिंग (Anti-aging)"],
    usage: "रोज सुबह 1-2 चम्मच गर्म दूध के साथ लें। Take 1-2 tsp daily with warm milk.",
    inStock: true,
    reels: makeReels("Chyawanprash", 1505751172876),
  },
  {
    id: "6",
    name: "Neem & Turmeric Soap",
    nameHi: "नीम हल्दी साबुन",
    price: 199,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop",
    category: "त्वचा देखभाल (Skin Care)",
    rating: 4.4,
    reviews: 145,
    description: "हाथ से बना आयुर्वेदिक साबुन – नीम और हल्दी के गुणों से भरपूर। Handmade Ayurvedic soap.",
    ingredients: ["नीम अर्क (Neem)", "हल्दी (Turmeric)", "नारियल तेल (Coconut oil)", "एलोवेरा (Aloe vera)"],
    benefits: ["एंटीबैक्टीरियल (Antibacterial)", "त्वचा साफ करे (Clears skin)", "प्राकृतिक नमी (Moisturizing)", "कोमल सफाई (Gentle cleansing)"],
    usage: "नहाते समय गीली त्वचा पर लगाएं, अच्छी तरह धोएं। Use daily during bath.",
    inStock: true,
    reels: makeReels("Neem Turmeric Soap", 1600857544200),
  },
  {
    id: "7",
    name: "Tulsi Green Tea",
    nameHi: "तुलसी ग्रीन टी",
    price: 349,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop",
    category: "चाय (Teas)",
    rating: 4.6,
    reviews: 203,
    description: "ऑर्गेनिक तुलसी युक्त ग्रीन टी – रोज़ की तंदुरुस्ती के लिए। Organic Tulsi infused green tea.",
    ingredients: ["ग्रीन टी पत्तियां", "तुलसी (Holy Basil)", "लेमनग्रास", "अदरक (Ginger)"],
    benefits: ["इम्युनिटी बढ़ाये (Boosts immunity)", "पाचन में मदद (Aids digestion)", "तनाव कम करे (Reduces stress)", "एंटीऑक्सीडेंट (Antioxidants)"],
    usage: "एक टी बैग को गर्म पानी में 3-5 मिनट डुबोएं। Steep 3-5 minutes, enjoy 2-3 cups daily.",
    inStock: true,
    reels: makeReels("Tulsi Tea", 1556881286000),
  },
  {
    id: "8",
    name: "Bhringraj Hair Oil",
    nameHi: "भृंगराज केश तेल",
    price: 499,
    originalPrice: 649,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
    category: "बालों की देखभाल (Hair Care)",
    rating: 4.7,
    reviews: 267,
    description: "पारंपरिक भृंगराज तेल – आंवला और नारियल तेल से युक्त। बालों को घना और मजबूत बनाये।",
    ingredients: ["भृंगराज (Bhringraj)", "आंवला (Amla)", "नारियल तेल (Coconut oil)", "ब्राह्मी", "गुड़हल (Hibiscus)"],
    benefits: ["बाल उगाये (Hair growth)", "सफेद बाल रोके (Prevents graying)", "झड़ना कम करे (Reduces hair fall)", "स्कैल्प पोषण (Nourishes scalp)"],
    usage: "तेल हल्का गर्म करें, स्कैल्प पर मालिश करें, 1-2 घंटे बाद धोएं। Warm & massage into scalp.",
    inStock: false,
    reels: makeReels("Bhringraj Oil", 1535585209827),
  },
];

export const categories = [
  "All",
  "जड़ी-बूटी (Herbs)",
  "कैप्सूल (Capsules)",
  "त्वचा देखभाल (Skin Care)",
  "बालों की देखभाल (Hair Care)",
  "टॉनिक (Tonics)",
  "इम्युनिटी (Immunity)",
  "चाय (Teas)",
];

export const orders: Order[] = [
  { id: "APC-001", customer: "प्रिया शर्मा (Priya Sharma)", email: "priya@email.com", items: [{ productId: "1", name: "Ashwagandha Root Powder", quantity: 2, price: 599 }], total: 1198, status: "delivered", date: "2024-01-15", address: "मुंबई, महाराष्ट्र" },
  { id: "APC-002", customer: "राहुल वर्मा (Rahul Verma)", email: "rahul@email.com", items: [{ productId: "3", name: "Kumkumadi Face Oil", quantity: 1, price: 1299 }, { productId: "6", name: "Neem & Turmeric Soap", quantity: 3, price: 199 }], total: 1896, status: "shipped", date: "2024-01-18", address: "दिल्ली, NCR" },
  { id: "APC-003", customer: "अनीता देसाई (Anita Desai)", email: "anita@email.com", items: [{ productId: "5", name: "Chyawanprash Premium", quantity: 1, price: 549 }], total: 549, status: "pending", date: "2024-01-20", address: "बैंगलोर, कर्नाटक" },
  { id: "APC-004", customer: "विक्रम सिंह (Vikram Singh)", email: "vikram@email.com", items: [{ productId: "2", name: "Triphala Capsules", quantity: 2, price: 449 }, { productId: "7", name: "Tulsi Green Tea", quantity: 1, price: 349 }], total: 1247, status: "pending", date: "2024-01-21", address: "जयपुर, राजस्थान" },
  { id: "APC-005", customer: "मीरा पटेल (Meera Patel)", email: "meera@email.com", items: [{ productId: "4", name: "Brahmi Memory Tonic", quantity: 1, price: 399 }], total: 399, status: "delivered", date: "2024-01-10", address: "अहमदाबाद, गुजरात" },
  { id: "APC-006", customer: "अर्जुन नायर (Arjun Nair)", email: "arjun@email.com", items: [{ productId: "8", name: "Bhringraj Hair Oil", quantity: 2, price: 499 }], total: 998, status: "shipped", date: "2024-01-19", address: "कोच्चि, केरल" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "अश्वगंधा के चमत्कारी फायदे – The Ancient Wisdom of Ashwagandha",
    excerpt: "जानिए कैसे यह शक्तिशाली जड़ी-बूटी 3000 सालों से तनाव कम करने और ताकत बढ़ाने में काम आ रही है।",
    content: "अश्वगंधा, आयुर्वेद की सबसे महत्वपूर्ण जड़ी-बूटियों में से एक है...",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=400&fit=crop",
    author: "डॉ. प्राची (Dr. Prachi)",
    date: "2024-01-15",
    category: "जड़ी-बूटी",
    readTime: "5 मिनट",
  },
  {
    id: "2",
    title: "दिनचर्या – Morning Rituals for Modern Life",
    excerpt: "आयुर्वेदिक सुबह की दिनचर्या को अपनी व्यस्त ज़िंदगी में कैसे शामिल करें।",
    content: "दिनचर्या आयुर्वेदिक जीवनशैली की नींव है...",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop",
    author: "डॉ. प्राची (Dr. Prachi)",
    date: "2024-01-10",
    category: "जीवनशैली",
    readTime: "7 मिनट",
  },
  {
    id: "3",
    title: "आयुर्वेदिक स्किनकेयर – चमकती त्वचा का प्राकृतिक रास्ता",
    excerpt: "समय-परीक्षित आयुर्वेदिक सामग्रियों से पाएं निखरी और स्वस्थ त्वचा।",
    content: "आयुर्वेदिक स्किनकेयर सतही उपचार से कहीं आगे है...",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=400&fit=crop",
    author: "वैद्य मीरा जोशी",
    date: "2024-01-05",
    category: "त्वचा देखभाल",
    readTime: "6 मिनट",
  },
  {
    id: "4",
    title: "अपनी प्रकृति पहचानें – Understanding Vata, Pitta, Kapha",
    excerpt: "आयुर्वेद के अनुसार अपनी शरीर प्रकृति (दोष) को समझने की पूरी गाइड।",
    content: "आयुर्वेद में हर व्यक्ति की एक अद्वितीय प्रकृति होती है...",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
    author: "डॉ. प्राची (Dr. Prachi)",
    date: "2024-01-01",
    category: "शिक्षा",
    readTime: "8 मिनट",
  },
];

export const testimonials: Testimonial[] = [
  { id: "1", name: "प्रिया शर्मा", text: "Apsoncure का अश्वगंधा पाउडर कमाल का है! मेरा तनाव बहुत कम हो गया और ऊर्जा बढ़ गई। 100% असली प्रोडक्ट!", rating: 5, avatar: "प्रि", location: "मुंबई" },
  { id: "2", name: "राजेश कुमार", text: "कुमकुमादि तेल ने सिर्फ 3 हफ्तों में मेरी त्वचा बदल दी। दाग-धब्बे कम हो गए। बहुत प्रीमियम क्वालिटी!", rating: 5, avatar: "रा", location: "दिल्ली" },
  { id: "3", name: "अनन्या पटेल", text: "त्रिफला कैप्सूल 2 महीने से ले रही हूं, पाचन में गजब का सुधार हुआ। सबको recommend करती हूं!", rating: 4, avatar: "अ", location: "बैंगलोर" },
  { id: "4", name: "विक्रम देसाई", text: "च्यवनप्राश बिल्कुल दादी-नानी वाला स्वाद! असली और शुद्ध। इम्युनिटी के लिए बेस्ट है।", rating: 5, avatar: "वि", location: "पुणे" },
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
];
