#!/usr/bin/env node
// Seed products from Excel — with SEO + proper slugs
// Usage: node seed-products.js [path-to-xlsx]

import XLSX from 'xlsx';
import { v4 as uuid } from 'uuid';
import db from './src/db/database.js';

const filePath = process.argv[2] || '/home/mlhkhariom/Downloads/inventory_master_dropdowns_updated.xlsx';

console.log(`📦 Seeding products from: ${filePath}`);
console.log('─'.repeat(60));

const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

console.log(`Found ${rows.length} rows in sheet: ${wb.SheetNames[0]}`);

// Delete old seeded products first
await db.prepare("DELETE FROM products WHERE sku LIKE 'ALW-%'").run();
console.log('🗑️  Cleared old ALW- products');

let added = 0, errors = [];
const usedSlugs = new Set();

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  try {
    const name = row['PRODUCT NAME'] || '';
    const brand = row['BRAND'] || '';
    const model = row['MODEL / SERIES'] || '';
    const fullName = name || `${brand} ${model}`.trim();
    if (!fullName) continue;

    const sku = row['SKU'] || `ALW-${Date.now().toString().slice(-6)}-${i}`;
    const category = row['CATEGORY OPTION'] || 'Laptops';
    const sellingPrice = Number(row['SELLING PRICE']) || 0;
    const purchasePrice = Number(row['PURCHASE PRICE']) || 0;
    const stock = Number(row['STOCK']) || Number(row['QUANTITY']) || 0;
    const condition = row['CONDITION'] || row['QUALITY'] || '';
    const color = row['COLOR'] || '';
    const keyboard = row['KEYBOARD'] || '';
    const processor = row['PROCESSOR COMPANY'] || '';
    const gen = row['GEN'] || '';
    const ram = row['RAM'] || '';
    const storage = row['STORAGE'] || '';
    const screen = row['SCREEN'] || '';
    const touch = row['TOUCH'] || '';
    const graphics = row['GRAPHICS'] || '';
    const otherFeatures = row['OTHER FEATURES'] || '';

    // ── SLUG: product name + model only ──
    let slug = `${fullName}${model && !fullName.includes(model) ? '-' + model : ''}`
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    // Ensure unique
    let dupCount = 2; while (usedSlugs.has(slug)) { slug = slug.replace(/-\d+$/, '') + '-' + dupCount++; }
    usedSlugs.add(slug);

    // ── DESCRIPTION: rich specs ──
    const specs = [processor && gen ? `${processor} ${gen}` : '', ram, storage, screen, touch === 'Yes' ? 'Touchscreen' : '', graphics, otherFeatures, keyboard ? `Keyboard: ${keyboard}` : '', color ? `Color: ${color}` : ''].filter(Boolean);
    const description = specs.join(' | ') || `${brand} ${model}`.trim();

    // ── INGREDIENTS = Specifications array ──
    const ingredients = [processor && gen ? `Processor: ${processor} ${gen}` : '', ram ? `RAM: ${ram}` : '', storage ? `Storage: ${storage}` : '', screen ? `Screen: ${screen}` : '', touch === 'Yes' ? 'Touch: Yes' : '', graphics ? `Graphics: ${graphics}` : '', keyboard ? `Keyboard: ${keyboard}` : '', color ? `Color: ${color}` : ''].filter(Boolean);

    // ── BENEFITS = Key selling points ──
    const benefits = [];
    if (condition) benefits.push(`Condition: ${condition}`);
    if (stock > 0) benefits.push('Ready to Ship');
    benefits.push('90-Day Warranty');
    benefits.push('COD Available');
    if (category === 'LAPTOP' || category === 'APPLE') benefits.push('Free Laptop Bag');

    // ── SEO ──
    const metaTitle = `${fullName} | Buy ${category} in Indore – AI Laptop Wala`;
    const metaDesc = `Buy ${fullName}${ram ? ' ' + ram : ''}${storage ? ' ' + storage : ''} at best price in Indore. ${condition || 'Certified'} with warranty. COD available. AI Laptop Wala.`;
    const focusKeywords = [fullName.toLowerCase(), brand.toLowerCase() + ' laptop indore', category.toLowerCase() + ' indore', 'buy ' + brand.toLowerCase() + ' indore', 'refurbished laptop indore'].filter(k => k.length > 3);

    // ── BADGE ──
    const badge = condition === 'New' ? 'New' : condition === 'Open Box' ? 'Open Box' : category === 'APPLE' ? 'Premium' : null;

    // ── INSERT ──
    const id = uuid();
    await db.prepare(`INSERT INTO products (id, name, name_hi, price, original_price, image, category, rating, reviews, description, ingredients, benefits, usage, in_stock, stock, sku, slug, badge, status, meta_title, meta_description, focus_keywords, show_public, reorder_level) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, fullName, null, sellingPrice, purchasePrice || null, null, category, 4.5, 0, description, JSON.stringify(ingredients), JSON.stringify(benefits), condition || null, stock > 0 ? 1 : 0, stock, sku, slug, badge, 'active', metaTitle.slice(0, 120), metaDesc.slice(0, 200), JSON.stringify(focusKeywords), 1, 5);

    added++;
    if ((i + 1) % 20 === 0) console.log(`  ✓ ${i + 1}/${rows.length}...`);
  } catch (e) {
    errors.push(`Row ${i + 2}: ${e.message}`);
  }
}

console.log('─'.repeat(60));
console.log(`✅ Done!`);
console.log(`   Added:   ${added}`);
if (errors.length) {
  console.log(`   Errors:  ${errors.length}`);
  errors.slice(0, 5).forEach(e => console.log(`     - ${e}`));
}
console.log('─'.repeat(60));

// Show sample
const sample = await db.prepare("SELECT name, slug, meta_title, stock FROM products WHERE sku LIKE 'ALW-%' LIMIT 3").all();
console.log('\n📋 Sample products:');
sample.forEach(p => console.log(`  ${p.name} → /${p.slug} (stock: ${p.stock})`));

process.exit(0);
