import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { lineKey, money, onImgError } from '../utils';
import { useCart } from '../context/CartContext';
import { IconBag } from '../components/Icons';

export default function CartPage() {
  const { items, updateQty, remove } = useCart();
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Your bag — ZAYVORN';
  }, []);

  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      setError('');
      return;
    }
    api
      .post('/orders/quote', {
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
      .catch((err) => {
        setQuote(null);
        setError(err.response?.data?.message || 'Could not refresh prices');
      });
  }, [items]);

  if (!items.length) {
    return (
      <div className="empty">
        <span className="cart-mark" style={{ margin: '0 auto 12px' }}>
          <IconBag />
        </span>
        <h2>Your bag is empty</h2>
        <p className="muted">The edit is waiting.</p>
        <Link className="btn" to="/shop" style={{ marginTop: 16 }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap cart">
      <div>
        <div className="cart-head">
          <span className="cart-mark" aria-hidden="true">
            <IconBag />
          </span>
          <div>
            <p className="kicker">Cart</p>
            <h1>Your pieces</h1>
          </div>
        </div>
        {items.map((item) => (
          <article className="cart-row" key={lineKey(item)}>
            <img src={item.image} alt="" onError={onImgError} />
            <div>
              <h3>
                <Link to={`/product/${item.slug}`}>{item.name}</Link>
              </h3>
              <p className="muted">
                {item.color} {item.size ? `· ${item.size}` : ''}
              </p>
              <div className="qty">
                <button type="button" onClick={() => updateQty(lineKey(item), item.qty - 1)} aria-label="Decrease">
                  −
                </button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateQty(lineKey(item), item.qty + 1)} aria-label="Increase">
                  +
                </button>
              </div>
              <button type="button" className="linkish" onClick={() => remove(lineKey(item))}>
                Remove
              </button>
            </div>
            <div>
              <strong>{money(item.price * item.qty)}</strong>
              {item.mrp > item.price && <p className="muted"><s>{money(item.mrp * item.qty)}</s></p>}
            </div>
          </article>
        ))}
      </div>
      <aside className="summary">
        <h2>Summary</h2>
        {error && <p className="error">{error}</p>}
        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{money(quote?.subtotal ?? items.reduce((sum, item) => sum + item.price * item.qty, 0))}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>{quote ? (quote.shipping === 0 ? 'Free' : money(quote.shipping)) : '—'}</span>
          </div>
          <div className="grand">
            <strong>Total</strong>
            <strong>{quote ? money(quote.total) : '—'}</strong>
          </div>
        </div>
        <p className="note">Free shipping above ₹1,999. Coupon ZAYVORN10 applies at checkout.</p>
        <Link className="btn" to="/checkout" style={{ width: '100%', marginTop: 14 }}>
          Checkout
        </Link>
      </aside>
    </div>
  );
}
