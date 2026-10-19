import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const HERO = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80';
const PROMO = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1400&q=80';

export default function Home() {
  const { categories = [] } = useOutletContext();
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'ZAYVORN — Contemporary fashion';
    Promise.all([
      api.get('/products', { params: { featured: 'true', limit: 8 } }),
      api.get('/products', { params: { sort: 'discount', limit: 8 } }),
    ])
      .then(([featuredRes, dealRes]) => {
        setFeatured(featuredRes.data.products);
        setDeals(dealRes.data.products.filter((product) => product.discount > 0).slice(0, 4));
      })
      .catch(() => setError('The shop is not reachable. Start the backend, then refresh this page.'));
  }, []);

  return (
    <div>
      <section className="wrap hero">
        <div className="hero-copy">
          <p className="kicker">New season · 2026</p>
          <h1>Clothes for the life you actually live.</h1>
          <p className="lede">Men, women and kids. Shirts, shoes, watches and the smaller things you reach for every day.</p>
          <div className="btn-row">
            <Link className="btn" to="/shop">Shop the edit</Link>
            <Link className="btn btn-line" to="/shop?category=men">Men</Link>
            <Link className="btn btn-line" to="/shop?category=women">Women</Link>
            <Link className="btn btn-line" to="/shop?category=kids">Kids</Link>
          </div>
        </div>
        <div className="hero-media">
          <img src={HERO} alt="Rail of new-season clothing" />
          <div className="hero-card">
            <span className="kicker">Delivery</span>
            <strong>₹1,999</strong>
            <span>Free shipping above this</span>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Shop by edit</h2>
        </div>
        <div className="tiles">
          {categories.map((category) => (
            <Link className="tile" to={`/shop?category=${category.slug}`} key={category.slug}>
              <img src={category.image} alt="" />
              <div>
                <strong>{category.name}</strong>
                <span>{category.tagline}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <div>
            <p className="kicker">Just in</p>
            <h2>Featured</h2>
          </div>
          <Link to="/shop">View all</Link>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="products">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="promo">
        <img src={PROMO} alt="Inside the ZAYVORN shop" />
        <div>
          <p className="kicker">This week</p>
          <h2>A real discount, written in rupees.</h2>
          <p>Crossed prices stay visible. Use ZAYVORN10 at checkout for another 10% off the bag.</p>
          <Link className="btn" to="/shop?sort=discount">Shop the markdowns</Link>
        </div>
      </section>

      {deals.length > 0 && (
        <section className="wrap section">
          <div className="section-head">
            <h2>Worth a look</h2>
            <Link to="/shop?sort=discount">All offers</Link>
          </div>
          <div className="products">
            {deals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="wrap trust">
        <article>
          <h3>Clear prices</h3>
          <p className="muted">MRP, discount and the amount you pay are shown before you add anything.</p>
        </article>
        <article>
          <h3>Free shipping</h3>
          <p className="muted">Orders of ₹1,999 and above ship free. Under that, delivery is ₹99.</p>
        </article>
        <article>
          <h3>3-day returns</h3>
          <p className="muted">Unworn pieces with tags can come back within 3 days of delivery.</p>
        </article>
        <article>
          <h3>Demo checkout</h3>
          <p className="muted">Cash, UPI and card are recorded for the demo. Nothing is charged.</p>
        </article>
      </section>
    </div>
  );
}
