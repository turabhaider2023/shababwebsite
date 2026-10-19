import nodemailer from 'nodemailer';
import { orderWhatsAppText } from './whatsapp.js';

export function orderEmailConfig() {
  const to = String(process.env.ADMIN_EMAIL || '').trim();
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '').trim();
  return { to, user, pass, ready: Boolean(to && user && pass) };
}

export async function sendOrderEmail(order) {
  const { to, user, pass, ready } = orderEmailConfig();
  if (!ready) {
    return { sent: false, error: 'Store email is not set up yet' };
  }

  try {
    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"ZAYVORN" <${process.env.SMTP_FROM || user}>`,
      to,
      subject: `New ZAYVORN order ${order.orderNumber}`,
      text: orderWhatsAppText(order),
    });
    return { sent: true, error: '' };
  } catch (error) {
    console.error('Order email failed', error);
    return { sent: false, error: error.message || 'Could not send the order email' };
  }
}
