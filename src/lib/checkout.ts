import { STORE } from '../data/products'
import { formatPrice } from './format'
import { track } from './tracking'
import { openWhatsApp } from './whatsapp'

export interface OrderLine {
  name: string
  color: string
  qty: number
  unitPrice: number
}

export interface Customer {
  name: string
  city: string
  address: string
}

export interface Order {
  id: string
  lines: OrderLine[]
  total: number
  currency: string
  customer: Customer
}

export interface CheckoutProvider {
  checkout(order: Order): Promise<void>
}

/** ID con formato VY-YYMMDD-XXXX */
export function createOrderId(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  const suffix = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  return `VY-${yy}${mm}${dd}-${suffix}`
}

export function buildOrderMessage(order: Order) {
  const lines = order.lines.map((l) => `• ${l.qty}x ${l.name} (${l.color}) — ${formatPrice(l.qty * l.unitPrice)}`)
  const { name, city, address } = order.customer
  return [
    'Hola VYSE 👋 Quiero hacer este pedido:',
    `Pedido: ${order.id}`,
    ...lines,
    `Total: ${formatPrice(order.total)} ${STORE.currency}`,
    `Nombre: ${name} | Ciudad: ${city} | Dirección: ${address}`,
  ].join('\n')
}

export class WhatsAppCheckoutProvider implements CheckoutProvider {
  async checkout(order: Order) {
    // window.open va antes de cualquier await para que el navegador no lo bloquee como popup.
    openWhatsApp(buildOrderMessage(order))
    track('InitiateCheckout', {
      order_id: order.id,
      value: order.total,
      currency: order.currency,
      num_items: order.lines.reduce((n, l) => n + l.qty, 0),
    })
  }
}

/**
 * Stub para conectar una pasarela (Wompi, Mercado Pago, ePayco, Stripe…).
 * Tu backend crea la transacción y devuelve la URL de pago a la que redirigimos.
 */
export class PaymentGatewayCheckoutProvider implements CheckoutProvider {
  private readonly endpoint: string

  constructor(endpoint = '/api/checkout') {
    this.endpoint = endpoint
  }

  async checkout(order: Order) {
    track('InitiateCheckout', { order_id: order.id, value: order.total, currency: order.currency })
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
    if (!res.ok) throw new Error('No se pudo iniciar el pago')
    const { redirectUrl } = (await res.json()) as { redirectUrl: string }
    window.location.assign(redirectUrl)
  }
}

/** Proveedor activo. Cámbialo por `new PaymentGatewayCheckoutProvider()` cuando tengas pasarela. */
export const checkoutProvider: CheckoutProvider = new WhatsAppCheckoutProvider()
