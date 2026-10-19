export const CATEGORIES = [
  {
    slug: 'men',
    name: 'Men',
    tagline: 'Shirting, denim, shoes and watches',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=80',
    subcategories: [
      { slug: 't-shirts', name: 'T-Shirts' },
      { slug: 'shirts', name: 'Shirts' },
      { slug: 'jeans', name: 'Jeans' },
      { slug: 'trousers', name: 'Trousers' },
      { slug: 'jackets', name: 'Jackets' },
      { slug: 'ethnic-wear', name: 'Ethnic Wear' },
      { slug: 'shoes', name: 'Shoes' },
      { slug: 'watches', name: 'Watches' },
      { slug: 'bags', name: 'Bags' },
      { slug: 'sunglasses', name: 'Sunglasses' },
      { slug: 'belts', name: 'Belts' },
      { slug: 'wallets', name: 'Wallets' },
    ],
  },
  {
    slug: 'women',
    name: 'Women',
    tagline: 'Dresses, kurtas, sarees and jewelry',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1400&q=80',
    subcategories: [
      { slug: 'dresses', name: 'Dresses' },
      { slug: 'tops', name: 'Tops' },
      { slug: 'kurtas', name: 'Kurtas & Sets' },
      { slug: 'sarees', name: 'Sarees' },
      { slug: 'jeans', name: 'Jeans' },
      { slug: 'skirts', name: 'Skirts' },
      { slug: 'shoes', name: 'Shoes' },
      { slug: 'heels', name: 'Heels' },
      { slug: 'watches', name: 'Watches' },
      { slug: 'jewelry', name: 'Jewelry' },
      { slug: 'handbags', name: 'Handbags' },
      { slug: 'sunglasses', name: 'Sunglasses' },
    ],
  },
  {
    slug: 'kids',
    name: 'Kids',
    tagline: 'Everyday clothes, shoes and play',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1400&q=80',
    subcategories: [
      { slug: 'boys-clothing', name: 'Boys Clothing' },
      { slug: 'girls-clothing', name: 'Girls Clothing' },
      { slug: 'infants', name: 'Infants' },
      { slug: 'shoes', name: 'Shoes' },
      { slug: 'toys', name: 'Toys' },
      { slug: 'accessories', name: 'Accessories' },
      { slug: 'watches', name: 'Watches' },
    ],
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    tagline: 'Watches, bags, belts and sunglasses',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1400&q=80',
    subcategories: [
      { slug: 'watches', name: 'Watches' },
      { slug: 'bags', name: 'Bags' },
      { slug: 'wallets', name: 'Wallets' },
      { slug: 'belts', name: 'Belts' },
      { slug: 'sunglasses', name: 'Sunglasses' },
      { slug: 'jewelry', name: 'Jewelry' },
      { slug: 'caps', name: 'Caps' },
    ],
  },
];

export function isValidPair(category, subcategory) {
  const cat = CATEGORIES.find((item) => item.slug === category);
  if (!cat) return false;
  return cat.subcategories.some((item) => item.slug === subcategory);
}
