import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { COUPON_CODE, COUPON_RATE, FREE_SHIPPING_AT, SHIPPING_FEE } from './pricing.js';

function fail(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export async function priceCart(rawItems, couponCode) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw fail('Your bag is empty');
  }

  const ids = rawItems.map((item) => String(item.productId || ''));
  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw fail('A product in your bag is no longer available');
  }
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  const items = [];

  for (const raw of rawItems) {
    const product = byId.get(String(raw.productId));
    if (!product) throw fail('A product in your bag is no longer available');
    const qty = Math.min(10, Math.max(1, Number(raw.qty) || 1));
    if (product.stock < qty) {
      throw fail(product.stock > 0 ? `${product.name} has only ${product.stock} left` : `${product.name} is sold out`);
    }
    items.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.price,
      mrp: product.mrp,
      qty,
      size: String(raw.size || ''),
      color: String(raw.color || ''),
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let coupon = '';
  let couponDiscount = 0;
  const entered = String(couponCode || '').trim().toUpperCase();

  if (entered) {
    if (entered !== COUPON_CODE) throw fail('That coupon code is not valid');
    coupon = entered;
    couponDiscount = Math.round(subtotal * COUPON_RATE);
  }

  const afterDiscount = subtotal - couponDiscount;
  const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;

  return {
    items,
    subtotal,
    coupon,
    couponDiscount,
    shipping,
    total: afterDiscount + shipping,
  };
}
