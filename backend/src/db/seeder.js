// Auto seeder — runs on backend start, skips if data already exists
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

export const runSeeder = async (db) => {
  console.log('🌱 Running seeder...');

  // ── USERS ──────────────────────────────────────────────
  if (!db.prepare("SELECT id FROM users WHERE email='admin@mlhk.in'").get()) {
    const hash = bcrypt.hashSync('HarioM9165', 10);
    db.prepare("INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)").run(uuid(),'Super Admin','admin@mlhk.in',hash,'superadmin','+91 98934 96163');
    console.log('✅ Super Admin created: admin@mlhk.in');
  }
  if (!db.prepare("SELECT id FROM users WHERE email='admin@ailaptopwala.com'").get()) {
    const hash = bcrypt.hashSync('Laptop@9165', 10);
    db.prepare("INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)").run(uuid(),'Admin','admin@ailaptopwala.com',hash,'admin','+91 98934 96163');
    console.log('✅ Admin created: admin@ailaptopwala.com');
  }

  // ── APP SETTINGS ───────────────────────────────────────
  const settings = [
    ['store_name','AI Laptop Wala'],['store_tagline','Buy, Sell & Repair Laptops in Indore'],
    ['store_email','contact@ailaptopwala.com'],['store_phone','+91 98934 96163'],
    ['store_website','https://ailaptopwala.com'],
    ['store_address','LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001'],
    ['store_address2','21, G3, Sai Residency, Ashish Nagar, Near Bangali Chouraha, Indore, MP 452016'],
    ['store_map1','https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9'],
    ['store_map2','https://maps.app.goo.gl/drVLkuS9tGjEmwUF7'],
    ['store_geo1','22.7166372,75.8737741'],['store_geo2','22.7161819,75.9079282'],
    ['store_instagram','https://www.instagram.com/ailaptopwala'],
    ['store_youtube','https://www.youtube.com/@AiLaptopwalaindore'],
    ['store_facebook','https://www.facebook.com/profile.php?id=61563386652422'],
    ['store_justdial1','https://www.justdial.com/Indore/Ai-Laptop-Wala/0731PX731-X731-251014151403-Y2S4_BZDET'],
    ['store_indiamart','https://www.indiamart.com/asati-infotech'],
    ['whatsapp_number','919893496163'],['store_founded','2011'],
    ['store_customers','5000+'],['store_rating','4.8'],
    ['store_founder','Bhagwan Das Asati'],['store_company','Asati Infotech'],
    ['store_ceo','Nitin Asati'],['store_gst','23ATNPA4415H1Z2'],
    ['shipping_free_above','5000'],['shipping_flat_rate','150'],
    ['razorpay_key_id',''],['razorpay_key_secret',''],
    ['seo_title','AI Laptop Wala Indore – Best Laptop Shop | MacBook, Gaming, Refurbished'],
    ['seo_description','AI Laptop Wala – Indore most trusted laptop store since 2011. Certified refurbished laptops, MacBooks, gaming laptops. Expert repair at Silver Mall.'],
    ['seo_keywords','AI Laptop Wala, laptop shop Indore, refurbished laptop Indore, MacBook Indore, laptop repair Indore, Asati Infotech'],
  ];
  const upsertSetting = db.prepare("INSERT OR IGNORE INTO app_settings (key,value) VALUES (?,?)");
  settings.forEach(([k,v]) => upsertSetting.run(k,v));

  // ── AI AGENT ───────────────────────────────────────────
  if (!db.prepare("SELECT id FROM ai_agent_settings WHERE id='main'").get()) {
    db.prepare("INSERT INTO ai_agent_settings (id,enabled,system_prompt) VALUES ('main',0,?)").run(
      `You are a helpful AI assistant for AI Laptop Wala, Indore.
BRANCHES: 1) Silver Mall, LB-21 Block-B, RNT Marg | 2) Near Bangali Chouraha, Indore
PHONE: +91 98934 96163 | TIMING: Mon-Sat 10AM-8PM
WE SELL: Certified refurbished laptops, MacBooks, gaming laptops, desktops, accessories
REPAIR: Screen, battery, keyboard, SSD/RAM upgrade, OS, virus removal, motherboard, data recovery, home service
Reply in same language as customer (Hindi/English/Hinglish). Be friendly and concise.`
    );
  }

  // ── CATEGORIES ─────────────────────────────────────────
  if (!db.prepare("SELECT id FROM categories LIMIT 1").get()) {
    const cats = [
      ['Laptops','laptops','Certified refurbished laptops — Dell, HP, Lenovo, Asus'],
      ['MacBooks','macbooks','Open-box MacBooks at best price in Indore'],
      ['Gaming','gaming','Gaming laptops — Asus ROG, Lenovo Legion, HP Omen'],
      ['Business','business','Business laptops — Dell Latitude, HP EliteBook, ThinkPad'],
      ['Accessories','accessories','Laptop bags, chargers, cooling pads, keyboards'],
      ['Repair Services','repair-services','Expert laptop repair & upgrade services'],
      ['Desktops','desktops','Refurbished desktops — Dell OptiPlex, HP ProDesk'],
    ];
    const ins = db.prepare("INSERT OR IGNORE INTO categories (id,name,slug,description) VALUES (?,?,?,?)");
    cats.forEach(([n,s,d]) => ins.run(uuid(),n,s,d));
    console.log('✅ Categories seeded');
  }

  // ── PRODUCTS ───────────────────────────────────────────
  if (!db.prepare("SELECT id FROM products LIMIT 1").get()) {
    const ins = db.prepare(`INSERT OR IGNORE INTO products
      (id,name,price,original_price,category,stock,in_stock,sku,slug,badge,description,benefits,meta_title,meta_description,focus_keywords,image,rating,reviews,status)
      VALUES (?,?,?,?,?,?,1,?,?,?,?,?,?,?,?,?,4.8,0,'active')`);
    const P = [
      ['Dell Latitude E7470',18999,35000,'Laptops',5,'ALW-DELL-001','dell-latitude-e7470','Best Seller','Intel Core i5 6th Gen, 8GB RAM, 256GB SSD, 14" FHD. Certified refurbished with 6 month warranty.',JSON.stringify(['Intel Core i5 6th Gen','8GB DDR4 RAM','256GB SSD','14" Full HD','Windows 11 Pro','6 Month Warranty']),'Dell Latitude E7470 Refurbished — Buy in Indore | AI Laptop Wala','Buy Dell Latitude E7470 refurbished in Indore at ₹18,999. i5, 8GB RAM, 256GB SSD. 6 month warranty.',JSON.stringify(['dell latitude indore','refurbished dell laptop indore']),'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'],
      ['HP EliteBook 840 G5',24999,55000,'Business',3,'ALW-HP-002','hp-elitebook-840-g5','Premium','Intel Core i7 8th Gen, 16GB RAM, 512GB SSD, 14" FHD. Business grade laptop.',JSON.stringify(['Intel Core i7 8th Gen','16GB DDR4 RAM','512GB NVMe SSD','14" Full HD IPS','Fingerprint Reader','6 Month Warranty']),'HP EliteBook 840 G5 Refurbished — Buy in Indore | AI Laptop Wala','Buy HP EliteBook 840 G5 refurbished in Indore at ₹24,999. i7, 16GB RAM, 512GB SSD.',JSON.stringify(['hp elitebook indore','business laptop indore']),'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop'],
      ['Apple MacBook Pro 2019',54999,120000,'MacBooks',2,'ALW-MAC-003','macbook-pro-2019','Open Box','Intel Core i5, 8GB RAM, 256GB SSD, 13" Retina Display. Open box with original accessories.',JSON.stringify(['Intel Core i5','8GB RAM','256GB SSD','13" Retina Display','Touch Bar','macOS Ventura','6 Month Warranty']),'MacBook Pro 2019 Open Box — Buy in Indore | AI Laptop Wala','Buy MacBook Pro 2019 open box in Indore at ₹54,999. 8GB RAM, 256GB SSD, Retina Display.',JSON.stringify(['macbook pro indore','apple macbook indore']),'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'],
      ['Lenovo ThinkPad T480',21999,48000,'Business',4,'ALW-LEN-004','lenovo-thinkpad-t480',null,'Intel Core i5 8th Gen, 8GB RAM, 256GB SSD, 14" FHD. Military grade durability.',JSON.stringify(['Intel Core i5 8th Gen','8GB DDR4 RAM','256GB SSD','14" Full HD','Military Grade Build','6 Month Warranty']),'Lenovo ThinkPad T480 Refurbished — Buy in Indore | AI Laptop Wala','Buy Lenovo ThinkPad T480 refurbished in Indore at ₹21,999. i5 8th Gen, 8GB RAM.',JSON.stringify(['thinkpad indore','lenovo laptop indore']),'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'],
      ['ASUS ROG Strix G15',64999,95000,'Gaming',2,'ALW-ROG-005','asus-rog-strix-g15','Gaming','AMD Ryzen 7, 16GB RAM, 512GB SSD, RTX 3060, 15.6" 144Hz. Ultimate gaming performance.',JSON.stringify(['AMD Ryzen 7 5800H','16GB DDR4 RAM','512GB NVMe SSD','RTX 3060 6GB','15.6" 144Hz Display','RGB Keyboard','6 Month Warranty']),'ASUS ROG Strix G15 Gaming Laptop — Buy in Indore | AI Laptop Wala','Buy ASUS ROG Strix G15 gaming laptop in Indore at ₹64,999. Ryzen 7, RTX 3060, 144Hz.',JSON.stringify(['gaming laptop indore','asus rog indore']),'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop'],
      ['Dell OptiPlex 7050 Desktop',14999,30000,'Desktops',6,'ALW-OPT-006','dell-optiplex-7050',null,'Intel Core i5 7th Gen, 8GB RAM, 256GB SSD. Ideal for office and home use.',JSON.stringify(['Intel Core i5 7th Gen','8GB DDR4 RAM','256GB SSD','Windows 11 Pro','Small Form Factor','6 Month Warranty']),'Dell OptiPlex 7050 Refurbished Desktop — Buy in Indore | AI Laptop Wala','Buy Dell OptiPlex 7050 refurbished desktop in Indore at ₹14,999. i5, 8GB RAM.',JSON.stringify(['desktop computer indore','dell desktop indore']),'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop'],
      ['Laptop Cooling Pad',799,1499,'Accessories',20,'ALW-ACC-007','laptop-cooling-pad',null,'Universal laptop cooling pad with 2 fans. Compatible with 12-17 inch laptops.',JSON.stringify(['2 High Speed Fans','USB Powered','Compatible 12-17 inch','LED Lighting','Quiet Operation']),'Laptop Cooling Pad — Buy in Indore | AI Laptop Wala','Buy laptop cooling pad in Indore at ₹799. Universal fit, USB powered. AI Laptop Wala.',JSON.stringify(['laptop cooling pad indore','laptop accessories indore']),'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'],
      ['Laptop Screen Replacement',2499,4000,'Repair Services',99,'ALW-SVC-008','laptop-screen-replacement',null,'Professional laptop screen replacement. All brands. Same day service available.',JSON.stringify(['All Brands Supported','Same Day Service','6 Month Warranty on Screen','Free Diagnosis','Home Pickup Available']),'Laptop Screen Replacement Indore — AI Laptop Wala','Laptop screen replacement in Indore from ₹2,499. All brands. Same day. AI Laptop Wala.',JSON.stringify(['laptop screen replacement indore','screen repair indore']),'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop'],
    ];
    P.forEach(p => ins.run(uuid(),...p));
    console.log('✅ Products seeded');
  }

  // ── SERVICES ───────────────────────────────────────────
  if (!db.prepare("SELECT id FROM services LIMIT 1").get()) {
    const ins = db.prepare("INSERT OR IGNORE INTO services (id,name,description,price,duration,category) VALUES (?,?,?,?,?,?)");
    [
      ['Screen Replacement','Laptop screen replacement for all brands. Genuine parts, same day service.',2499,'2-4 hours','repair'],
      ['Battery Replacement','Original battery replacement. All brands. Free diagnosis included.',1499,'1-2 hours','repair'],
      ['Keyboard Repair','Keyboard replacement or key repair. All laptop models.',999,'1-3 hours','repair'],
      ['SSD Upgrade','Upgrade to SSD for faster performance. 256GB/512GB/1TB options.',1999,'1-2 hours','upgrade'],
      ['RAM Upgrade','Increase RAM for better multitasking. 8GB/16GB options.',1499,'30 mins','upgrade'],
      ['OS Installation','Windows 10/11 or Linux installation with all drivers.',799,'1-2 hours','software'],
      ['Virus Removal','Complete virus/malware removal and system cleanup.',599,'2-3 hours','software'],
      ['Motherboard Repair','Expert motherboard diagnosis and repair service.',2999,'1-3 days','repair'],
      ['Data Recovery','Recover lost data from hard drive, SSD or damaged laptop.',1999,'1-2 days','recovery'],
      ['Annual Maintenance','Complete laptop servicing — cleaning, thermal paste, optimization.',999,'2-4 hours','maintenance'],
    ].forEach(([n,d,p,dur,cat]) => ins.run(uuid(),n,d,p,dur,cat));
    console.log('✅ Services seeded');
  }

  // ── COUPONS ────────────────────────────────────────────
  if (!db.prepare("SELECT id FROM coupons LIMIT 1").get()) {
    const ins = db.prepare("INSERT OR IGNORE INTO coupons (id,code,type,value,min_order,is_active) VALUES (?,?,?,?,?,1)");
    [['ALW10','percentage',10,999],['FLAT200','flat',200,1999],['WELCOME15','percentage',15,999],['FREESHIP','flat',150,0]].forEach(([c,t,v,m]) => ins.run(uuid(),c,t,v,m));
    console.log('✅ Coupons seeded');
  }

  // ── WHATSAPP RULES ─────────────────────────────────────
  if (!db.prepare("SELECT id FROM whatsapp_rules LIMIT 1").get()) {
    const ins = db.prepare("INSERT OR IGNORE INTO whatsapp_rules (id,name,keywords,response_template,type,is_active,match_count) VALUES (?,?,?,?,?,1,0)");
    [
      ['Greeting',['hello','hi','namaste','helo','hey'],'Namaste! 🙏 AI Laptop Wala mein aapka swagat hai!\n\nHum aapki kaise madad kar sakte hain?\n💻 Laptop khareedna\n🔧 Repair/Service\n📦 Order Status\n\nCall: +91 98934 96163','greeting'],
      ['Repair Query',['repair','fix','screen','battery','keyboard','virus','slow','hang','kharab','toot','thik'],'🔧 Laptop Repair Services:\n\n• Screen Replacement — ₹2,499\n• Battery Replacement — ₹1,499\n• SSD Upgrade — ₹1,999\n• Virus Removal — ₹599\n\nBook: ailaptopwala.com/services\nCall: +91 98934 96163\n\n📍 Silver Mall, RNT Marg, Indore\n📍 Near Bangali Chouraha, Indore','repair'],
      ['Order Status',['order','status','kahan','track','delivery'],'Apna Order ID batayein (ALW-XXXXXX)\nTrack: ailaptopwala.com/track-order 📦','order'],
      ['Location',['address','kahan','location','shop','branch','silver mall','bangali'],'📍 AI Laptop Wala — 2 Branches:\n\n1️⃣ Silver Mall: LB-21, Block-B, Silver Mall, RNT Marg, Indore\nhttps://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9\n\n2️⃣ Bangali Chouraha: 21, G3, Sai Residency, Indore\nhttps://maps.app.goo.gl/drVLkuS9tGjEmwUF7\n\n⏰ Mon-Sat: 10AM-8PM','location'],
      ['Thank You',['thanks','thank you','shukriya','dhanyawad'],'Bahut shukriya! 🙏 AI Laptop Wala pe aapka vishwas hamare liye bahut mayne rakhta hai!','greeting'],
    ].forEach(([n,kw,tmpl,type]) => ins.run(uuid(),n,JSON.stringify(kw),tmpl,type));
    console.log('✅ WhatsApp rules seeded');
  }

  // ── CMS CONTENT ────────────────────────────────────────
  if (!db.prepare("SELECT id FROM cms_content LIMIT 1").get()) {
    const ins = db.prepare("INSERT OR IGNORE INTO cms_content (id,section,content,sort_order,is_active) VALUES (?,?,?,?,1)");
    [
      ['banner',{title:'Best Refurbished Laptops in Indore',subtitle:'Certified quality at 50% off MRP. Dell, HP, Lenovo, MacBook, Gaming laptops. 6 Month Warranty.',cta:'Shop Now',image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=500&fit=crop'},1],
      ['banner',{title:'Expert Laptop Repair & Home Service',subtitle:'Same day repair for all brands. Free home pickup in Indore. Screen, Battery, SSD, RAM & more.',cta:'Book Repair',image:'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&h=500&fit=crop'},2],
      ['benefit',{icon:'Laptop',title:'Certified Refurbished',description:'Every laptop tested & certified. Grade A quality. 6 month warranty on all products.'},1],
      ['benefit',{icon:'Shield',title:'6 Month Warranty',description:'All products come with 6 month warranty. Free repair if any issue within warranty period.'},2],
      ['benefit',{icon:'Truck',title:'Free Delivery Indore',description:'Free home delivery in Indore. Pan-India shipping available at flat ₹150.'},3],
      ['benefit',{icon:'Wrench',title:'Expert Repair',description:'Same day repair for all brands. Screen, battery, keyboard, SSD/RAM & more.'},4],
      ['testimonial',{name:'Amit Sharma',text:'Bought a Dell Latitude from AI Laptop Wala. Excellent condition, works like new! Great service by Bhagwan Das ji.',rating:5,avatar:'AS',location:'Indore'},1],
      ['testimonial',{name:'Priya Verma',text:'Got my MacBook Pro screen replaced in just 2 hours. Very professional team and reasonable price.',rating:5,avatar:'PV',location:'Indore'},2],
      ['testimonial',{name:'Rahul Patel',text:'Best place to buy refurbished laptops in Indore. Trusted shop at Silver Mall. Highly recommended!',rating:5,avatar:'RP',location:'Indore'},3],
      ['testimonial',{name:'Neha Joshi',text:'SSD upgrade done in 30 minutes. Laptop is super fast now. Very happy with the service!',rating:4,avatar:'NJ',location:'Indore'},4],
      ['faq',{question:'Are refurbished laptops reliable?',answer:'Yes! All our laptops are thoroughly tested, cleaned and certified before sale. We provide 6 month warranty on every product. Grade A quality guaranteed.',category:'Products'},1],
      ['faq',{question:'How long does repair take?',answer:'Most repairs are done same day — screen replacement, battery, keyboard, RAM/SSD upgrade. Complex repairs like motherboard may take 2-3 days.',category:'Repair'},2],
      ['faq',{question:'Do you offer home pickup for repair?',answer:'Yes! We offer free home pickup and delivery for repair in Indore city. Call or WhatsApp us at +91 98934 96163 to schedule.',category:'Repair'},3],
      ['faq',{question:'What payment methods do you accept?',answer:'We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and Cash on Delivery via Razorpay payment gateway.',category:'Payment'},4],
      ['faq',{question:'Do you buy old laptops?',answer:'Yes! We buy old laptops, MacBooks and desktops. WhatsApp us photos and we will give you the best price. Visit our store at Silver Mall, Indore.',category:'Sell'},5],
      ['faq',{question:'Where are your branches?',answer:'Branch 1: LB-21, Block-B, Silver Mall, 8-A, RNT Marg, Indore. Branch 2: 21, G3, Sai Residency, Near Bangali Chouraha, Indore. Open Mon-Sat 10AM-8PM.',category:'Store'},6],
    ].forEach(([s,c,o]) => ins.run(uuid(),s,JSON.stringify(c),o));
    console.log('✅ CMS content seeded');
  }

  console.log('✅ Seeder complete');
};
