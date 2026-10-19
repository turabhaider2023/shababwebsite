import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { PAYMENT_LABEL, STATES, money } from '../utils';
import { useCart } from '../context/CartContext';

const SAVED_KEY = 'shabab_checkout';

const EMPTY = {
  fullName: '',
  age: '',
  phone: '',
  pincode: '',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: 'Maharashtra',
};

function readSavedAddress() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || 'null');
    if (!saved || typeof saved !== 'object' || !saved.fullName) return null;
    return {
      fullName: String(saved.fullName || ''),
      age: String(saved.age || ''),
      phone: String(saved.phone || ''),
      pincode: String(saved.pincode || ''),
      line1: String(saved.line1 || ''),
      line2: String(saved.line2 || ''),
      landmark: String(saved.landmark || ''),
      city: String(saved.city || ''),
      state: STATES.includes(saved.state) ? saved.state : 'Maharashtra',
    };
  } catch {
    return null;
  }
}

export default function Checkout() {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(() => readSavedAddress() || EMPTY);
  const [remembered] = useState(() => Boolean(readSavedAddress()));
  const [payment, setPayment] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Checkout — ZAYVORN';
  }, []);

  useEffect(() => {
    if (!items.length) return;
    api
      .post('/orders/quote', {
        coupon: applied,
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
      })
      .then((res) => {
        setQuote(res.data);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not price the bag'));
  }, [items, applied]);

  if (!items.length) {
    return (
      <div className="empty">
        <h2>Nothing to check out</h2>
        <Link to="/shop">Return to shop</Link>
      </div>
    );
  }

  const set = (key) => (event) => setAddress((prev) => ({ ...prev, [key]: event.target.value }));

  const place = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        coupon: applied,
        paymentMethod: payment,
        shippingAddress: address,
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
      });
      localStorage.setItem(SAVED_KEY, JSON.stringify(address));
      clear();
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place the order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="wrap checkout" onSubmit={place}>
      <div>
        <p className="kicker">Checkout</p>
        <h1>Your details</h1>
        <p className="note">
          {remembered
            ? 'Filled in from your last order. Change anything that is different.'
            : 'No login needed. Fill this in and place the order.'}
        </p>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <label className="field">
            <span>Name</span>
            <input value={address.fullName} onChange={set('fullName')} required />
          </label>
          <label className="field">
            <span>Age</span>
            <input value={address.age} onChange={set('age')} inputMode="numeric" min={1} max={120} required />
          </label>
          <label className="field">
            <span>Mobile number</span>
            <input value={address.phone} onChange={set('phone')} inputMode="numeric" maxLength={10} required />
          </label>
          <label className="field">
            <span>PIN code</span>
            <input value={address.pincode} onChange={set('pincode')} inputMode="numeric" maxLength={6} required />
          </label>
          <label className="field wide">
            <span>Address line 1</span>
            <input value={address.line1} onChange={set('line1')} placeholder="Flat, house no., building" required />
          </label>
          <label className="field wide">
            <span>Address line 2</span>
            <input value={address.line2} onChange={set('line2')} placeholder="Area, street, sector, village" />
          </label>
          <label className="field wide">
            <span>Landmark</span>
            <input value={address.landmark} onChange={set('landmark')} placeholder="Near a known place" />
          </label>
          <label className="field">
            <span>City</span>
            <input value={address.city} onChange={set('city')} required />
          </label>
          <label className="field">
            <span>State</span>
            <select value={address.state} onChange={set('state')}>
              {STATES.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </label>
        </div>

        <h2 style={{ margin: '28px 0 10px' }}>Payment</h2>
        <div className="pay">
          {Object.entries(PAYMENT_LABEL).map(([value, label]) => (
            <label key={value} className={payment === value ? 'on' : ''}>
              <input type="radio" name="pay" checked={payment === value} onChange={() => setPayment(value)} />
              {label}
            </label>
          ))}
        </div>
        <p className="note">UPI and card are demo options. No real payment is taken.</p>
      </div>

      <aside className="summary">
        <h2>Order</h2>
        {quote?.items?.map((item) => (
          <p key={`${item.product}-${item.size}-${item.color}`} className="total-line">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{money(item.price * item.qty)}</span>
          </p>
        ))}
        <div className="coupon" style={{ marginTop: 12 }}>
          <input className="inline-input" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon" />
          <button
            className="btn btn-line"
            type="button"
            onClick={() => {
              setApplied(coupon.trim());
            }}
          >
            Apply
          </button>
        </div>
        {applied && <p className="note">Applied: {applied}</p>}
        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{money(quote?.subtotal)}</span>
          </div>
          <div>
            <span>Coupon</span>
            <span>{quote?.couponDiscount ? `−${money(quote.couponDiscount)}` : '—'}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>{quote ? (quote.shipping === 0 ? 'Free' : money(quote.shipping)) : '—'}</span>
          </div>
          <div className="grand">
            <strong>To pay</strong>
            <strong>{money(quote?.total)}</strong>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-accent" type="submit" disabled={busy || !quote} style={{ width: '100%' }}>
          {busy ? 'Placing order…' : 'Place order'}
        </button>
      </aside>
    </form>
  );
}
