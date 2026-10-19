import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/slug.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      category,
      subcategory,
      q,
      sort = 'newest',
      minPrice,
      maxPrice,
      featured,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (featured === 'true') filter.featured = true;

    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (Number.isFinite(min) || Number.isFinite(max)) {
      filter.price = {};
      if (Number.isFinite(min) && minPrice !== '') filter.price.$gte = min;
      if (Number.isFinite(max) && maxPrice !== '') filter.price.$lte = max;
    }

    if (q && String(q).trim()) {
      const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [
        { name: rx },
        { brand: rx },
        { description: rx },
        { category: rx },
        { subcategory: rx },
        { material: rx },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      discount: { discount: -1 },
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .select('-reviews'),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / perPage)),
    });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const related = await Product.find({
      category: product.category,
      subcategory: product.subcategory,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select('-reviews');

    res.json({ product, related });
  })
);

router.post(
  '/:id/reviews',
  protect,
  asyncHandler(async (req, res) => {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Choose a rating from 1 to 5' });
    }
    if (comment.length < 4) return res.status(400).json({ message: 'Write a short review' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = product.reviews.find((review) => String(review.user) === String(req.user._id));
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.name = req.user.name;
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,
      });
    }

    product.numReviews = product.reviews.length;
    product.rating = Math.round((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.numReviews) * 10) / 10;
    await product.save();
    res.status(201).json({ rating: product.rating, numReviews: product.numReviews, reviews: product.reviews });
  })
);

export default router;
