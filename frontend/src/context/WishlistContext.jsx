import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);
const KEY = 'shabab_wishlist';

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const has = (productId) => items.some((item) => item.productId === productId);

  const toggle = (item) => {
    let saved = false;
    setItems((prev) => {
      const exists = prev.some((row) => row.productId === item.productId);
      if (exists) return prev.filter((row) => row.productId !== item.productId);
      saved = true;
      return [item, ...prev];
    });
    return saved;
  };

  return (
    <WishlistContext.Provider value={{ items, has, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
