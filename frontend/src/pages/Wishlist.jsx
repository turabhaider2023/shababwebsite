import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { money, onImgError } from '../utils';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { items, toggle } = useWishlist();

  useEffect(() => {
    document.title = 'Wishlist — ZAYVORN';
  }, []);

  if (!items.length) {
    return (
      <div className="empty">
        <h2>Nothing saved yet</h2>
        <Link className="btn" to="/shop" style={{ marginTop: 16 }}>
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap stack">
      <h1>Wishlist</h1>
      <div className="products">
        {items.map((item) => (
          <article className="card" key={item.productId}>
            <Link to={`/product/${item.slug}`} className="card-media">
              <img src={item.image} alt={item.name} onError={onImgError} />
            </Link>
            <div className="card-body">
              <p className="brand">{item.brand}</p>
              <h3>
                <Link to={`/product/${item.slug}`}>{item.name}</Link>
              </h3>
              <div className="price-row">
                <strong>{money(item.price)}</strong>
                {item.discount > 0 && <s>{money(item.mrp)}</s>}
              </div>
              <button type="button" className="linkish" onClick={() => toggle(item)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
