import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Log in — ZAYVORN';
  }, []);

  if (user) {
    const next = user.role === 'admin' ? '/admin' : location.state?.from || '/account';
    return <Navigate to={next} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const next = await login(email, password);
      navigate(next.role === 'admin' ? '/admin' : location.state?.from || '/account');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <img src="/logo-header.png" alt="ZAYVORN" className="brand-logo" />
        <p className="kicker">Account</p>
        <h1>Log in</h1>
        <p className="hint">
          Demo shopper · demo@zayvorn.com · demo123
        </p>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy} type="submit">
          {busy ? 'Please wait…' : 'Log in'}
        </button>
        <p className="note">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
