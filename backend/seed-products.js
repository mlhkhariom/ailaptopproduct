#!/usr/bin/env node
// Seed products from Excel file
// Usage: node seed-products.js [path-to-xlsx]

import XLSX from 'xlsx';
import { v4 as uuid } from 'uuid';
import db from './src/db/database.js';

const filePath = process.argv[2] || '/home/mlhkhariom/Downloads/inventory_master_dropdowns_updated.xlsx';

console.log(`📦 Seeding products from: ${filePath}`);
console.log('─'.repeat(60));

const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]]; // ALL_ITEMS sheet
const rows = XLSX.utils.sheet_to_json(ws);

console.log(`Found ${rows.length} rows in sheet: ${wb.SheetNames[0]}`);

let added = 0, updated = 0, skipped = 0, errors = [];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  try {
    const name = row['PRODUCT NAME'] || '';
    const brand = row['BRAND'] || '';
    const model = row['MODEL / SERIES'] || '';
    const fullName = name || `${brand} ${model}`.trim();
    if (!fullName) { skipped++; continue; }

    const sku = row['SKU'] || '';
    const category = row['CATEGORY OPTION'] || 'Laptops';
    const price = Number(row['SELLING PRICE']) || 0;
    const purchasePrice = Number(row['PURCHASE PRICE']) || 0;
    const stock = Number(row['STOCK']) || Number(row['QUANTITY']) || 0;
    const condition = row['CONDITION'] || row['QUALITY'] || '';
    const color = row['COLOR'] || '';
    const keyboard = row['KEYBOARD'] || '';

    // Build specs
    const specs = [
      row['PROCESSOR COMPANY'] && row['GEN'] ? `${row['PROCESSOR COMPANY']} ${row['GEN']}` : '',
      row['RAM'] || '',
      row['STORAGE'] || '',
      row['SCREEN'] || '',
      row['TOUCH'] === 'Yes' ? 'Touchscreen' : '',
      row['GRAPHICS'] || '',
      row['OTHER FEATURES'] || '',
      keyboard ? `Keyboard: ${keyboard}` : '',
      color ? `Color: ${color}` : '',
    ].filter(Boolean);

    const description = specs.join(' | ');
    const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

    // Badge from condition
    const badge = condition === 'New' ? 'New' : condition === 'Refurbished' ? 'Refurbished' : condition === 'Open Box' ? 'Open Box' : null;

    // Check existing by SKU
    const existing = sku ? await db.prepare('SELECT id FROM products WHERE sku=?').get(sku) : null;

    if (existing) {
      await db.prepare(`UPDATE products SET name=?, price=CASE WHEN ?> 0 THEN ? ELSE price END, original_price=CASE WHEN ?>0 THEN ? ELSE original_price END, stock=?, in_stock=?, category=?, description=?, badge=COALESCE(?,badge), show_public=1 WHERE id=?`)
        .run(fullName, price, price, purchasePrice, purchasePrice, stock, stock > 0 ? 1 : 0, category, description, badge, existing.id);
      updated++;
    } else {
      const id = uuid();
      const finalSlug = slug + '-' + (sku ? sku.toLowerCase().replace(/[^a-z0-9]/g, '') : Date.now().toString().slice(-4));
      await db.prepare(`INSERT INTO products (id, name, price, original_price, category, stock, in_stock, sku, slug, status, description, badge, show_public, rating, reviews) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(id, fullName, price, purchasePrice || null, category, stock, stock > 0 ? 1 : 0, sku || `ALW-${Date.now().toString().slice(-6)}`, finalSlug, 'active', description, badge, 1, 4.5, 0);
      added++;
    }

    if ((i + 1) % 50 === 0) console.log(`  Processed ${i + 1}/${rows.length}...`);
  } catch (e) {
    errors.push(`Row ${i + 2}: ${e.message}`);
  }
}

console.log('─'.repeat(60));
console.log(`✅ Done!`);
console.log(`   Added:   ${added}`);
console.log(`   Updated: ${updated}`);
console.log(`   Skipped: ${skipped}`);
if (errors.length) {
  console.log(`   Errors:  ${errors.length}`);
  errors.slice(0, 5).forEach(e => console.log(`     - ${e}`));
}
console.log('─'.repeat(60));
process.exit(0);
