import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="center-note">Loading…</div>;
  if (!user) {
    const to = admin ? '/admin/login' : '/login';
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }
  if (admin && user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}
