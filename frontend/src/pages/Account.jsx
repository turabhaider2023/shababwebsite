import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user, logout } = useAuth();

  useEffect(() => {
    document.title = 'Account — ZAYVORN';
  }, []);

  return (
    <div className="wrap stack">
      <p className="kicker">Account</p>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      {user?.phone && <p className="muted">{user.phone}</p>}
      <div className="btn-row">
        <Link className="btn" to="/orders">
          Your orders
        </Link>
        <Link className="btn btn-line" to="/wishlist">
          Wishlist
        </Link>
        <button type="button" className="btn btn-line" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
