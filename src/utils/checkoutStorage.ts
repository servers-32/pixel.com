const SHIPPING_KEY = 'es-checkout-shipping-v1'
const PAY_PREF_KEY = 'es-checkout-pay-pref-v1'

export type ShippingDraft = {
  name: string
  email: string
  phone: string
  city: string
  address: string
  zip: string
  deliveryNote: string
}

export function saveShippingDraft(d: ShippingDraft) {
  sessionStorage.setItem(SHIPPING_KEY, JSON.stringify(d))
}

export function loadShippingDraft(): ShippingDraft | null {
  try {
    const raw = sessionStorage.getItem(SHIPPING_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Partial<ShippingDraft>
    if (typeof o.name !== 'string' || typeof o.email !== 'string' || typeof o.phone !== 'string') return null
    if (typeof o.address !== 'string') return null
    return {
      name: o.name,
      email: o.email,
      phone: o.phone,
      city: typeof o.city === 'string' ? o.city : '',
      address: o.address,
      zip: typeof o.zip === 'string' ? o.zip : '',
      deliveryNote: typeof o.deliveryNote === 'string' ? o.deliveryNote : '',
    }
  } catch {
    return null
  }
}

export function clearShippingDraft() {
  sessionStorage.removeItem(SHIPPING_KEY)
}

/** С карточки товара: на шаге оплаты открыть блок рассрочки по умолчанию. */
export function setPreferInstallmentCheckout() {
  sessionStorage.setItem(PAY_PREF_KEY, 'installment')
}

/** Однократно прочитать и сбросить предпочтение. */
export function consumePreferInstallmentCheckout(): boolean {
  const v = sessionStorage.getItem(PAY_PREF_KEY)
  sessionStorage.removeItem(PAY_PREF_KEY)
  return v === 'installment'
}
