import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { adminLogin, user, loading } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Admin · ZAYVORN';
  }, []);

  if (!loading && user?.role === 'admin') return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminLogin(userId, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open the admin desk');
      setBusy(false);
    }
  };

  return (
    <div className="admin-auth">
      <form className="auth-card" onSubmit={submit}>
        <img src="/logo-header.png" alt="ZAYVORN" className="brand-logo-full" />
        <h1>Admin</h1>
        <p className="hint">User ID admin · Password Admin@123</p>
        <label className="field">
          <span>User ID</span>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} autoComplete="username" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-accent" disabled={busy} type="submit">
          {busy ? 'Opening…' : 'Open desk'}
        </button>
        <a className="note" href="/">
          Back to the shop
        </a>
      </form>
    </div>
  );
}
