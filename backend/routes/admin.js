import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { CATEGORIES } from '../data/categories.js';
import ExtraSubcategory from '../models/ExtraSubcategory.js';
import { isAllowedSubcategory } from '../utils/catalog.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { handleUpload, removeLocalImages } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calcPrice } from '../utils/pricing.js';
import { slugify } from '../utils/slug.js';
import { whatsAppStatus } from '../utils/whatsapp.js';

const router = express.Router();
router.use(protect, adminOnly);

function bad(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function readFields(body) {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const brand = String(body.brand || 'ZAYVORN').trim() || 'ZAYVORN';
  const material = String(body.material || '').trim();
  const category = String(body.category || '').trim();
  const subcategory = String(body.subcategory || '').trim();

  if (name.length < 2) throw bad('Enter a product name');
  if (description.length < 8) throw bad('Add a short description');
  if (!(await isAllowedSubcategory(category, subcategory))) throw bad('Choose a valid category and subcategory');

  const priced = calcPrice(body.mrp, body.discount);
  if (priced.mrp < 1) throw bad('Enter the crossed price (MRP)');

  const stock = Number(body.stock);
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    throw bad('Stock must be a whole number');
  }

  const sizes = String(body.sizes || '')
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean);

  let colors = [];
  try {
    const parsed = JSON.parse(body.colors || '[]');
    if (Array.isArray(parsed)) {
      colors = parsed
        .filter((color) => color && color.name && color.hex)
        .map((color) => ({ name: String(color.name), hex: String(color.hex) }));
    }
  } catch {
    colors = [];
  }

  return {
    name,
    description,
    brand,
    material,
    category,
    subcategory,
    mrp: priced.mrp,
    discount: priced.discount,
    price: priced.price,
    stock,
    sizes: sizes.length ? sizes : ['One Size'],
    colors: colors.length ? colors : [{ name: 'Black', hex: '#1C1916' }],
    featured: body.featured === 'true' || body.featured === true,
  };
}

function readKeptImages(body) {
  try {
    const parsed = JSON.parse(body.existingImages || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((image) => typeof image === 'string');
  } catch {
    return [];
  }
}

async function uniqueSlug(name, ignoreId) {
  const base = slugify(name) || 'product';
  let slug = base;
  let n = 2;
  while (await Product.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [products, customers, lowStock, orderStats, recentOrders, byCategory] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalPrice', 0] } },
          },
        },
      ]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(6),
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    const stats = orderStats[0] || { orders: 0, revenue: 0 };
    res.json({
      products,
      customers,
      lowStock,
      orders: stats.orders,
      revenue: stats.revenue,
      recentOrders,
      byCategory: CATEGORIES.map((category) => ({
        slug: category.slug,
        name: category.name,
        count: byCategory.find((row) => row._id === category.slug)?.count || 0,
      })),
    });
  })
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 }).select('-reviews');
    res.json(products);
  })
);

router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).select('-reviews');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  })
);

router.post(
  '/products',
  handleUpload,
  asyncHandler(async (req, res) => {
    const fields = await readFields(req.body);
    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
    if (!images.length) throw bad('Add at least one product image');

    const product = await Product.create({
      ...fields,
      images,
      slug: await uniqueSlug(fields.name),
      sku: `SHB${Date.now().toString().slice(-8)}`,
    });
    res.status(201).json(product);
  })
);

router.put(
  '/products/:id',
  handleUpload,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const fields = await readFields(req.body);
    const uploaded = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const kept = readKeptImages(req.body);
    const images = [...kept, ...uploaded];
    if (!images.length) throw bad('Keep or add at least one image');

    const removed = product.images.filter((image) => !images.includes(image));
    removeLocalImages(removed);

    if (fields.name !== product.name) {
      product.slug = await uniqueSlug(fields.name, product._id);
    }

    product.set({ ...fields, images });
    await product.save();
    res.json(product);
  })
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    removeLocalImages(product.images.filter((image) => image.startsWith('/uploads/') && !image.startsWith('/uploads/seed/')));
    await product.deleteOne();
    res.json({ ok: true });
  })
);

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  })
);

router.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  })
);

router.put(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const allowed = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const status = req.body.status;
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Unknown order status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'A cancelled order cannot be reopened' });
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.qty } });
      }
    }

    order.status = status;
    await order.save();
    const populated = await Order.findById(order._id).populate('user', 'name email');
    res.json(populated);
  })
);

router.get(
  '/whatsapp',
  asyncHandler(async (req, res) => {
    res.json(whatsAppStatus());
  })
);

router.post(
  '/subcategories',
  asyncHandler(async (req, res) => {
    const category = String(req.body.category || '').trim();
    const name = String(req.body.name || '').trim();
    const cat = CATEGORIES.find((item) => item.slug === category);
    if (!cat) throw bad('Choose a category');
    if (name.length < 2) throw bad('Enter a subcategory name');

    const slug = slugify(name);
    if (!slug) throw bad('Enter a subcategory name');
    const taken =
      cat.subcategories.some(
        (item) => item.slug === slug || item.name.toLowerCase() === name.toLowerCase()
      ) || (await ExtraSubcategory.exists({ category, slug }));
    if (taken) throw bad('That subcategory already exists');

    const created = await ExtraSubcategory.create({ category, slug, name });
    res.status(201).json(created);
  })
);

router.delete(
  '/subcategories/:id',
  asyncHandler(async (req, res) => {
    const extra = await ExtraSubcategory.findById(req.params.id);
    if (!extra) return res.status(404).json({ message: 'Subcategory not found' });
    const used = await Product.countDocuments({ category: extra.category, subcategory: extra.slug });
    if (used > 0) {
      return res.status(400).json({ message: 'Remove the products in this subcategory first' });
    }
    await extra.deleteOne();
    res.json({ ok: true });
  })
);

export default router;
