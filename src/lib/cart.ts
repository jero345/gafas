import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { products, type Product } from '../data/products'

export interface CartItem {
  key: string // productId:color
  productId: string
  color: string
  qty: number
}

interface CartState {
  items: CartItem[]
  add: (productId: string, color: string, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, color, qty = 1) =>
        set((s) => {
          const key = `${productId}:${color}`
          if (s.items.some((i) => i.key === key)) {
            return { items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, 99) } : i)) }
          }
          return { items: [...s.items, { key, productId, color, qty }] }
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items:
            qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 99) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'vyse-cart', version: 1 },
  ),
)

/** Estado de UI del carrito (no persistido). */
interface CartUIState {
  open: boolean
  bump: number
  /** Incrementa para pedirle al navbar que se muestre (p. ej. antes del fly-to-cart) */
  reveal: number
  setOpen: (open: boolean) => void
  triggerBump: () => void
  triggerReveal: () => void
}

export const useCartUI = create<CartUIState>()((set) => ({
  open: false,
  bump: 0,
  reveal: 0,
  setOpen: (open) => set({ open }),
  triggerBump: () => set((s) => ({ bump: s.bump + 1 })),
  triggerReveal: () => set((s) => ({ reveal: s.reveal + 1 })),
}))

const byId = new Map(products.map((p) => [p.id, p]))
export const getProduct = (id: string): Product | undefined => byId.get(id)

export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.qty, 0)
export const selectSubtotal = (s: CartState) => s.items.reduce((sum, i) => sum + (byId.get(i.productId)?.price ?? 0) * i.qty, 0)
