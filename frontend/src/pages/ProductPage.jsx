import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { money, onImgError } from '../utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [image, setImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let ignore = false;
    setMissing(false);
    setError('');
    api
      .get(`/products/${slug}`)
      .then((res) => {
        if (ignore) return;
        const next = res.data.product;
        setProduct(next);
        setRelated(res.data.related || []);
        setImage(0);
        setQty(1);
        setSize(next.sizes?.length === 1 ? next.sizes[0] : '');
        setColor(next.colors?.[0]?.name || '');
        document.title = `${next.name} — ZAYVORN`;
      })
      .catch((err) => {
        if (ignore) return;
        if (err.response?.status === 404) setMissing(true);
        else setError('Could not load this product.');
      });
    return () => {
      ignore = true;
    };
  }, [slug]);

  if (missing) {
    return (
      <div className="empty">
        <h2>This piece is gone</h2>
        <Link to="/shop">Back to the shop</Link>
      </div>
    );
  }
  if (!product) return <div className="center-note">{error || 'Loading…'}</div>;

  const saved = has(product._id);

  const addToBag = () => {
    if (product.sizes?.length && !size) return toast('Select a size');
    if (product.colors?.length && !color) return toast('Select a colour');
    if (product.stock < 1) return toast('Sold out');
    const ok = add({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '',
      price: product.price,
      mrp: product.mrp,
      discount: product.discount,
      size,
      color,
      qty,
      stock: product.stock,
    });
    if (!ok) return toast('That is all we have in stock');
    toast('Added to cart');
    navigate(product.category ? `/shop?category=${product.category}` : '/shop');
  };

  const saveWish = () => {
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

  const sendReview = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/products/${product._id}/reviews`, review);
      setProduct({ ...product, rating: data.rating, numReviews: data.numReviews, reviews: data.reviews });
      setReview({ rating: 5, comment: '' });
      toast('Review saved');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not save the review');
    }
  };

  return (
    <div className="wrap">
      <section className="pdp">
        <div className="gallery">
          <img src={product.images?.[image]} alt={product.name} onError={onImgError} />
          {product.images?.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, index) => (
                <button type="button" key={src} className={index === image ? 'on' : ''} onClick={() => setImage(index)}>
                  <img src={src} alt="" onError={onImgError} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="buybox">
          <p className="kicker">
            {product.brand} · {product.subcategory.replaceAll('-', ' ')}
          </p>
          <h1>{product.name}</h1>
          {product.numReviews > 0 ? (
            <p>
              <Stars value={product.rating} /> <span className="muted">{product.numReviews} reviews</span>
            </p>
          ) : (
            <p className="muted">New arrival</p>
          )}
          <div className="buy-price">
            <strong>{money(product.price)}</strong>
            {product.discount > 0 && <s className="mrp">{money(product.mrp)}</s>}
            {product.discount > 0 && <span className="badge" style={{ position: 'static' }}>-{product.discount}%</span>}
          </div>
          {product.discount > 0 && <p className="save">You save {money(product.mrp - product.price)}</p>}
          <p>{product.description}</p>
          {product.stock > 0 && product.stock <= 5 && <p className="low">Only {product.stock} left</p>}
          {product.stock === 0 && <p className="low">Sold out</p>}

          {product.colors?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="label">Colour · {color}</p>
              <div className="choice">
                {product.colors.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    className={color === item.name ? 'color on' : 'color'}
                    onClick={() => setColor(item.name)}
                    aria-label={item.name}
                  >
                    <span className="swatch" style={{ background: item.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="label">Size</p>
              <div className="choice">
                {product.sizes.map((item) => (
                  <button type="button" key={item} className={size === item ? 'on' : ''} onClick={() => setSize(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="label" style={{ marginTop: 16 }}>Quantity</p>
          <div className="qty">
            <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease">
              −
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((value) => Math.min(product.stock || 1, value + 1))} aria-label="Increase">
              +
            </button>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" disabled={product.stock < 1} onClick={addToBag}>
              Add to cart
            </button>
            <button type="button" className="btn btn-line" onClick={saveWish}>
              {saved ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
          <div className="facts">
            {product.material && <span>Material · {product.material}</span>}
            <span>SKU · {product.sku}</span>
            <span>Inclusive of taxes · Free shipping above ₹1,999</span>
          </div>
        </div>
      </section>

      <section className="reviews">
        <h2>Reviews</h2>
        {product.reviews?.length === 0 && <p className="note">No reviews yet.</p>}
        {product.reviews?.map((item, index) => (
          <article className="review" key={`${item.name}-${index}`}>
            <strong>{item.name}</strong> <Stars value={item.rating} />
            <p>{item.comment}</p>
          </article>
        ))}
        {user ? (
          <form className="review-form" onSubmit={sendReview}>
            <label className="field">
              <span>Your rating</span>
              <select value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Review</span>
              <textarea
                value={review.comment}
                onChange={(event) => setReview({ ...review, comment: event.target.value })}
                placeholder="Fit, fabric, delivery"
              />
            </label>
            <button className="btn" type="submit">
              Submit review
            </button>
          </form>
        ) : (
          <p className="note">
            <Link to="/login">Log in</Link> to review this piece.
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>You may also like</h2>
          </div>
          <div className="products">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
