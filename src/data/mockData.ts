export interface Product {
  id: string;
  name: string;
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

export const products: Product[] = [
  {
    id: "1",
    name: "Ashwagandha Root Powder",
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400&h=400&fit=crop",
    category: "Herbs & Powders",
    rating: 4.8,
    reviews: 234,
    description: "Pure organic Ashwagandha root powder sourced from pristine farms. Known as the king of Ayurvedic herbs, it helps reduce stress and boost vitality.",
    ingredients: ["100% Organic Ashwagandha Root (Withania somnifera)"],
    benefits: ["Reduces stress & anxiety", "Boosts energy & stamina", "Supports immune system", "Improves sleep quality"],
    usage: "Mix 1/2 teaspoon with warm milk or water. Take twice daily, preferably before meals.",
    inStock: true,
  },
  {
    id: "2",
    name: "Triphala Capsules",
    price: 449,
    originalPrice: 599,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    category: "Capsules",
    rating: 4.6,
    reviews: 189,
    description: "Traditional Triphala blend in easy-to-take capsule form. A powerful digestive tonic used for centuries.",
    ingredients: ["Amla (Emblica officinalis)", "Bibhitaki (Terminalia bellirica)", "Haritaki (Terminalia chebula)"],
    benefits: ["Improves digestion", "Natural detox", "Rich in antioxidants", "Supports gut health"],
    usage: "Take 2 capsules with warm water before bedtime or as directed by your Vaidya.",
    inStock: true,
  },
  {
    id: "3",
    name: "Kumkumadi Face Oil",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    category: "Skin Care",
    rating: 4.9,
    reviews: 312,
    description: "Premium Kumkumadi Tailam – the gold standard of Ayurvedic skincare. Made with saffron and 16 potent herbs.",
    ingredients: ["Saffron", "Sandalwood", "Lotus", "Vetiver", "Manjistha", "Sesame Oil Base"],
    benefits: ["Brightens complexion", "Reduces dark spots", "Anti-aging properties", "Deep nourishment"],
    usage: "Apply 3-4 drops on clean face at night. Gently massage in upward circular motions.",
    inStock: true,
  },
  {
    id: "4",
    name: "Brahmi Memory Tonic",
    price: 399,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    category: "Tonics",
    rating: 4.5,
    reviews: 156,
    description: "Classical Brahmi formulation to enhance memory, focus and cognitive function naturally.",
    ingredients: ["Brahmi (Bacopa monnieri)", "Shankhpushpi", "Jyotishmati", "Honey base"],
    benefits: ["Enhances memory", "Improves concentration", "Calms the mind", "Supports learning"],
    usage: "Take 10ml twice daily with water, or as directed by your Ayurvedic practitioner.",
    inStock: true,
  },
  {
    id: "5",
    name: "Chyawanprash Premium",
    price: 549,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop",
    category: "Immunity",
    rating: 4.7,
    reviews: 278,
    description: "Traditional Chyawanprash made with 48 herbs and Amla. The ultimate immunity booster from ancient Ayurveda.",
    ingredients: ["Amla", "Ashwagandha", "Pippali", "Ghee", "Honey", "40+ herbs"],
    benefits: ["Boosts immunity", "Rich in Vitamin C", "Improves respiratory health", "Anti-aging"],
    usage: "Take 1-2 teaspoons daily with warm milk. Best consumed in the morning.",
    inStock: true,
  },
  {
    id: "6",
    name: "Neem & Turmeric Soap",
    price: 199,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop",
    category: "Skin Care",
    rating: 4.4,
    reviews: 145,
    description: "Handmade Ayurvedic soap with Neem and Turmeric. Gentle cleansing with antibacterial properties.",
    ingredients: ["Neem extract", "Turmeric", "Coconut oil", "Aloe vera", "Essential oils"],
    benefits: ["Antibacterial", "Clears skin", "Natural moisturizing", "Gentle exfoliation"],
    usage: "Use daily during bath. Lather and apply on wet skin, rinse thoroughly.",
    inStock: true,
  },
  {
    id: "7",
    name: "Tulsi Green Tea",
    price: 349,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop",
    category: "Teas",
    rating: 4.6,
    reviews: 203,
    description: "Organic Tulsi infused green tea for daily wellness. A calming blend that supports respiratory health.",
    ingredients: ["Green tea leaves", "Holy Basil (Tulsi)", "Lemongrass", "Ginger"],
    benefits: ["Boosts immunity", "Aids digestion", "Reduces stress", "Rich in antioxidants"],
    usage: "Steep one tea bag in hot water for 3-5 minutes. Enjoy 2-3 cups daily.",
    inStock: true,
  },
  {
    id: "8",
    name: "Bhringraj Hair Oil",
    price: 499,
    originalPrice: 649,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
    category: "Hair Care",
    rating: 4.7,
    reviews: 267,
    description: "Traditional Bhringraj oil infused with Amla and Coconut oil. Promotes thick, lustrous hair growth.",
    ingredients: ["Bhringraj", "Amla", "Coconut oil", "Brahmi", "Hibiscus"],
    benefits: ["Promotes hair growth", "Prevents premature graying", "Reduces hair fall", "Nourishes scalp"],
    usage: "Warm the oil slightly. Massage into scalp and hair. Leave for 1-2 hours before washing.",
    inStock: false,
  },
];

export const categories = [
  "All",
  "Herbs & Powders",
  "Capsules",
  "Skin Care",
  "Hair Care",
  "Tonics",
  "Immunity",
  "Teas",
];

export const orders: Order[] = [
  { id: "ORD-001", customer: "Priya Sharma", email: "priya@email.com", items: [{ productId: "1", name: "Ashwagandha Root Powder", quantity: 2, price: 599 }], total: 1198, status: "delivered", date: "2024-01-15", address: "Mumbai, Maharashtra" },
  { id: "ORD-002", customer: "Rahul Verma", email: "rahul@email.com", items: [{ productId: "3", name: "Kumkumadi Face Oil", quantity: 1, price: 1299 }, { productId: "6", name: "Neem & Turmeric Soap", quantity: 3, price: 199 }], total: 1896, status: "shipped", date: "2024-01-18", address: "Delhi, NCR" },
  { id: "ORD-003", customer: "Anita Desai", email: "anita@email.com", items: [{ productId: "5", name: "Chyawanprash Premium", quantity: 1, price: 549 }], total: 549, status: "pending", date: "2024-01-20", address: "Bangalore, Karnataka" },
  { id: "ORD-004", customer: "Vikram Singh", email: "vikram@email.com", items: [{ productId: "2", name: "Triphala Capsules", quantity: 2, price: 449 }, { productId: "7", name: "Tulsi Green Tea", quantity: 1, price: 349 }], total: 1247, status: "pending", date: "2024-01-21", address: "Jaipur, Rajasthan" },
  { id: "ORD-005", customer: "Meera Patel", email: "meera@email.com", items: [{ productId: "4", name: "Brahmi Memory Tonic", quantity: 1, price: 399 }], total: 399, status: "delivered", date: "2024-01-10", address: "Ahmedabad, Gujarat" },
  { id: "ORD-006", customer: "Arjun Nair", email: "arjun@email.com", items: [{ productId: "8", name: "Bhringraj Hair Oil", quantity: 2, price: 499 }], total: 998, status: "shipped", date: "2024-01-19", address: "Kochi, Kerala" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Ancient Wisdom of Ashwagandha: Nature's Stress Buster",
    excerpt: "Discover how this powerful adaptogen has been used for over 3000 years to combat stress and boost vitality.",
    content: "Ashwagandha, known as Withania somnifera, is one of the most important herbs in Ayurveda...",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=400&fit=crop",
    author: "Dr. Ayush Sharma",
    date: "2024-01-15",
    category: "Herbs",
    readTime: "5 min read",
  },
  {
    id: "2",
    title: "Morning Rituals: Dinacharya for Modern Life",
    excerpt: "Learn how to incorporate ancient Ayurvedic morning routines into your busy modern lifestyle.",
    content: "Dinacharya, or daily routine, is a cornerstone of Ayurvedic living...",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop",
    author: "Vaidya Meera Joshi",
    date: "2024-01-10",
    category: "Lifestyle",
    readTime: "7 min read",
  },
  {
    id: "3",
    title: "Ayurvedic Skincare: The Natural Path to Glowing Skin",
    excerpt: "Unlock the secrets of radiant skin with time-tested Ayurvedic ingredients and practices.",
    content: "Ayurvedic skincare goes beyond surface-level treatment...",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=400&fit=crop",
    author: "Dr. Kavita Reddy",
    date: "2024-01-05",
    category: "Skincare",
    readTime: "6 min read",
  },
  {
    id: "4",
    title: "Understanding Your Dosha: Vata, Pitta, Kapha",
    excerpt: "A comprehensive guide to understanding your unique body constitution according to Ayurveda.",
    content: "In Ayurveda, every individual has a unique constitution called Prakriti...",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
    author: "Dr. Ayush Sharma",
    date: "2024-01-01",
    category: "Education",
    readTime: "8 min read",
  },
];

export const testimonials: Testimonial[] = [
  { id: "1", name: "Priya Sharma", text: "The Ashwagandha powder has been a game-changer for my stress levels. I feel calmer and more focused throughout the day.", rating: 5, avatar: "PS", location: "Mumbai" },
  { id: "2", name: "Rajesh Kumar", text: "Kumkumadi oil transformed my skin in just 3 weeks. My dark spots have visibly reduced. Truly premium quality!", rating: 5, avatar: "RK", location: "Delhi" },
  { id: "3", name: "Ananya Patel", text: "I've been using Triphala capsules for 2 months and my digestion has improved remarkably. Highly recommended!", rating: 4, avatar: "AP", location: "Bangalore" },
  { id: "4", name: "Vikram Desai", text: "The Chyawanprash is made just like my grandmother used to. Authentic taste and amazing immunity boost.", rating: 5, avatar: "VD", location: "Pune" },
];

export const salesData = [
  { month: "Jul", sales: 35000, orders: 45 },
  { month: "Aug", sales: 42000, orders: 52 },
  { month: "Sep", sales: 38000, orders: 48 },
  { month: "Oct", sales: 55000, orders: 67 },
  { month: "Nov", sales: 62000, orders: 78 },
  { month: "Dec", sales: 78000, orders: 95 },
  { month: "Jan", sales: 71000, orders: 88 },
];

export const categoryData = [
  { name: "Herbs & Powders", value: 30, fill: "hsl(120, 37%, 25%)" },
  { name: "Skin Care", value: 25, fill: "hsl(28, 52%, 64%)" },
  { name: "Capsules", value: 18, fill: "hsl(90, 15%, 53%)" },
  { name: "Immunity", value: 15, fill: "hsl(40, 33%, 70%)" },
  { name: "Others", value: 12, fill: "hsl(20, 33%, 50%)" },
];

export const whatsappTemplates = [
  { id: "1", name: "Product Inquiry", message: "Hello! I'm interested in {{product_name}}. Could you share more details about its benefits and usage? 🌿", variables: ["product_name"] },
  { id: "2", name: "Order Status", message: "Hi! I'd like to check the status of my order {{order_id}}. Thank you! 📦", variables: ["order_id"] },
  { id: "3", name: "Consultation Request", message: "Namaste! I'd like to consult a Vaidya about {{health_concern}}. When are you available? 🙏", variables: ["health_concern"] },
  { id: "4", name: "Bulk Order", message: "Hello! I'm interested in placing a bulk order for {{product_name}}. Quantity: {{quantity}}. Please share pricing. 📋", variables: ["product_name", "quantity"] },
];
