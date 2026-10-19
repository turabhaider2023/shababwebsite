import path from 'path';
import { fileURLToPath } from 'url';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode';

const sessionDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/wa-session');

const PAYMENT = {
  cod: 'Cash on delivery',
  upi: 'UPI',
  card: 'Card',
};

let sock = null;
let connected = false;
let qrDataUrl = '';
let lastError = '';
let starting = false;
let reconnectTimer = null;

function rupees(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function adminWhatsAppNumber() {
  return String(process.env.ADMIN_WHATSAPP || '919891344042').replace(/\D/g, '');
}

export function orderWhatsAppText(order) {
  const address = order.shippingAddress || {};
  const lines = (order.items || []).map((item, index) => {
    const detail = [item.color, item.size].filter(Boolean).join(', ');
    return `${index + 1}. ${item.name} x${item.qty}${detail ? ` (${detail})` : ''} — ${rupees(item.price * item.qty)}`;
  });

  return [
    'New ZAYVORN order',
    `Order: ${order.orderNumber}`,
    `Name: ${address.fullName || 'Customer'}`,
    address.age ? `Age: ${address.age}` : '',
    `Mobile: ${address.phone || ''}`,
    `Address line 1: ${address.line1 || ''}`,
    address.line2 ? `Address line 2: ${address.line2}` : '',
    address.landmark ? `Landmark: ${address.landmark}` : '',
    `City: ${address.city || ''}`,
    `State: ${address.state || ''}`,
    `PIN code: ${address.pincode || ''}`,
    `Payment: ${PAYMENT[order.paymentMethod] || order.paymentMethod}`,
    '',
    'Items:',
    ...lines,
    '',
    `Subtotal: ${rupees(order.subtotal)}`,
    order.couponDiscount ? `Coupon ${order.coupon}: -${rupees(order.couponDiscount)}` : '',
    `Shipping: ${order.shipping ? rupees(order.shipping) : 'Free'}`,
    `Total: ${rupees(order.totalPrice)}`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function orderWhatsAppUrl(order) {
  const phone = adminWhatsAppNumber();
  return `https://wa.me/${phone}?text=${encodeURIComponent(orderWhatsAppText(order))}`;
}

export function whatsAppStatus() {
  return {
    connected,
    number: adminWhatsAppNumber(),
    qr: connected ? '' : qrDataUrl,
    error: connected ? '' : lastError,
  };
}

function scheduleRestart() {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    sock = null;
    startWhatsApp();
  }, 4000);
}

export async function startWhatsApp() {
  if (starting || sock) return;
  starting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    let version;
    try {
      ({ version } = await fetchLatestBaileysVersion());
    } catch {
      version = undefined;
    }

    const socket = makeWASocket({
      auth: state,
      version,
      logger: pino({ level: 'silent' }),
      browser: Browsers.windows('Chrome'),
    });
    sock = socket;

    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', async (update) => {
      if (sock !== socket) return;
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        connected = false;
        qrDataUrl = await qrcode.toDataURL(qr);
        lastError = '';
        console.log(`WhatsApp QR is ready. Scan it with your own phone. Orders go to +${adminWhatsAppNumber()}`);
      }
      if (connection === 'open') {
        connected = true;
        qrDataUrl = '';
        lastError = '';
        console.log(`WhatsApp linked. Orders are sent to +${adminWhatsAppNumber()}`);
      }
      if (connection === 'close') {
        connected = false;
        qrDataUrl = '';
        const code = lastDisconnect?.error?.output?.statusCode;
        lastError = 'WhatsApp disconnected. Scan the QR again if it stays offline.';
        sock = null;
        console.error('WhatsApp connection closed', code || '');
        if (code !== DisconnectReason.loggedOut) scheduleRestart();
      }
    });
  } catch (error) {
    sock = null;
    connected = false;
    lastError = error.message || 'Could not start WhatsApp';
    console.error('WhatsApp start failed', error);
    scheduleRestart();
  } finally {
    starting = false;
  }
}

export async function notifyAdminOnWhatsApp(order) {
  const url = orderWhatsAppUrl(order);
  if (!sock || !connected) {
    return { url, sent: false, error: 'WhatsApp is not linked yet' };
  }
  try {
    await sock.sendMessage(`${adminWhatsAppNumber()}@s.whatsapp.net`, {
      text: orderWhatsAppText(order),
    });
    return { url, sent: true, error: '' };
  } catch (error) {
    console.error('WhatsApp send failed', error);
    return { url, sent: false, error: error.message || 'Could not send the WhatsApp message' };
  }
}
