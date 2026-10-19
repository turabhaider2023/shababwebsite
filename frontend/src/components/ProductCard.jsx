import { Link } from 'react-router-dom';
import { money, onImgError } from '../utils';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { IconHeart } from './Icons';
import Stars from './Stars';

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const saved = has(product._id);

  const onWish = (event) => {
    event.preventDefault();
    const added = toggle({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '',
      price: product.price,
      mrp: product.mrp,
      discount: product.discount,
      brand: product.brand,
    });
    toast(added ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card-media">
        <img src={product.images?.[0]} alt={product.name} onError={onImgError} />
        {product.discount > 0 && <span className="badge">-{product.discount}%</span>}
        {product.stock === 0 && <span className="sold">Sold out</span>}
      </Link>
      <button type="button" className={saved ? 'wish on' : 'wish'} onClick={onWish} aria-label="Wishlist">
        <IconHeart filled={saved} />
      </button>
      <div className="card-body">
        <p className="brand">{product.brand}</p>
        <h3>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="price-row">
          <strong>{money(product.price)}</strong>
          {product.discount > 0 && <s>{money(product.mrp)}</s>}
          {product.numReviews > 0 ? <Stars value={product.rating} /> : <span className="muted tiny">New</span>}
        </div>
      </div>
    </article>
  );
}
