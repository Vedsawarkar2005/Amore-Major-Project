import bcrypt from 'bcryptjs';
import { db } from './db.js';

console.log('Seeding database at apps/api/data/amore.db...');

// Clear existing data in users and products
db.prepare('DELETE FROM users').run();
db.prepare('DELETE FROM products').run();

try {
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('users', 'products')").run();
} catch (e) {
  // sqlite_sequence table may not exist yet if no autoincrement rows were created
}

console.log('Cleared existing users and products data.');

// 1. Insert admin and test user
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
const userPasswordHash = bcrypt.hashSync('user123', 10);

const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
);

insertUser.run('Admin User', 'admin@amorecosmetics.in', adminPasswordHash, 'ADMIN');
insertUser.run('Test User', 'client@amorecosmetics.in', userPasswordHash, 'CUSTOMER');

console.log('Inserted admin and test users:');
console.log(' - Admin: admin@amorecosmetics.in / admin123 (Role: ADMIN)');
console.log(' - Customer: client@amorecosmetics.in / user123 (Role: CUSTOMER)');

// 2. Insert 12 mock lipstick products (HVL001 to HVL012)
const lipsticks = [
  {
    sku: 'HVL001',
    name: 'Velvet Ruby',
    description: 'Rich classic red with a luxurious velvety matte finish.',
    shade_hex: '#9B111E',
    image_url: '/images/products/hvl001.jpg'
  },
  {
    sku: 'HVL002',
    name: 'Rose Petal',
    description: 'Soft delicate rose nude designed for everyday elegance.',
    shade_hex: '#C08081',
    image_url: '/images/products/hvl002.jpg'
  },
  {
    sku: 'HVL003',
    name: 'Crimson Luxe',
    description: 'Deep burgundy crimson for bold and sophisticated evening looks.',
    shade_hex: '#800020',
    image_url: '/images/products/hvl003.jpg'
  },
  {
    sku: 'HVL004',
    name: 'Mauve Whisper',
    description: 'Subtle dusty mauve shade with a hydrating satin texture.',
    shade_hex: '#9E5E6F',
    image_url: '/images/products/hvl004.jpg'
  },
  {
    sku: 'HVL005',
    name: 'Coral Bloom',
    description: 'Vibrant coral pink that instantly illuminates all skin tones.',
    shade_hex: '#E55B5B',
    image_url: '/images/products/hvl005.jpg'
  },
  {
    sku: 'HVL006',
    name: 'Berry Crush',
    description: 'Juicy berry tone with ultra-pigmented full-coverage payoff.',
    shade_hex: '#6C244C',
    image_url: '/images/products/hvl006.jpg'
  },
  {
    sku: 'HVL007',
    name: 'Nude Truffle',
    description: 'Warm terracotta nude for an effortless, chic modern aesthetic.',
    shade_hex: '#B87B64',
    image_url: '/images/products/hvl007.jpg'
  },
  {
    sku: 'HVL008',
    name: 'Plum Royale',
    description: 'Regal deep plum delivering intense drama and long-lasting wear.',
    shade_hex: '#4E1A3D',
    image_url: '/images/products/hvl008.jpg'
  },
  {
    sku: 'HVL009',
    name: 'Peachy Keen',
    description: 'Light sweet peach shade with a silky smooth satin formulation.',
    shade_hex: '#F69988',
    image_url: '/images/products/hvl009.jpg'
  },
  {
    sku: 'HVL010',
    name: 'Scarlet Allure',
    description: 'Intense fiery scarlet red making an unforgettable bold statement.',
    shade_hex: '#D32F2F',
    image_url: '/images/products/hvl010.jpg'
  },
  {
    sku: 'HVL011',
    name: 'Spiced Mocha',
    description: 'Cozy chocolate-cinnamon brown delivering warm nude richness.',
    shade_hex: '#7A3E31',
    image_url: '/images/products/hvl011.jpg'
  },
  {
    sku: 'HVL012',
    name: 'Dusty Dahlia',
    description: 'Muted flower-inspired pinkish rose shade for subtle, soft glam.',
    shade_hex: '#B25368',
    image_url: '/images/products/hvl012.jpg'
  }
];

const insertProduct = db.prepare(
  'INSERT INTO products (sku, name, description, price, shade_hex, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const seedLipsticks = db.transaction((items) => {
  for (const item of items) {
    insertProduct.run(
      item.sku,
      item.name,
      item.description,
      349.00,
      item.shade_hex,
      item.image_url,
      50
    );
  }
});

seedLipsticks(lipsticks);

console.log(`Inserted ${lipsticks.length} mock lipstick products (HVL001 - HVL012) at price 349.00 and stock 50.`);
console.log('Database seeding completed successfully.');
