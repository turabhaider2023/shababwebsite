export function calcPrice(mrpInput, discountInput) {
  const mrp = Math.round(Number(mrpInput));
  const discount = Math.min(90, Math.max(0, Math.round(Number(discountInput) || 0)));
  if (!Number.isFinite(mrp) || mrp < 1) {
    return { mrp: 0, discount, price: 0 };
  }
  const price = Math.max(1, Math.round(mrp * (1 - discount / 100)));
  return { mrp, discount, price };
}

export const FREE_SHIPPING_AT = 1999;
export const SHIPPING_FEE = 99;
export const COUPON_CODE = 'ZAYVORN10';
export const COUPON_RATE = 0.1;
