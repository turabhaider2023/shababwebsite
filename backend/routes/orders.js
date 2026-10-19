import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { priceCart } from '../utils/cartPricing.js';
import { notifyAdminOnWhatsApp, orderWhatsAppUrl } from '../utils/whatsapp.js';
import { sendOrderEmail } from '../utils/mail.js';

const router = express.Router();

router.post(
  '/quote',
  asyncHandler(async (req, res) => {
    const priced = await priceCart(req.body.items, req.body.coupon);
    res.json(priced);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const address = req.body.shippingAddress || {};
    const fullName = String(address.fullName || '').trim();
    const phone = String(address.phone || '').replace(/\D/g, '');
    const line1 = String(address.line1 || '').trim();
    const line2 = String(address.line2 || '').trim();
    const landmark = String(address.landmark || '').trim();
    const city = String(address.city || '').trim();
    const state = String(address.state || '').trim();
    const pincode = String(address.pincode || '').trim();
    const age = Number(address.age);

    if (fullName.length < 2) return res.status(400).json({ message: 'Enter the customer name' });
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return res.status(400).json({ message: 'Enter a valid age' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a 10-digit mobile number' });
    }
    if (line1.length < 3) return res.status(400).json({ message: 'Enter address line 1' });
    if (city.length < 2) return res.status(400).json({ message: 'Enter the city' });
    if (state.length < 2) return res.status(400).json({ message: 'Choose a state' });
    if (!/^\d{6}$/.test(pincode)) return res.status(400).json({ message: 'Enter a 6-digit PIN code' });

    const paymentMethod = req.body.paymentMethod;
    if (!['cod', 'upi', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Choose a payment method' });
    }

    const priced = await priceCart(req.body.items, req.body.coupon);
    const reserved = [];

    try {
      for (const item of priced.items) {
        const updated = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } }
        );
        if (!updated.modifiedCount) {
          const error = new Error(`${item.name} just went out of stock`);
          error.status = 400;
          throw error;
        }
        reserved.push(item);
      }
    } catch (error) {
      for (const item of reserved) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.qty } });
      }
      throw error;
    }

    const order = await Order.create({
      orderNumber: `SHB${Date.now().toString(36).toUpperCase()}`,
      items: priced.items,
      shippingAddress: {
        fullName,
        age,
        phone,
        line1,
        line2,
        landmark,
        city,
        state,
        pincode,
      },
      paymentMethod,
      subtotal: priced.subtotal,
      coupon: priced.coupon,
      couponDiscount: priced.couponDiscount,
      shipping: priced.shipping,
      totalPrice: priced.total,
    });

    const [whatsapp, email] = await Promise.all([notifyAdminOnWhatsApp(order), sendOrderEmail(order)]);
    order.whatsappSent = whatsapp.sent;
    order.whatsappError = whatsapp.error || '';
    order.emailSent = email.sent;
    order.emailError = email.error || '';
    await order.save();
    res.status(201).json({ ...order.toObject(), whatsappUrl: whatsapp.url });
  })
);

router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ ...order.toObject(), whatsappUrl: orderWhatsAppUrl(order) });
  })
);

export default router;
