import { catalog } from './catalog.generated'

/**
 * Moneda de la tienda. El catálogo del cliente trae los precios en dólares ("$85.00"),
 * así que se muestran igual que en optica.johnbecerra.dev. Para vender en pesos:
 * { currency: 'COP', locale: 'es-CO', decimals: 0 } y actualiza los precios.
 */
export const STORE = { currency: 'USD', locale: 'en-US', decimals: 2 } as const

export type Category = 'sol' | 'clasicas' | 'deportivos' | 'lectura' | 'premium' | 'ultraligeros'

export const categories: { id: Category | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'sol', label: 'Lentes de sol' },
  { id: 'clasicas', label: 'Clásicas' },
  { id: 'deportivos', label: 'Deportivos' },
  { id: 'lectura', label: 'Lectura' },
  { id: 'premium', label: 'Premium' },
  { id: 'ultraligeros', label: 'Ultraligeros' },
]

/** Una variante de color de un modelo: cada una tiene su foto, su precio y su prueba virtual. */
export interface ProductVariant {
  id: string
  color: string
  /** Color de la muestra en el selector */
  swatch: string
  price: number
  /** Ruta base de la foto sin extensión: `${image}.webp` (800 px) y `${image}-400.webp` */
  image: string
  /** Prueba virtual de VYSE para esta montura */
  tryOnUrl: string
  /** Vista 360° */
  url360: string
}

export interface Product {
  id: string
  name: string
  category: Category
  /** Destacado en el catálogo del cliente: aparece primero */
  featured: boolean
  variants: ProductVariant[]
}

/** Catálogo real del cliente (ver scripts/import-catalog.cjs); los destacados van primero. */
export const products: Product[] = [...catalog].sort((a, b) => Number(b.featured) - Number(a.featured))
