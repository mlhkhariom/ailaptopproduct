// Run: node src/db/seed.js
import db from './database.js';
import { v4 as uuid } from 'uuid';

// ── PRODUCTS ─────────────────────────────────────────────
const products = [
  { id:"1", name:"Ashwagandha Root Powder", name_hi:"अश्वगंधा चूर्ण", price:599, original_price:799, image:"https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400&h=400&fit=crop", category:"जड़ी-बूटी (Herbs)", rating:4.8, reviews:234, stock:45, sku:"APC-ASH-001", slug:"ashwagandha-churna", badge:"Best Seller", status:"active", description:"शुद्ध जैविक अश्वगंधा चूर्ण। तनाव कम करने और ऊर्जा बढ़ाने में सहायक।", ingredients:["100% Organic Ashwagandha Root (Withania somnifera)"], benefits:["तनाव और चिंता कम करे","ऊर्जा और स्टैमिना बढ़ाये","इम्युनिटी मजबूत करे","नींद में सुधार"], usage:"आधा चम्मच गर्म दूध में मिलाकर दिन में दो बार लें।", in_stock:1 },
  { id:"2", name:"Triphala Capsules", name_hi:"त्रिफला कैप्सूल", price:449, original_price:599, image:"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop", category:"कैप्सूल (Capsules)", rating:4.6, reviews:189, stock:3, sku:"APC-TRI-002", slug:"triphala-capsules", status:"active", description:"पारंपरिक त्रिफला मिश्रण कैप्सूल में। पाचन के लिए सर्वोत्तम।", ingredients:["आंवला (Amla)","बहेड़ा (Bibhitaki)","हरड़ (Haritaki)"], benefits:["पाचन सुधारे","शरीर की सफाई","एंटीऑक्सीडेंट से भरपूर"], usage:"रात को सोने से पहले गर्म पानी के साथ 2 कैप्सूल लें।", in_stock:1 },
  { id:"3", name:"Kumkumadi Face Oil", name_hi:"कुमकुमादि तेल", price:1299, original_price:1599, image:"https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop", category:"त्वचा देखभाल (Skin Care)", rating:4.9, reviews:312, stock:28, sku:"APC-KUM-003", slug:"kumkumadi-face-oil", badge:"Premium", status:"active", description:"प्रीमियम कुमकुमादि तैलम – आयुर्वेदिक स्किनकेयर का स्वर्ण मानक।", ingredients:["केसर (Saffron)","चंदन (Sandalwood)","कमल (Lotus)","तिल तेल (Sesame Oil)"], benefits:["रंग निखारे","दाग-धब्बे कम करे","एंटी-एजिंग","गहरा पोषण"], usage:"रात को साफ चेहरे पर 3-4 बूंदें लगाएं।", in_stock:1 },
  { id:"4", name:"Brahmi Memory Tonic", name_hi:"ब्राह्मी स्मृति टॉनिक", price:399, original_price:null, image:"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop", category:"टॉनिक (Tonics)", rating:4.5, reviews:156, stock:60, sku:"APC-BRA-004", slug:"brahmi-memory-tonic", status:"active", description:"क्लासिकल ब्राह्मी फॉर्मूला – याददाश्त और दिमागी शक्ति बढ़ाने के लिए।", ingredients:["ब्राह्मी (Bacopa monnieri)","शंखपुष्पी","ज्योतिष्मती","शहद (Honey base)"], benefits:["याददाश्त बढ़ाये","एकाग्रता सुधारे","मन शांत करे"], usage:"10ml दिन में दो बार पानी के साथ लें।", in_stock:1 },
  { id:"5", name:"Chyawanprash Premium", name_hi:"च्यवनप्राश प्रीमियम", price:549, original_price:699, image:"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop", category:"इम्युनिटी (Immunity)", rating:4.7, reviews:278, stock:4, sku:"APC-CHY-005", slug:"chyawanprash-premium", badge:"Popular", status:"active", description:"48 जड़ी-बूटियों और आंवले से बना पारंपरिक च्यवनप्राश।", ingredients:["आंवला (Amla)","अश्वगंधा","पिप्पली","घी (Ghee)","शहद (Honey)"], benefits:["इम्युनिटी बढ़ाये","विटामिन C से भरपूर","श्वसन स्वास्थ्य"], usage:"रोज सुबह 1-2 चम्मच गर्म दूध के साथ लें।", in_stock:1 },
  { id:"6", name:"Neem & Turmeric Soap", name_hi:"नीम हल्दी साबुन", price:199, original_price:null, image:"https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop", category:"त्वचा देखभाल (Skin Care)", rating:4.4, reviews:145, stock:120, sku:"APC-NTS-006", slug:"neem-turmeric-soap", status:"active", description:"हाथ से बना आयुर्वेदिक साबुन – नीम और हल्दी के गुणों से भरपूर।", ingredients:["नीम अर्क (Neem)","हल्दी (Turmeric)","नारियल तेल","एलोवेरा"], benefits:["एंटीबैक्टीरियल","त्वचा साफ करे","प्राकृतिक नमी"], usage:"नहाते समय गीली त्वचा पर लगाएं।", in_stock:1 },
  { id:"7", name:"Tulsi Green Tea", name_hi:"तुलसी ग्रीन टी", price:349, original_price:null, image:"https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop", category:"चाय (Teas)", rating:4.6, reviews:203, stock:85, sku:"APC-TGT-007", slug:"tulsi-green-tea", status:"active", description:"ऑर्गेनिक तुलसी युक्त ग्रीन टी – रोज़ की तंदुरुस्ती के लिए।", ingredients:["ग्रीन टी पत्तियां","तुलसी (Holy Basil)","लेमनग्रास","अदरक (Ginger)"], benefits:["इम्युनिटी बढ़ाये","पाचन में मदद","तनाव कम करे"], usage:"एक टी बैग को गर्म पानी में 3-5 मिनट डुबोएं।", in_stock:1 },
  { id:"8", name:"Bhringraj Hair Oil", name_hi:"भृंगराज केश तेल", price:499, original_price:649, image:"https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop", category:"बालों की देखभाल (Hair Care)", rating:4.7, reviews:267, stock:0, sku:"APC-BHO-008", slug:"bhringraj-hair-oil", status:"active", description:"पारंपरिक भृंगराज तेल – बालों को घना और मजबूत बनाये।", ingredients:["भृंगराज (Bhringraj)","आंवला (Amla)","नारियल तेल","ब्राह्मी","गुड़हल (Hibiscus)"], benefits:["बाल उगाये","सफेद बाल रोके","झड़ना कम करे"], usage:"तेल हल्का गर्म करें, स्कैल्प पर मालिश करें।", in_stock:0 },
];

// ── ORDERS ───────────────────────────────────────────────
const orders = [
  { id:"APC-001", order_number:"APC-001", user_id:null, items:[{productId:"1",name:"Ashwagandha Root Powder",quantity:2,price:599}], subtotal:1198, discount:0, total:1294, status:"delivered", payment_status:"paid", payment_method:"Razorpay", address:{line:"A-12, Andheri West, Mumbai 400058"}, tracking_id:"DTDC123456789", courier:"DTDC", created_at:"2024-01-15T10:00:00" },
  { id:"APC-002", order_number:"APC-002", user_id:null, items:[{productId:"3",name:"Kumkumadi Face Oil",quantity:1,price:1299},{productId:"6",name:"Neem & Turmeric Soap",quantity:3,price:199}], subtotal:1896, discount:0, total:2098, status:"shipped", payment_status:"paid", payment_method:"UPI", address:{line:"B-45, Dwarka Sector 12, Delhi 110078"}, tracking_id:"BLUEDART987654", courier:"BlueDart", created_at:"2024-01-18T11:00:00" },
  { id:"APC-003", order_number:"APC-003", user_id:null, items:[{productId:"5",name:"Chyawanprash Premium",quantity:1,price:549}], subtotal:549, discount:0, total:643, status:"pending", payment_status:"pending", payment_method:"COD", address:{line:"45, Koramangala, Bangalore 560034"}, created_at:"2024-01-20T09:00:00" },
  { id:"APC-004", order_number:"APC-004", user_id:null, items:[{productId:"2",name:"Triphala Capsules",quantity:2,price:449},{productId:"7",name:"Tulsi Green Tea",quantity:1,price:349}], subtotal:1247, discount:0, total:1347, status:"processing", payment_status:"paid", payment_method:"Razorpay", address:{line:"C-78, Malviya Nagar, Jaipur 302017"}, created_at:"2024-01-21T14:00:00" },
  { id:"APC-005", order_number:"APC-005", user_id:null, items:[{productId:"4",name:"Brahmi Memory Tonic",quantity:1,price:399}], subtotal:399, discount:0, total:481, status:"delivered", payment_status:"paid", payment_method:"UPI", address:{line:"D-90, Satellite, Ahmedabad 380015"}, created_at:"2024-01-10T08:00:00" },
];

// ── BLOG POSTS ───────────────────────────────────────────
const blogPosts = [
  { id:"b1", title:"अश्वगंधा के चमत्कारी फायदे", slug:"ashwagandha-benefits", excerpt:"जानिए कैसे यह शक्तिशाली जड़ी-बूटी 3000 सालों से तनाव कम करने में काम आ रही है।", content:"अश्वगंधा, आयुर्वेद की सबसे महत्वपूर्ण जड़ी-बूटियों में से एक है...", image:"https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=400&fit=crop", author:"डॉ. प्राची", category:"जड़ी-बूटी", status:"published", tags:["ashwagandha","stress","ayurveda"], published_at:"2024-01-15T00:00:00" },
  { id:"b2", title:"दिनचर्या – Morning Rituals for Modern Life", slug:"dincharya-morning-rituals", excerpt:"आयुर्वेदिक सुबह की दिनचर्या को अपनी व्यस्त ज़िंदगी में कैसे शामिल करें।", content:"दिनचर्या आयुर्वेदिक जीवनशैली की नींव है...", image:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop", author:"डॉ. प्राची", category:"जीवनशैली", status:"published", tags:["lifestyle","morning","routine"], published_at:"2024-01-10T00:00:00" },
  { id:"b3", title:"आयुर्वेदिक स्किनकेयर गाइड", slug:"laptop-skincare-guide", excerpt:"समय-परीक्षित आयुर्वेदिक सामग्रियों से पाएं निखरी और स्वस्थ त्वचा।", content:"आयुर्वेदिक स्किनकेयर सतही उपचार से कहीं आगे है...", image:"https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=400&fit=crop", author:"वैद्य मीरा जोशी", category:"त्वचा देखभाल", status:"published", tags:["skincare","kumkumadi","natural"], published_at:"2024-01-05T00:00:00" },
];

// ── CATEGORIES ───────────────────────────────────────────
const cats = [
  { id:"c1", name:"जड़ी-बूटी", name_hi:"Herbs", slug:"herbs" },
  { id:"c2", name:"कैप्सूल", name_hi:"Capsules", slug:"capsules" },
  { id:"c3", name:"त्वचा देखभाल", name_hi:"Skin Care", slug:"skin-care" },
  { id:"c4", name:"बालों की देखभाल", name_hi:"Hair Care", slug:"hair-care" },
  { id:"c5", name:"टॉनिक", name_hi:"Tonics", slug:"tonics" },
  { id:"c6", name:"इम्युनिटी", name_hi:"Immunity", slug:"immunity" },
  { id:"c7", name:"चाय", name_hi:"Teas", slug:"teas" },
];

// ── CMS CONTENT ──────────────────────────────────────────
const cmsItems = [
  { section:"banner", content:{ title:"प्रकृति की शक्ति, आपके द्वार", subtitle:"100% Authentic Laptop Products", cta:"Shop Now", image:"https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=500&fit=crop" }, sort_order:1 },
  { section:"banner", content:{ title:"AI Laptop Wala की विशेष सिफारिश", subtitle:"Trusted by 10,000+ Customers", cta:"View Products", image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=500&fit=crop" }, sort_order:2 },
  { section:"benefit", content:{ icon:"Leaf", title:"100% Natural", description:"No chemicals, no preservatives" }, sort_order:1 },
  { section:"benefit", content:{ icon:"Shield", title:"GMP Certified", description:"Quality assured manufacturing" }, sort_order:2 },
  { section:"benefit", content:{ icon:"Truck", title:"Free Shipping", description:"On orders above ₹500" }, sort_order:3 },
  { section:"testimonial", content:{ name:"प्रिया शर्मा", text:"AI Laptop Wala का अश्वगंधा पाउडर कमाल का है!", rating:5, avatar:"प्रि", location:"मुंबई" }, sort_order:1 },
  { section:"testimonial", content:{ name:"राजेश कुमार", text:"कुमकुमादि तेल ने सिर्फ 3 हफ्तों में मेरी त्वचा बदल दी।", rating:5, avatar:"रा", location:"दिल्ली" }, sort_order:2 },
  { section:"faq", content:{ question:"क्या ये products 100% natural हैं?", answer:"हाँ, सभी products शुद्ध आयुर्वेदिक सामग्री से बने हैं।", category:"Products" }, sort_order:1 },
  { section:"faq", content:{ question:"Delivery कितने दिन में होती है?", answer:"3-7 business days. Express delivery भी available है।", category:"Shipping" }, sort_order:2 },
  { section:"setting", content:{ siteName:"AI Laptop Wala", tagline:"AI Laptop Wala Store", phone:"+91 98765 43210", email:"hello@ailaptopwala.com", address:"Indore, Madhya Pradesh" }, sort_order:1 },
];

// ── SEED ─────────────────────────────────────────────────
console.log('🌱 Seeding database...');

// Products
const insertProduct = db.prepare(`INSERT OR REPLACE INTO products (id,name,name_hi,price,original_price,image,category,rating,reviews,stock,in_stock,sku,slug,badge,status,description,ingredients,benefits,usage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
products.forEach(p => insertProduct.run(p.id, p.name, p.name_hi, p.price, p.original_price, p.image, p.category, p.rating, p.reviews, p.stock, p.in_stock, p.sku, p.slug, p.badge||null, p.status, p.description, JSON.stringify(p.ingredients), JSON.stringify(p.benefits), p.usage));
console.log(`✅ ${products.length} products seeded`);

// Orders
const insertOrder = db.prepare(`INSERT OR REPLACE INTO orders (id,order_number,user_id,items,subtotal,discount,total,status,payment_status,payment_method,address,tracking_id,courier,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
orders.forEach(o => insertOrder.run(o.id, o.order_number, o.user_id, JSON.stringify(o.items), o.subtotal, o.discount, o.total, o.status, o.payment_status, o.payment_method, JSON.stringify(o.address), o.tracking_id||null, o.courier||null, o.created_at));
console.log(`✅ ${orders.length} orders seeded`);

// Blog
const insertBlog = db.prepare(`INSERT OR REPLACE INTO blog_posts (id,title,slug,excerpt,content,image,author,category,status,tags,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
blogPosts.forEach(b => insertBlog.run(b.id, b.title, b.slug, b.excerpt, b.content, b.image, b.author, b.category, b.status, JSON.stringify(b.tags), b.published_at));
console.log(`✅ ${blogPosts.length} blog posts seeded`);

// Categories
const insertCat = db.prepare(`INSERT OR REPLACE INTO categories (id,name,name_hi,slug) VALUES (?,?,?,?)`);
cats.forEach(c => insertCat.run(c.id, c.name, c.name_hi, c.slug));
console.log(`✅ ${cats.length} categories seeded`);

// CMS
db.prepare('DELETE FROM cms_content').run();
const insertCms = db.prepare(`INSERT INTO cms_content (id,section,content,sort_order) VALUES (?,?,?,?)`);
cmsItems.forEach(c => insertCms.run(uuid(), c.section, JSON.stringify(c.content), c.sort_order));
console.log(`✅ ${cmsItems.length} CMS items seeded`);

console.log('\n🎉 All mock data seeded successfully!');
process.exit(0);
