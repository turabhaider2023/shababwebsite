import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { money, onImgError } from '../../utils';
import { useToast } from '../../context/ToastContext';

const COLORS = [
  { name: 'Black', hex: '#1C1916' },
  { name: 'White', hex: '#F4F1EA' },
  { name: 'Ivory', hex: '#E7E0D4' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Olive', hex: '#5C6848' },
  { name: 'Rust', hex: '#8C3B2A' },
  { name: 'Brown', hex: '#6B4A32' },
  { name: 'Tan', hex: '#C4A574' },
  { name: 'Sky', hex: '#8FB4C9' },
  { name: 'Blush', hex: '#E7C3C0' },
  { name: 'Gold', hex: '#C6A15B' },
  { name: 'Silver', hex: '#C5C7C4' },
];

const EMPTY = {
  name: '',
  brand: 'ZAYVORN',
  description: '',
  material: '',
  category: 'men',
  subcategory: 't-shirts',
  mrp: '',
  discount: '0',
  price: '',
  stock: '10',
  sizes: 'S, M, L, XL',
  featured: false,
};

function discountFrom(mrp, price) {
  if (!mrp || price === '' || Number.isNaN(Number(price))) return '0';
  const rate = Math.round(((mrp - Math.min(Number(price), mrp)) / mrp) * 100);
  return String(Math.max(0, Math.min(90, rate)));
}

function priceFrom(mrp, discount) {
  const rate = Math.min(90, Math.max(0, Math.round(Number(discount) || 0)));
  if (!mrp) return '';
  return String(Math.max(1, Math.round(mrp * (1 - rate / 100))));
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [colors, setColors] = useState([COLORS[0]]);
  const [existing, setExisting] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [newSub, setNewSub] = useState('');

  useEffect(() => {
    document.title = id ? 'Edit product · ZAYVORN' : 'Add product · ZAYVORN';
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/products/${id}`).then((res) => {
      const product = res.data;
      setForm({
        name: product.name,
        brand: product.brand || 'ZAYVORN',
        description: product.description,
        material: product.material || '',
        category: product.category,
        subcategory: product.subcategory,
        mrp: String(product.mrp),
        discount: String(product.discount),
        price: String(product.price),
        stock: String(product.stock),
        sizes: (product.sizes || []).join(', '),
        featured: Boolean(product.featured),
      });
      setColors(product.colors?.length ? product.colors : [COLORS[0]]);
      setExisting(product.images || []);
    });
  }, [id]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const category = categories.find((item) => item.slug === form.category) || categories[0];
  const mrp = Number(form.mrp) || 0;
  const discount = Math.min(90, Math.max(0, Math.round(Number(form.discount) || 0)));
  const price = Number(form.price) || 0;

  const change = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      const nextMrp = Number(field === 'mrp' ? value : next.mrp) || 0;
      if (field === 'category') {
        const found = categories.find((item) => item.slug === value);
        next.subcategory = found?.subcategories[0]?.slug || '';
      }
      if (field === 'mrp' || field === 'discount') {
        let rate = field === 'discount' ? value : next.discount;
        if (rate !== '' && Number(rate) > 90) rate = '90';
        if (field === 'discount') next.discount = rate;
        if (nextMrp > 0) next.price = priceFrom(nextMrp, rate);
      }
      if (field === 'price' && nextMrp > 0) {
        const typed = Number(value);
        if (Number.isFinite(typed) && typed > nextMrp) next.price = String(nextMrp);
        next.discount = discountFrom(nextMrp, next.price);
      }
      return next;
    });
  };

  const toggleColor = (color) => {
    setColors((prev) => {
      const exists = prev.some((item) => item.name === color.name);
      if (exists) return prev.length === 1 ? prev : prev.filter((item) => item.name !== color.name);
      return [...prev, color];
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        body.set(key, key === 'featured' ? (value ? 'true' : 'false') : value);
      });
      body.set('colors', JSON.stringify(colors));
      body.set('existingImages', JSON.stringify(existing));
      files.forEach((file) => body.append('images', file));
      if (id) await api.put(`/admin/products/${id}`, body);
      else await api.post('/admin/products', body);
      toast('Product saved');
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the product');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="admin-top">
        <div>
          <p className="kicker">{id ? 'Edit' : 'New'}</p>
          <h1>{id ? 'Update product' : 'Add a product'}</h1>
        </div>
        <Link to="/admin/products">All products</Link>
      </div>

      <div className="form-grid">
        <label className="field wide">
          <span>Name</span>
          <input value={form.name} onChange={(e) => change('name', e.target.value)} required />
        </label>
        <label className="field">
          <span>Brand</span>
          <input value={form.brand} onChange={(e) => change('brand', e.target.value)} />
        </label>
        <label className="field">
          <span>Material</span>
          <input value={form.material} onChange={(e) => change('material', e.target.value)} />
        </label>
        <label className="field wide">
          <span>Description</span>
          <textarea value={form.description} onChange={(e) => change('description', e.target.value)} required />
        </label>
        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={(e) => change('category', e.target.value)}>
            {(categories.length ? categories : [{ slug: 'men', name: 'Men' }]).map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Subcategory</span>
          <select value={form.subcategory} onChange={(e) => change('subcategory', e.target.value)}>
            {(category?.subcategories || []).map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <span className="note">Or add one, for example Toys under Kids</span>
          <div className="coupon">
            <input
              value={newSub}
              onChange={(event) => setNewSub(event.target.value)}
              placeholder="New subcategory"
            />
            <button
              className="btn btn-line"
              type="button"
              onClick={async () => {
                const name = newSub.trim();
                if (name.length < 2) return toast('Enter a subcategory name');
                try {
                  const { data } = await api.post('/admin/subcategories', { category: form.category, name });
                  const refreshed = await api.get('/categories');
                  setCategories(refreshed.data);
                  change('subcategory', data.slug);
                  setNewSub('');
                  toast(`${name} added`);
                } catch (err) {
                  toast(err.response?.data?.message || 'Could not add the subcategory');
                }
              }}
            >
              Add
            </button>
          </div>
        </label>
        <label className="field">
          <span>Crossed price (MRP)</span>
          <input inputMode="numeric" value={form.mrp} onChange={(e) => change('mrp', e.target.value)} required />
        </label>
        <label className="field">
          <span>Discount %</span>
          <input inputMode="numeric" value={form.discount} onChange={(e) => change('discount', e.target.value)} />
        </label>
        <label className="field wide">
          <span>Actual price</span>
          <input inputMode="numeric" value={form.price} onChange={(e) => change('price', e.target.value)} required />
        </label>
      </div>

      <div className="price-lab">
        <div>
          <span className="label">Crossed price</span>
          <div>{mrp ? <s>{money(mrp)}</s> : '—'}</div>
        </div>
        <div>
          <span className="label">Customer pays</span>
          <strong>{price ? money(price) : '—'}</strong>
        </div>
        <div>
          <span className="label">Off</span>
          <strong>{discount}%</strong>
          {mrp > price && price > 0 && <div className="note">Saves {money(mrp - price)}</div>}
        </div>
      </div>
      <p className="note">Enter a discount and the actual price updates from the crossed price. You can also type the actual price and the discount fills itself in.</p>

      <div className="form-grid" style={{ marginTop: 16 }}>
        <label className="field">
          <span>Stock</span>
          <input inputMode="numeric" value={form.stock} onChange={(e) => change('stock', e.target.value)} required />
        </label>
        <label className="field">
          <span>Sizes, comma separated</span>
          <input value={form.sizes} onChange={(e) => change('sizes', e.target.value)} placeholder="S, M, L, XL" />
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.featured} onChange={(e) => change('featured', e.target.checked)} />
          <span style={{ textTransform: 'none', letterSpacing: 0 }}>Show on the homepage</span>
        </label>
      </div>

      <p className="label" style={{ marginTop: 16 }}>Colours</p>
      <div className="color-picks">
        {COLORS.map((color) => {
          const on = colors.some((item) => item.name === color.name);
          return (
            <button type="button" key={color.name} className={on ? 'pick on' : 'pick'} onClick={() => toggleColor(color)}>
              <span className="dot" style={{ background: color.hex }} />
              {color.name}
            </button>
          );
        })}
      </div>

      <p className="label" style={{ marginTop: 16 }}>Images</p>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))}
      />
      <div className="previews" style={{ marginTop: 10 }}>
        {existing.map((src) => (
          <figure key={src}>
            <img src={src} alt="" onError={onImgError} />
            <button type="button" onClick={() => setExisting((prev) => prev.filter((item) => item !== src))} aria-label="Remove image">
              ×
            </button>
          </figure>
        ))}
        {previews.map((src) => (
          <figure key={src}>
            <img src={src} alt="" />
          </figure>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-accent" disabled={busy} type="submit">
          {busy ? 'Saving…' : 'Save product'}
        </button>
      </div>
    </form>
  );
}
