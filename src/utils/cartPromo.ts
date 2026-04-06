/** Порог бесплатной доставки (грн) */
export const FREE_SHIPPING_THRESHOLD = 25_000

/** Порог скидки на заказ */
export const ORDER_DISCOUNT_THRESHOLD = 45_000

/** Процент скидки при превышении порога */
export const ORDER_DISCOUNT_PERCENT = 0.1

export function computeCartPromo(subtotal: number) {
  const toFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const freeShipUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD
  const discount =
    subtotal >= ORDER_DISCOUNT_THRESHOLD ? Math.round(subtotal * ORDER_DISCOUNT_PERCENT) : 0
  const total = subtotal - discount
  const toDiscount = Math.max(0, ORDER_DISCOUNT_THRESHOLD - subtotal)
  return {
    subtotal,
    discount,
    total,
    toFreeShip,
    freeShipUnlocked,
    toDiscount,
    discountUnlocked: discount > 0,
  }
}
