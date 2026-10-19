import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Create account — ZAYVORN';
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/account');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the account');
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <img src="/logo-header.png" alt="ZAYVORN" className="brand-logo" />
        <p className="kicker">Account</p>
        <h1>Join ZAYVORN</h1>
        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={set('name')} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label className="field">
          <span>Mobile</span>
          <input value={form.phone} onChange={set('phone')} inputMode="numeric" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={form.password} onChange={set('password')} minLength={6} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy} type="submit">
          {busy ? 'Creating…' : 'Create account'}
        </button>
        <p className="note">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
