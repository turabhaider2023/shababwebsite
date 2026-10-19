import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { STATUS_LABEL, formatDate, money } from '../../utils';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Dashboard · ZAYVORN';
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load the dashboard'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading desk…</p>;

  return (
    <div>
      <div className="admin-top">
        <div>
          <p className="kicker">Desk</p>
          <h1>Today</h1>
        </div>
        <Link className="btn" to="/admin/products/new">
          Add product
        </Link>
      </div>
      <div className="stats">
        <article className="stat">
          <span className="muted">Revenue</span>
          <b>{money(stats.revenue)}</b>
        </article>
        <article className="stat">
          <span className="muted">Orders</span>
          <b>{stats.orders}</b>
        </article>
        <article className="stat">
          <span className="muted">Products</span>
          <b>{stats.products}</b>
        </article>
        <article className="stat">
          <span className="muted">Low stock</span>
          <b>{stats.lowStock}</b>
        </article>
      </div>
      <div className="stats">
        {stats.byCategory.map((category) => (
          <article className="stat" key={category.slug}>
            <span className="muted">{category.name}</span>
            <b>{category.count}</b>
          </article>
        ))}
      </div>
      <h2 style={{ margin: '8px 0 12px' }}>Recent orders</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.length === 0 && (
              <tr>
                <td colSpan={5}>No orders yet.</td>
              </tr>
            )}
            {stats.recentOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderNumber}</td>
                <td>{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</td>
                <td>{STATUS_LABEL[order.status]}</td>
                <td>{money(order.totalPrice)}</td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
