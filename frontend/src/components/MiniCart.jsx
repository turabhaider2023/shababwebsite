import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { lineKey, money, onImgError } from '../utils';

export default function MiniCart() {
  const { items, count, miniOpen, closeMini, updateQty, remove } = useCart();
  const { pathname } = useLocation();
  const hidden = pathname === '/cart' || pathname === '/checkout';
  if (!miniOpen || hidden || items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <aside className="mini-cart" aria-label="Cart">
      <div className="mini-cart-head">
        <strong>Cart · {count}</strong>
        <button type="button" onClick={closeMini} aria-label="Close cart">
          ×
        </button>
      </div>
      <div className="mini-cart-list">
        {items.map((item) => (
          <article key={lineKey(item)}>
            <img src={item.image} alt="" onError={onImgError} />
            <div>
              <p>{item.name}</p>
              <p className="muted tiny">
                {[item.color, item.size].filter(Boolean).join(' · ')}
              </p>
              <div className="mini-qty">
                <button type="button" onClick={() => updateQty(lineKey(item), item.qty - 1)} aria-label="Decrease">
                  −
                </button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateQty(lineKey(item), item.qty + 1)} aria-label="Increase">
                  +
                </button>
                <button type="button" className="linkish" onClick={() => remove(lineKey(item))}>
                  Remove
                </button>
              </div>
            </div>
            <b>{money(item.price * item.qty)}</b>
          </article>
        ))}
      </div>
      <div className="mini-cart-foot">
        <div>
          <span className="muted">Total</span>
          <strong>{money(total)}</strong>
        </div>
        <Link className="btn" to="/cart" onClick={closeMini}>
          View cart
        </Link>
      </div>
    </aside>
  );
}
