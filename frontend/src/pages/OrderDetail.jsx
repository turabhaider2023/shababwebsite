import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { PAYMENT_LABEL, STATUS_LABEL, formatDate, money, onImgError } from '../utils';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Order — ZAYVORN';
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Could not find that order'));
  }, [id]);

  if (error) return <div className="empty">{error}</div>;
  if (!order) return <div className="center-note">Loading order…</div>;

  const address = order.shippingAddress || {};

  return (
    <div className="wrap stack">
      <p className="kicker">Order {order.orderNumber}</p>
      <h1>{STATUS_LABEL[order.status]}</h1>
      <p className="muted">
        Placed {formatDate(order.createdAt)} · {PAYMENT_LABEL[order.paymentMethod]}
      </p>
      <p className="note">
        {order.emailSent
          ? 'This order was emailed to the store.'
          : order.whatsappSent
            ? 'This order was sent straight to the store WhatsApp.'
            : 'This order is on the admin desk.'}
      </p>
      {order.items.map((item, index) => (
        <article className="cart-row" key={`${item.product}-${index}`}>
          <img src={item.image} alt="" onError={onImgError} />
          <div>
            <h3>{item.name}</h3>
            <p className="muted">
              {item.color} {item.size ? `· ${item.size}` : ''} · Qty {item.qty}
            </p>
          </div>
          <strong>{money(item.price * item.qty)}</strong>
        </article>
      ))}
      <div className="summary">
        <h2>Customer</h2>
        <p>{address.fullName}</p>
        {address.age ? <p>Age {address.age}</p> : null}
        <p>{address.phone}</p>
        <p>{address.line1}</p>
        {address.line2 ? <p>{address.line2}</p> : null}
        {address.landmark ? <p>Landmark: {address.landmark}</p> : null}
        <p>
          {[address.city, address.state, address.pincode].filter(Boolean).join(', ')}
        </p>
        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div>
            <span>Coupon {order.coupon}</span>
            <span>{order.couponDiscount ? `−${money(order.couponDiscount)}` : '—'}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : money(order.shipping)}</span>
          </div>
          <div className="grand">
            <strong>Total</strong>
            <strong>{money(order.totalPrice)}</strong>
          </div>
        </div>
      </div>
      <Link to="/shop">Continue shopping</Link>
    </div>
  );
}
