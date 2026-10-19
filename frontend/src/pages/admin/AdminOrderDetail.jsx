import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api';
import { PAYMENT_LABEL, STATUS_LABEL, formatDate, money, onImgError } from '../../utils';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Order · ZAYVORN';
    api
      .get(`/admin/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Could not find that order'));
  }, [id]);

  const update = async (status) => {
    if (status === 'cancelled' && !window.confirm('Cancel this order and put the stock back?')) return;
    try {
      const { data } = await api.put(`/admin/orders/${order._id}/status`, { status });
      setOrder(data);
      toast('Order updated');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not update the order');
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p className="center-note">Loading order…</p>;

  const address = order.shippingAddress || {};

  return (
    <div>
      <div className="admin-top">
        <div>
          <p className="kicker">
            <Link to="/admin/orders">Orders</Link>
          </p>
          <h1>{order.orderNumber}</h1>
          <p className="muted">
            {formatDate(order.createdAt)} · {PAYMENT_LABEL[order.paymentMethod]}
          </p>
        </div>
        <label className="field">
          <span>Status</span>
          <select value={order.status} onChange={(event) => update(event.target.value)}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="checkout">
        <div>
          <h2>Items</h2>
          {order.items.map((item, index) => (
            <article className="cart-row" key={`${item.product}-${index}`}>
              <img src={item.image} alt="" onError={onImgError} />
              <div>
                <h3>{item.name}</h3>
                <p className="muted">
                  {[item.color, item.size].filter(Boolean).join(' · ') || 'One size'}
                  {' · '}Qty {item.qty}
                  {' · '}{money(item.price)} each
                </p>
              </div>
              <strong>{money(item.price * item.qty)}</strong>
            </article>
          ))}
        </div>
        <aside className="summary">
          <h2>Customer</h2>
          <p>{address.fullName}</p>
          {address.age ? <p>Age {address.age}</p> : null}
          <p>{address.phone}</p>
          <p>{address.line1}</p>
          {address.line2 ? <p>{address.line2}</p> : null}
          {address.landmark ? <p>Landmark: {address.landmark}</p> : null}
          <p>{[address.city, address.state, address.pincode].filter(Boolean).join(', ')}</p>
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
        </aside>
      </div>
    </div>
  );
}
