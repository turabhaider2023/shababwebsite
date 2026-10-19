import products from './data/products.json';
import categories from './data/categories.json';

export function catalogCategories() {
  return categories;
}

export function queryCatalog({
  category,
  subcategory,
  q,
  sort = 'newest',
  minPrice,
  maxPrice,
  featured,
  page = 1,
  limit = 12,
} = {}) {
  let list = products.slice();
  if (category) list = list.filter((item) => item.category === category);
  if (subcategory) list = list.filter((item) => item.subcategory === subcategory);
  if (featured === true || featured === 'true') list = list.filter((item) => item.featured);

  const min = Number(minPrice);
  const max = Number(maxPrice);
  if (minPrice !== undefined && minPrice !== '' && Number.isFinite(min)) {
    list = list.filter((item) => item.price >= min);
  }
  if (maxPrice !== undefined && maxPrice !== '' && Number.isFinite(max)) {
    list = list.filter((item) => item.price <= max);
  }

  const needle = String(q || '').trim().toLowerCase();
  if (needle) {
    list = list.filter((item) =>
      [item.name, item.brand, item.description, item.category, item.subcategory, item.material]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }

  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    discount: (a, b) => (b.discount || 0) - (a.discount || 0),
  };
  list.sort(sorters[sort] || sorters.newest);

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
  const total = list.length;
  return {
    products: list.slice((pageNum - 1) * perPage, pageNum * perPage),
    total,
    page: pageNum,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function findCatalogProduct(slug) {
  const product = products.find((item) => item.slug === slug);
  if (!product) return null;
  const related = products
    .filter((item) => item.category === product.category && item.subcategory === product.subcategory && item.slug !== slug)
    .slice(0, 4);
  return { product: { ...product, reviews: product.reviews || [] }, related };
}
