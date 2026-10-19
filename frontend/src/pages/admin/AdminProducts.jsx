import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { money, onImgError } from '../../utils';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    document.title = 'Products · ZAYVORN';
    api
      .get('/admin/products')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products'));
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      toast('Product deleted');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not delete');
    }
  };

  const shown = products.filter((product) => {
    const blob = `${product.name} ${product.brand} ${product.category} ${product.subcategory}`.toLowerCase();
    return blob.includes(q.trim().toLowerCase());
  });

  return (
    <div>
      <div className="admin-top">
        <div>
          <p className="kicker">{products.length} products</p>
          <h1>Catalogue</h1>
        </div>
        <Link className="btn" to="/admin/products/new">
          Add product
        </Link>
      </div>
      <label className="field" style={{ maxWidth: 320, marginBottom: 14 }}>
        <span>Search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, brand, category" />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((product) => (
              <tr key={product._id}>
                <td>
                  <img className="thumb" src={product.images?.[0]} alt="" onError={onImgError} />
                </td>
                <td>
                  <strong>{product.name}</strong>
                  <div className="muted">{product.brand}</div>
                </td>
                <td>
                  {product.category} / {product.subcategory}
                </td>
                <td>
                  {money(product.price)}
                  {product.discount > 0 && (
                    <div className="muted">
                      <s>{money(product.mrp)}</s> · {product.discount}%
                    </div>
                  )}
                </td>
                <td>{product.stock}</td>
                <td>
                  <div className="row-actions">
                    <Link to={`/admin/products/${product._id}/edit`}>Edit</Link>
                    <button type="button" className="linkish" onClick={() => remove(product._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
