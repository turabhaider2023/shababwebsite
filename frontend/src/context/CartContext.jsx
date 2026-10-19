import { createContext, useContext, useEffect, useState } from 'react';
import { lineKey } from '../utils';

const CartContext = createContext(null);
const KEY = 'shabab_cart';

function read(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => read(KEY));
  const [miniOpen, setMiniOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (item) => {
    const stock = item.stock || 10;
    const current = items.find((row) => lineKey(row) === lineKey(item));
    if (current && current.qty >= stock) return false;
    setItems((prev) => {
      const index = prev.findIndex((row) => lineKey(row) === lineKey(item));
      if (index === -1) return [...prev, { ...item, qty: Math.min(stock, item.qty) }];
      const next = [...prev];
      const qty = Math.min(stock, next[index].qty + item.qty);
      next[index] = { ...next[index], ...item, qty };
      return next;
    });
    setMiniOpen(true);
    return true;
  };

  const updateQty = (key, qty) => {
    setItems((prev) =>
      prev.map((row) => {
        if (lineKey(row) !== key) return row;
        const nextQty = Math.max(1, Math.min(row.stock || 10, qty));
        return { ...row, qty: nextQty };
      })
    );
  };

  const remove = (key) => setItems((prev) => prev.filter((row) => lineKey(row) !== key));
  const clear = () => {
    setItems([]);
    setMiniOpen(false);
  };
  const closeMini = () => setMiniOpen(false);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, count, miniOpen, closeMini }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
