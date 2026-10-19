export function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20.5 21" />
    </svg>
  );
}

export function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path className="cart-basket" d="M7.2 8h12.2l-1.35 7.6a1.4 1.4 0 0 1-1.4 1.15H9.1a1.4 1.4 0 0 1-1.38-1.16L7.2 8Z" />
      <path className="cart-handle" d="M3.2 5h2.1L7.2 8" />
      <circle className="cart-wheel" cx="10" cy="20.15" r="1.25" />
      <circle className="cart-wheel" cx="17" cy="20.15" r="1.25" />
    </svg>
  );
}

export function IconHeart({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 19.4s-6.4-3.9-8.2-7.6C2.6 9.6 3.4 6.8 6 6.1c1.6-.4 3 .2 3.8 1.5.8-1.3 2.2-1.9 3.8-1.5 2.6.7 3.4 3.5 2.2 5.7-1.8 3.7-8 7.6-8 7.6Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

export function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.2 19.2c1.4-2.6 3.8-3.8 6.8-3.8s5.4 1.2 6.8 3.8" />
    </svg>
  );
}

export function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
