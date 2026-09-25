import { STORE } from '../data/products'

const formatter = new Intl.NumberFormat(STORE.locale, {
  style: 'currency',
  currency: STORE.currency,
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: STORE.decimals,
  maximumFractionDigits: STORE.decimals,
})

/** Formatea un precio en la moneda de la tienda: 85 → "$85.00" (USD) o 360000 → "$ 360.000" (COP) */
export const formatPrice = (value: number) => formatter.format(value)
