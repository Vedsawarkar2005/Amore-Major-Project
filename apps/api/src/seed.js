import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { encrypt } from './utils/crypto.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const lipsticks = [
  {
    sku: 'HVL001',
    name: 'HydraVelvet Matte Lipstick - Velvet Ruby',
    shade_name: 'Velvet Ruby',
    hex_code: '#9B111E',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl001.jpg',
    finish: 'Velvet Matte',
    description: 'Rich classic red with a luxurious velvety matte finish.',
  },
  {
    sku: 'HVL002',
    name: 'HydraVelvet Matte Lipstick - Rose Petal',
    shade_name: 'Rose Petal',
    hex_code: '#C08081',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl002.jpg',
    finish: 'Velvet Matte',
    description: 'Soft delicate rose nude designed for everyday elegance.',
  },
  {
    sku: 'HVL003',
    name: 'HydraVelvet Matte Lipstick - Crimson Luxe',
    shade_name: 'Crimson Luxe',
    hex_code: '#800020',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl003.jpg',
    finish: 'Velvet Matte',
    description: 'Deep burgundy crimson for bold and sophisticated evening looks.',
  },
  {
    sku: 'HVL004',
    name: 'HydraVelvet Matte Lipstick - Mauve Whisper',
    shade_name: 'Mauve Whisper',
    hex_code: '#9E5E6F',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl004.jpg',
    finish: 'Hydrating Satin',
    description: 'Subtle dusty mauve shade with a hydrating satin texture.',
  },
  {
    sku: 'HVL005',
    name: 'HydraVelvet Matte Lipstick - Coral Bloom',
    shade_name: 'Coral Bloom',
    hex_code: '#E55B5B',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl005.jpg',
    finish: 'Velvet Matte',
    description: 'Vibrant coral pink that instantly illuminates all skin tones.',
  },
  {
    sku: 'HVL006',
    name: 'HydraVelvet Matte Lipstick - Berry Crush',
    shade_name: 'Berry Crush',
    hex_code: '#6C244C',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl006.jpg',
    finish: 'Velvet Matte',
    description: 'Juicy berry tone with ultra-pigmented full-coverage payoff.',
  },
  {
    sku: 'HVL007',
    name: 'HydraVelvet Matte Lipstick - Nude Truffle',
    shade_name: 'Nude Truffle',
    hex_code: '#B87B64',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl007.jpg',
    finish: 'Velvet Matte',
    description: 'Warm terracotta nude for an effortless, chic modern aesthetic.',
  },
  {
    sku: 'HVL008',
    name: 'HydraVelvet Matte Lipstick - Plum Royale',
    shade_name: 'Plum Royale',
    hex_code: '#4E1A3D',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl008.jpg',
    finish: 'Velvet Matte',
    description: 'Regal deep plum delivering intense drama and long-lasting wear.',
  },
  {
    sku: 'HVL009',
    name: 'HydraVelvet Matte Lipstick - Peachy Keen',
    shade_name: 'Peachy Keen',
    hex_code: '#F69988',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl009.jpg',
    finish: 'Silky Satin',
    description: 'Light sweet peach shade with a silky smooth satin formulation.',
  },
  {
    sku: 'HVL010',
    name: 'HydraVelvet Matte Lipstick - Scarlet Allure',
    shade_name: 'Scarlet Allure',
    hex_code: '#D32F2F',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl010.jpg',
    finish: 'Velvet Matte',
    description: 'Intense fiery scarlet red making an unforgettable bold statement.',
  },
  {
    sku: 'HVL011',
    name: 'HydraVelvet Matte Lipstick - Spiced Mocha',
    shade_name: 'Spiced Mocha',
    hex_code: '#7A3E31',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl011.jpg',
    finish: 'Velvet Matte',
    description: 'Cozy chocolate-cinnamon brown delivering warm nude richness.',
  },
  {
    sku: 'HVL012',
    name: 'HydraVelvet Matte Lipstick - Dusty Dahlia',
    shade_name: 'Dusty Dahlia',
    hex_code: '#B25368',
    price: 349.00,
    stock_quantity: 50,
    image_url: '/images/products/hvl012.jpg',
    finish: 'Soft Matte',
    description: 'Muted flower-inspired pinkish rose shade for subtle, soft glam.',
  },
];

/**
 * Initializes database tables using schema.sql
 */
export async function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
  }
}

/**
 * Seeds the PostgreSQL database with HydraVelvet products and initial users
 */
export async function seedDatabase({ force = true } = {}) {
  console.log('Seeding PostgreSQL database...');
  await initSchema();

  if (force) {
    await pool.query('TRUNCATE TABLE order_items, orders, products, users RESTART IDENTITY CASCADE;');
  }

  // Ensure default users exist
  const existingUsersRes = await pool.query('SELECT COUNT(*) as count FROM users');
  const userCount = parseInt(existingUsersRes.rows[0]?.count || '0', 10);

  if (force || userCount === 0) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    const adminPhoneEnc = encrypt('+91 98765 43210');
    const adminAddressEnc = encrypt('Amore HQ, 101 Fashion Blvd, Mumbai, MH');
    const customerPhoneEnc = encrypt('+91 98765 01234');
    const customerAddressEnc = encrypt('456 Marine Drive, Mumbai, MH 400020');

    const userInsertQuery = `
      INSERT INTO users (email, password_hash, role, encrypted_phone, encrypted_address)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        encrypted_phone = EXCLUDED.encrypted_phone,
        encrypted_address = EXCLUDED.encrypted_address;
    `;

    await pool.query(userInsertQuery, [
      'admin@amorecosmetics.in',
      adminPasswordHash,
      'admin',
      adminPhoneEnc,
      adminAddressEnc,
    ]);

    await pool.query(userInsertQuery, [
      'client@amorecosmetics.in',
      userPasswordHash,
      'customer',
      customerPhoneEnc,
      customerAddressEnc,
    ]);

    console.log('Inserted default users (1 admin, 1 customer with encrypted phone/address).');
  }

  // Ensure products exist
  const existingProductsRes = await pool.query('SELECT COUNT(*) as count FROM products');
  const productCount = parseInt(existingProductsRes.rows[0]?.count || '0', 10);

  if (force || productCount === 0) {
    const productInsertQuery = `
      INSERT INTO products (sku, name, shade_name, hex_code, price, stock_quantity, image_url, finish, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        shade_name = EXCLUDED.shade_name,
        hex_code = EXCLUDED.hex_code,
        price = EXCLUDED.price,
        stock_quantity = EXCLUDED.stock_quantity,
        image_url = EXCLUDED.image_url,
        finish = EXCLUDED.finish,
        description = EXCLUDED.description;
    `;

    for (const item of lipsticks) {
      await pool.query(productInsertQuery, [
        item.sku,
        item.name,
        item.shade_name,
        item.hex_code,
        item.price,
        item.stock_quantity,
        item.image_url,
        item.finish,
        item.description,
      ]);
    }

    console.log(`Inserted ${lipsticks.length} HydraVelvet products.`);
  }

  console.log('PostgreSQL database seeded successfully.');
}

export async function ensureSeeded() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping automatic database seed.');
    return;
  }
  try {
    const res = await pool.query('SELECT COUNT(*) as count FROM products');
    if (!res.rows[0] || parseInt(res.rows[0].count, 10) === 0) {
      console.log('Database empty. Running automatic seed on startup...');
      await seedDatabase({ force: false });
    }
  } catch (err) {
    console.warn('Could not verify database seed state:', err.message);
  }
}

// Run directly if called as a script
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('src/seed.js')) {
  seedDatabase({ force: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
