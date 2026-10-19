import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import { ensureSeed } from './seed/seed.js';
import { startWhatsApp } from './utils/whatsapp.js';
import { orderEmailConfig } from './utils/mail.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'ZAYVORN' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({ message: error.message || 'Something went wrong' });
});

const port = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => ensureSeed())
  .then(() => {
    app.listen(port, () => {
      console.log(`ZAYVORN API running at http://localhost:${port}`);
      console.log('Admin login · userId: admin · password: Admin@123');
      console.log('Demo shopper · demo@zayvorn.com · demo123');
      const mail = orderEmailConfig();
      console.log(mail.ready ? `Order emails go to ${mail.to}` : 'Order email is off until ADMIN_EMAIL, SMTP_USER and SMTP_PASS are set');
      startWhatsApp();
    });
  })
  .catch((error) => {
    console.error('Failed to start ZAYVORN API');
    console.error(error);
    process.exit(1);
  });
