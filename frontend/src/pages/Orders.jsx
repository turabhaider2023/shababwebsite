import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { STATUS_LABEL, formatDate, money } from '../utils';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Orders — ZAYVORN';
    api
      .get('/orders/mine')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders'));
  }, []);

  return (
    <div className="wrap stack">
      <h1>Your orders</h1>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && !error && <p className="note">No orders yet.</p>}
      {orders.map((order) => (
        <Link className="order-card" to={`/orders/${order._id}`} key={order._id}>
          <strong>{order.orderNumber}</strong>
          <span>{formatDate(order.createdAt)}</span>
          <span className="status">{STATUS_LABEL[order.status] || order.status}</span>
          <span>{money(order.totalPrice)}</span>
        </Link>
      ))}
    </div>
  );
}
