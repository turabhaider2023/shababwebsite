import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { queryCatalog } from '../catalog';
import ProductCard from '../components/ProductCard';

const SORTS = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['discount', 'Discount'],
  ['rating', 'Rating'],
];

export default function Shop() {
  const { categories = [] } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [min, setMin] = useState(params.get('min') || '');
  const [max, setMax] = useState(params.get('max') || '');

  const category = params.get('category') || '';
  const sub = params.get('sub') || '';
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'newest';
  const page = params.get('page') || '1';
  const activeCategory = categories.find((item) => item.slug === category);

  useEffect(() => {
    const title = activeCategory?.name || (q ? `Search: ${q}` : 'Shop');
    document.title = `${title} — ZAYVORN`;
  }, [activeCategory, q]);

  const data = queryCatalog({
    category,
    subcategory: sub,
    q,
    sort,
    page,
    minPrice: params.get('min') || '',
    maxPrice: params.get('max') || '',
    limit: 40,
  });

  const patch = (next) => {
    const updated = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) updated.delete(key);
      else updated.set(key, value);
    });
    if (!('page' in next)) updated.delete('page');
    setParams(updated);
  };

  const title = q ? `Results for “${q}”` : activeCategory?.name || 'All pieces';

  return (
    <div className="wrap shop">
      <aside className="filters">
        <div>
          <p className="label">Category</p>
          <div className="chips">
            <button type="button" className={!category ? 'chip on' : 'chip'} onClick={() => patch({ category: '', sub: '' })}>
              All
            </button>
            {categories.map((item) => (
              <button
                type="button"
                key={item.slug}
                className={category === item.slug ? 'chip on' : 'chip'}
                onClick={() => patch({ category: item.slug, sub: '' })}
              >
                {item.name} ({item.count})
              </button>
            ))}
          </div>
        </div>
        {activeCategory && (
          <div>
            <p className="label">Subcategory</p>
            <div className="chips">
              <button type="button" className={!sub ? 'chip on' : 'chip'} onClick={() => patch({ sub: '' })}>
                All {activeCategory.name}
              </button>
              {activeCategory.subcategories.map((item) => (
                <button
                  type="button"
                  key={item.slug}
                  className={sub === item.slug ? 'chip on' : 'chip'}
                  onClick={() => patch({ sub: item.slug })}
                >
                  {item.name} ({item.count})
                </button>
              ))}
            </div>
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            patch({ min, max });
          }}
        >
          <p className="label">Price</p>
          <div className="price-filter">
            <input className="inline-input" inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
            <input className="inline-input" inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
          <button className="btn btn-line" style={{ marginTop: 8 }} type="submit">
            Apply
          </button>
        </form>
      </aside>

      <section>
        <div className="shop-head">
          <div>
            <p className="kicker">{data.total} pieces</p>
            <h1>{title}</h1>
          </div>
          <label className="field" style={{ minWidth: 180 }}>
            <span>Sort</span>
            <select value={sort} onChange={(event) => patch({ sort: event.target.value })}>
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {data.products.length === 0 && (
          <div className="empty">
            <h2>Nothing in this edit yet</h2>
            <p className="muted">Try another category, or clear the filters.</p>
          </div>
        )}
        <div className="products">
          {data.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {data.pages > 1 && (
          <div className="pager">
            {Array.from({ length: data.pages }, (_, index) => (
              <button
                type="button"
                key={index}
                className={Number(page) === index + 1 ? 'on' : ''}
                onClick={() => patch({ page: String(index + 1) })}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
