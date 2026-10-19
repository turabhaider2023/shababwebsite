import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { IconBag, IconHeart, IconMenu, IconSearch } from './Icons';
import MiniCart from './MiniCart';

export default function Layout() {
  const { user } = useAuth();
  const { count } = useCart();
  const { items: wishes } = useWishlist();
  const [categories, setCategories] = useState([]);
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!notice) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setNotice(false);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [notice]);

  const onSearch = (event) => {
    event.preventDefault();
    const q = term.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <div className="store">
      <header className="site-header">
        <div className="topbar">
          <div className="wrap topbar-inner">
            <span>Free shipping above ₹1,999</span>
            <span>Code ZAYVORN10 · 10% off</span>
            <span>Easy 3-day returns</span>
          </div>
        </div>
        <div className="header-main">
          <div className="wrap header-brand">
            <Link to="/" className="logo" aria-label="ZAVORN home">
              <img src="/logo-zavorn.jpg" alt="ZAVORN" className="brand-logo-header" />
            </Link>
          </div>
          <div className="wrap header-row">
            <button type="button" className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setOpen((value) => !value)}>
              <IconMenu />
            </button>
            <nav className={open ? 'nav open' : 'nav'}>
              <div className="nav-item">
                <NavLink to="/" end onClick={() => setOpen(false)}>
                  Home
                </NavLink>
              </div>
              {categories.map((category) => (
                <div className="nav-item" key={category.slug}>
                  <NavLink to={`/shop?category=${category.slug}`} onClick={() => setOpen(false)}>
                    {category.name}
                  </NavLink>
                  <div className="mega">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        to={`/shop?category=${category.slug}&sub=${sub.slug}`}
                        onClick={() => setOpen(false)}
                      >
                        <span>{sub.name}</span>
                        <small>{sub.count}</small>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <form className="search" onSubmit={onSearch}>
              <IconSearch />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search shirts, shoes, watches"
                aria-label="Search products"
              />
            </form>
            <div className="header-icons">
              <Link to="/wishlist" className="icon-btn icon-wish" aria-label="Wishlist">
                <IconHeart />
                {wishes.length > 0 && <span className="count">{wishes.length}</span>}
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="admin-return">
                  Admin
                </Link>
              )}
              <Link to="/cart" className="icon-btn icon-cart" aria-label="Cart">
                <IconBag />
                {count > 0 && <span className="count">{count}</span>}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {notice && (
        <div className="disclaimer" onClick={() => setNotice(false)}>
          <div
            className="disclaimer-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="kicker">Please read</p>
            <h2 id="disclaimer-title">Testing website</h2>
            <p>
              This is a testing website right now. Do not place any order because it is in testing mode right now.
            </p>
            <button type="button" className="btn" onClick={() => setNotice(false)}>
              I understand
            </button>
          </div>
        </div>
      )}

      <main>
        <Outlet context={{ categories }} />
      </main>
      <MiniCart />

      <footer className="footer">
        <div className="wrap">
          <div className="foot-brand">
            <Link to="/" aria-label="ZAVORN home">
              <img src="/logo-zavorn.jpg" alt="ZAVORN" className="foot-logo" />
            </Link>
            <p>Contemporary clothes, shoes and watches for men, women and kids. Prices include tax.</p>
          </div>
          <div className="foot-grid">
            <div>
              <h4>Shop</h4>
              <Link to="/shop?category=men">Men</Link>
              <Link to="/shop?category=women">Women</Link>
              <Link to="/shop?category=kids">Kids</Link>
              <Link to="/shop?category=accessories">Accessories</Link>
            </div>
            <div>
              <h4>Help</h4>
              <Link to="/about">About</Link>
              <Link to="/shipping">Shipping</Link>
              <Link to="/returns">Returns</Link>
              <Link to="/orders">Your orders</Link>
            </div>
            <div>
              <h4>Visit</h4>
              <p>hello@zayvorn.store</p>
              <p>Colaba, Mumbai</p>
              <p className="muted">Demo store · no real payment is taken</p>
            </div>
          </div>
        </div>
        <div className="wrap foot-base">© {new Date().getFullYear()} ZAYVORN. All rights reserved.</div>
      </footer>
    </div>
  );
}
