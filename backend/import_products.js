import 'dotenv/config';
import pg from 'pg';
import { v4 as uuid } from 'uuid';

const src = new pg.Pool({ host: '84.247.179.14', port: 5432, user: 'n8n', password: 'AilaptopN8N', database: 'n8n' });
const dst = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const parsePrice = (range) => {
  if (!range) return [0, 0];
  const nums = range.toString().match(/\d+/g)?.map(Number) || [];
  if (nums.length >= 2) return [nums[0], nums[1]];
  if (nums.length === 1) return [nums[0], Math.round(nums[0] * 1.4)];
  return [0, 0];
};

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const importLaptops = async () => {
  const { rows } = await src.query('SELECT * FROM laptops ORDER BY row_number');
  console.log(`📦 Importing ${rows.length} laptops...`);
  let ok = 0;

  for (const p of rows) {
    const [price, originalPrice] = parsePrice(p.price_range);
    if (!price) continue;

    const name = `${p.brand} ${p.model}`.trim();
    const sku = `ALW-${p.brand?.slice(0,3).toUpperCase()}-${String(p.row_number).padStart(3,'0')}`;
    const slug = slugify(`${name}-${sku.toLowerCase()}`);
    const category = p.brand?.toLowerCase().includes('apple') ? 'MacBooks' : 'Laptops';

    const description = [
      p.processor, `${p.ram_gb}GB RAM`, `${p.storage_gb}GB ${p.storage_type || 'SSD'}`,
      p.screen_size ? `${p.screen_size}" Display` : null,
      p.graphics, p.condition ? `Condition: ${p.condition}` : null,
      p.generation ? `${p.generation} Gen` : null
    ].filter(Boolean).join(', ');

    const benefits = JSON.stringify([
      p.processor?.trim(),
      `${p.ram_gb}GB RAM`,
      `${p.storage_gb}GB ${p.storage_type || 'SSD'}`,
      p.screen_size ? `${p.screen_size}" Display` : null,
      p.graphics?.trim(),
      `${p.warranty_in_months || 1} Month Warranty`,
      p.condition ? `${p.condition} Condition` : null
    ].filter(Boolean));

    const focusKeywords = JSON.stringify([
      `${p.brand} ${p.model} indore`,
      `refurbished ${p.brand?.toLowerCase()} laptop indore`,
      `buy ${p.brand?.toLowerCase()} laptop indore`
    ]);

    try {
      await dst.query(
        `INSERT INTO products (id,name,price,original_price,image,category,description,benefits,
          in_stock,stock,sku,slug,status,rating,reviews,meta_title,meta_description,focus_keywords)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active',4.5,0,$13,$14,$15)
         ON CONFLICT (slug) DO NOTHING`,
        [
          uuid(), name, price, originalPrice,
          p.image_url_1 || '', category, description, benefits,
          (p.stock_quantity || 0) > 0 ? 1 : 0, p.stock_quantity || 0,
          sku, slug,
          `${name} | Buy in Indore – AI Laptop Wala`,
          `Buy ${name} at ₹${price.toLocaleString('en-IN')} in Indore. ${description.slice(0,100)}. ${p.warranty_in_months || 1} month warranty. AI Laptop Wala.`,
          focusKeywords
        ]
      );
      console.log(`✅ ${name} — ₹${price}`);
      ok++;
    } catch (e) { console.error(`❌ ${name}:`, e.message); }
  }
  console.log(`\n✅ Laptops: ${ok}/${rows.length} imported`);
};

const importDesktops = async () => {
  const { rows } = await src.query('SELECT * FROM desktops ORDER BY row_number');
  console.log(`\n📦 Importing ${rows.length} desktops...`);
  let ok = 0;

  for (const p of rows) {
    const [price, originalPrice] = parsePrice(p.price_range);
    if (!price) continue;

    const name = `${p.brand} Desktop ${p.model || ''}`.trim();
    const sku = `ALW-DSK-${String(p.row_number).padStart(3,'0')}`;
    const slug = slugify(`${name}-${sku.toLowerCase()}`);

    const description = [
      p.processor, `${p.ram_gb}GB ${p.ram_type || 'RAM'}`,
      `${p.storage_gb}GB SSD`,
      p.monitor_size ? `${p.monitor_size}" Monitor` : null,
      p.graphics, p.condition ? `Condition: ${p.condition}` : null
    ].filter(Boolean).join(', ');

    const benefits = JSON.stringify([
      p.processor?.trim(),
      `${p.ram_gb}GB ${p.ram_type || 'RAM'}`,
      `${p.storage_gb}GB SSD`,
      p.monitor_size ? `${p.monitor_size}" Monitor` : null,
      p.graphics?.trim(),
      `${p.warranty_in_months || 1} Month Warranty`
    ].filter(Boolean));

    try {
      await dst.query(
        `INSERT INTO products (id,name,price,original_price,image,category,description,benefits,
          in_stock,stock,sku,slug,status,rating,reviews,meta_title,meta_description,focus_keywords)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active',4.5,0,$13,$14,$15)
         ON CONFLICT (slug) DO NOTHING`,
        [
          uuid(), name, price, originalPrice,
          p.image_url_1 || '', 'Desktops', description, benefits,
          (p.stock_quantity || 0) > 0 ? 1 : 0, p.stock_quantity || 0,
          sku, slug,
          `${name} | Buy in Indore – AI Laptop Wala`,
          `Buy ${name} at ₹${price.toLocaleString('en-IN')} in Indore. ${description.slice(0,100)}. AI Laptop Wala.`,
          JSON.stringify([`desktop computer indore`, `${p.brand?.toLowerCase()} desktop indore`])
        ]
      );
      console.log(`✅ ${name} — ₹${price}`);
      ok++;
    } catch (e) { console.error(`❌ ${name}:`, e.message); }
  }
  console.log(`\n✅ Desktops: ${ok}/${rows.length} imported`);
};

await importLaptops();
await importDesktops();
await src.end();
await dst.end();
console.log('\n🎉 Import complete!');
