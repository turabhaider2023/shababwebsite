import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/admin" className="logo" aria-label="ZAYVORN desk">
          <img src="/logo-header.png" alt="ZAYVORN" className="brand-logo-side" />
        </Link>
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/products/new">Add product</NavLink>
        <NavLink to="/admin/subcategories">Subcategories</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/whatsapp">WhatsApp</NavLink>
        <div className="grow" />
        <NavLink to="/">View shop</NavLink>
        <button type="button" onClick={logout}>
          Log out {user?.userId ? `(${user.userId})` : ''}
        </button>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
