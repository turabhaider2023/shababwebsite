import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { PAYMENT_LABEL, STATUS_LABEL, formatDate, money } from '../../utils';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    document.title = 'Orders · ZAYVORN';
    api
      .get('/admin/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders'));
  }, []);

  const update = async (order, status) => {
    if (status === 'cancelled' && !window.confirm('Cancel this order and put the stock back?')) return;
    try {
      const { data } = await api.put(`/admin/orders/${order._id}/status`, { status });
      setOrders((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      toast('Order updated');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not update the order');
    }
  };

  return (
    <div>
      <div className="admin-top">
        <div>
          <p className="kicker">Fulfilment</p>
          <h1>Orders</h1>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Ship to</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6}>No orders yet.</td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <Link to={`/admin/orders/${order._id}`}>
                    <strong>{order.orderNumber}</strong>
                  </Link>
                  <div className="muted">{formatDate(order.createdAt)}</div>
                </td>
                <td>
                  {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                  <div className="muted">
                    {order.shippingAddress?.phone}
                    {order.shippingAddress?.age ? ` · Age ${order.shippingAddress.age}` : ''}
                  </div>
                </td>
                <td>
                  {order.shippingAddress?.line1}
                  <div className="muted">
                    {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </td>
                <td>{PAYMENT_LABEL[order.paymentMethod]}</td>
                <td>{money(order.totalPrice)}</td>
                <td>
                  <select value={order.status} onChange={(event) => update(order, event.target.value)}>
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
