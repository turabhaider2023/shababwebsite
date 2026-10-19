import express from 'express';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminOnly, protect, publicUser, signToken } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const phone = String(req.body.phone || '').trim();

    if (name.length < 2) return res.status(400).json({ message: 'Please enter your name' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name, email, password, phone, role: 'user' });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

router.post(
  '/admin/login',
  asyncHandler(async (req, res) => {
    const userId = String(req.body.userId || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ userId, role: 'admin' }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'User ID or password is incorrect' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json(publicUser(req.user));
  })
);

router.get(
  '/admin/check',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    res.json(publicUser(req.user));
  })
);

export default router;
