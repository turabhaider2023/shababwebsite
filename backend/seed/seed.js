import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { demoProducts } from '../data/products.js';
import { isValidPair } from '../data/categories.js';
import { calcPrice } from '../utils/pricing.js';
import { slugify } from '../utils/slug.js';

dotenv.config();

async function renameLegacyBrand() {
  const branded = await Product.find({ brand: /SHABAB/ });
  for (const product of branded) {
    product.brand = product.brand.replaceAll('SHABAB', 'ZAYVORN');
    await product.save();
  }
  if (branded.length) console.log(`Renamed ${branded.length} product brands to ZAYVORN`);

  const oldAdmin = await User.findOne({ email: 'admin@shabab.com' });
  if (oldAdmin) {
    oldAdmin.email = 'admin@zayvorn.com';
    oldAdmin.name = 'ZAYVORN Admin';
    await oldAdmin.save();
  }
  const oldDemo = await User.findOne({ email: 'demo@shabab.com' });
  if (oldDemo) {
    oldDemo.email = 'demo@zayvorn.com';
    await oldDemo.save();
  }
}

export async function ensureSeed() {
  await renameLegacyBrand();

  const admin = await User.findOne({ userId: 'admin' });
  if (!admin) {
    await User.create({
      name: 'ZAYVORN Admin',
      email: 'admin@zayvorn.com',
      userId: 'admin',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin account created');
  }

  const demo = await User.findOne({ email: 'demo@zayvorn.com' });
  if (!demo) {
    await User.create({
      name: 'Demo Shopper',
      email: 'demo@zayvorn.com',
      password: 'demo123',
      phone: '9876543210',
      role: 'user',
    });
  }

  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Catalog already has ${count} products`);
    return;
  }

  const docs = demoProducts.map((item, index) => {
    if (!isValidPair(item.category, item.subcategory)) {
      throw new Error(`Invalid category on ${item.name}`);
    }
    const priced = calcPrice(item.mrp, item.discount || 0);
    const reviews = item.reviews || [];
    const numReviews = reviews.length;
    const rating = numReviews
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews) * 10) / 10
      : 0;

    return {
      name: item.name,
      slug: slugify(item.name),
      description: item.description,
      brand: item.brand || 'ZAYVORN',
      category: item.category,
      subcategory: item.subcategory,
      material: item.material || '',
      sku: `SHB${1001 + index}`,
      images: item.images,
      mrp: priced.mrp,
      discount: priced.discount,
      price: priced.price,
      sizes: item.sizes,
      colors: item.colors,
      stock: item.stock,
      featured: Boolean(item.featured),
      reviews,
      rating,
      numReviews,
      createdAt: new Date(Date.now() - index * 5 * 60 * 60 * 1000),
    };
  });

  await Product.insertMany(docs);
  console.log(`Seeded ${docs.length} demo products`);
}

const entry = process.argv[1] || '';
if (entry.endsWith('seed.js')) {
  connectDB()
    .then(() => ensureSeed())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
