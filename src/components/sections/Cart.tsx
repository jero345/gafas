import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { Drawer } from 'vaul'
import { z } from 'zod'
import { useIsDesktop } from '../../hooks/useMedia'
import { getProduct, selectCount, selectSubtotal, useCart, useCartUI, type CartItem } from '../../lib/cart'
import { checkoutProvider, createOrderId, type Order } from '../../lib/checkout'
import { formatCOP } from '../../lib/format'
import { EASE_OUT } from '../../lib/motion'
import { startScroll, stopScroll } from '../../lib/smooth-scroll'
import { CountingNumber, RollingNumber } from '../ui/AnimatedNumber'
import { FrameArt } from '../ui/FrameArt'
import { PillButton } from '../ui/PillButton'

const schema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre'),
  city: z.string().trim().min(2, 'Escribe tu ciudad'),
  address: z.string().trim().min(6, 'Escribe una dirección válida'),
})
type FormValues = z.infer<typeof schema>
type Errors = Partial<Record<keyof FormValues, string>>

function Line({ item }: { item: CartItem }) {
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const reduce = useReducedMotion()
  const p = getProduct(item.productId)
  if (!p) return null
  const color = p.colors.find((c) => c.name === item.color) ?? p.colors[0]

  return (
    <motion.li
      layout={!reduce}
      initial={{ opacity: 0, transform: 'translateY(8px)' }}
      animate={{ opacity: 1, transform: 'translateX(0px)' }}
      exit={{ opacity: 0, transform: reduce ? 'none' : 'translateX(40px)', transition: { duration: 0.2, ease: EASE_OUT } }}
      transition={{ duration: 0.25, ease: EASE_OUT, layout: { duration: 0.3, ease: EASE_OUT } }}
      className="bg-bg/60 flex gap-4 rounded-[22px] p-3"
    >
      <div className="bg-card grid size-20 shrink-0 place-items-center rounded-2xl p-2">
        <FrameArt shape={p.shape} frame={color.frame} lens={color.lens} className="w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-normal tracking-[-0.01em]">{p.name}</p>
            <p className="text-muted text-[13px]">{color.name}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(item.key)}
            aria-label={`Eliminar ${p.name} ${color.name}`}
            className="press text-muted hover:bg-ink/5 hover:text-ink -mt-1 -mr-1 grid size-9 place-items-center rounded-full"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path
                d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.2a1 1 0 0 0 1 .8h3.8a1 1 0 0 0 1-.8l.6-8.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="border-ink/15 bg-card flex items-center rounded-full border" role="group" aria-label={`Cantidad de ${p.name}`}>
            <button
              type="button"
              onClick={() => setQty(item.key, item.qty - 1)}
              aria-label="Restar uno"
              className="press grid size-9 place-items-center rounded-full"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M3.5 8h9" strokeLinecap="round" />
              </svg>
            </button>
            <RollingNumber value={item.qty} className="w-6 text-[15px]" />
            <button
              type="button"
              onClick={() => setQty(item.key, item.qty + 1)}
              aria-label="Sumar uno"
              className="press grid size-9 place-items-center rounded-full"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M3.5 8h9M8 3.5v9" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <CountingNumber value={p.price * item.qty} format={formatCOP} className="text-[15px]" />
        </div>
      </div>
    </motion.li>
  )
}

function Field({
  id,
  label,
  error,
  ...rest
}: { id: keyof FormValues; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="text-muted mb-1.5 block text-[13px]">
        {label}
      </label>
      <input
        id={`f-${id}`}
        name={id}
        aria-invalid={!!error}
        aria-describedby={error ? `f-${id}-err` : undefined}
        className={`bg-card text-ink placeholder:text-ink/35 focus:border-ink focus:ring-lav-100 h-12 w-full rounded-2xl border px-4 text-[16px] transition-[border-color,box-shadow] duration-200 outline-none focus:ring-4 ${
          error ? 'border-[#b3261e]' : 'border-ink/15'
        }`}
        {...rest}
      />
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`f-${id}-err`}
            initial={{ opacity: 0, transform: 'translateY(-4px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="mt-1.5 text-[13px] text-[#b3261e]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Confirmation({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'scale(0.97)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
      role="status"
    >
      <svg viewBox="0 0 96 96" className="size-24" aria-hidden>
        <motion.circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          stroke="#A78AB5"
          strokeWidth="2"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        />
        <motion.path
          d="M30 49 L43 62 L67 36"
          fill="none"
          stroke="#111"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.45, delay: reduce ? 0 : 0.45, ease: EASE_OUT }}
        />
      </svg>
      <h3 className="mt-8 text-[34px] leading-none font-extralight tracking-[-0.04em]">¡Pedido enviado!</h3>
      <p className="text-muted mt-4 max-w-[30ch] text-[16px] leading-relaxed">
        Abrimos WhatsApp con tu pedido. Envía el mensaje y te confirmamos disponibilidad y envío. Tu referencia:
      </p>
      <p className="bg-bg mt-4 rounded-full px-4 py-2 font-mono text-[15px] tracking-wide">{orderId}</p>
      <div className="mt-10 w-full max-w-xs">
        <PillButton variant="outline" size="lg" className="w-full" onClick={onClose}>
          Seguir comprando
        </PillButton>
      </div>
    </motion.div>
  )
}

function CartBody() {
  const items = useCart((s) => s.items)
  const count = useCart(selectCount)
  const subtotal = useCart(selectSubtotal)
  const clear = useCart((s) => s.clear)
  const setOpen = useCartUI((s) => s.setOpen)
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [confirmed, setConfirmed] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof FormValues] ??= issue.message
      setErrors(next)
      e.currentTarget.querySelector<HTMLInputElement>(`[name="${Object.keys(next)[0]}"]`)?.focus()
      return
    }
    setErrors({})
    const order: Order = {
      id: createOrderId(),
      currency: 'COP',
      total: subtotal,
      customer: parsed.data,
      lines: items.flatMap((i) => {
        const p = getProduct(i.productId)
        return p ? [{ name: p.name, color: i.color, qty: i.qty, unitPrice: p.price }] : []
      }),
    }
    setSending(true)
    try {
      await checkoutProvider.checkout(order)
      clear()
      setConfirmed(order.id)
    } finally {
      setSending(false)
    }
  }

  if (confirmed) return <Confirmation orderId={confirmed} onClose={() => setOpen(false)} />

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <Drawer.Title className="text-[28px] leading-none font-light tracking-[-0.04em]">
          Tu carrito <span className="text-muted">({count})</span>
        </Drawer.Title>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar carrito"
          className="press hover:bg-ink/5 grid size-10 place-items-center rounded-full"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <Drawer.Description className="sr-only">Revisa tus monturas y finaliza el pedido por WhatsApp.</Drawer.Description>

      <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-[20px] font-light tracking-[-0.02em]">Tu carrito está vacío</p>
            <p className="text-muted mt-2 text-[15px]">Pruébate una montura y agrégala aquí.</p>
            <div className="mt-8">
              <PillButton
                variant="filled"
                href="#tienda"
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  setTimeout(() => document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' }), 300)
                }}
              >
                Ir a la tienda
              </PillButton>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {items.map((i) => (
                  <Line key={i.key} item={i} />
                ))}
              </AnimatePresence>
            </ul>

            <div className="border-line mt-6 flex items-baseline justify-between border-t pt-5">
              <span className="text-muted text-[15px]">Subtotal</span>
              <CountingNumber
                value={subtotal}
                format={(n) => `${formatCOP(n)} COP`}
                className="text-[24px] font-light tracking-[-0.03em]"
              />
            </div>
            <p className="text-muted mt-1 text-[13px]">El envío se coordina por WhatsApp.</p>

            <form
              onSubmit={onSubmit}
              onInput={(e) => {
                const name = (e.target as HTMLInputElement).name as keyof FormValues
                if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
              }}
              noValidate
              className="mt-8 space-y-4"
            >
              <Field id="name" label="Nombre" autoComplete="name" placeholder="María Gómez" error={errors.name} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="city" label="Ciudad" autoComplete="address-level2" placeholder="Bogotá" error={errors.city} />
                <Field id="address" label="Dirección" autoComplete="street-address" placeholder="Cra 7 # 72-41" error={errors.address} />
              </div>
              <PillButton type="submit" variant="filled" size="lg" className="mt-2 w-full" disabled={sending}>
                Finalizar pedido por WhatsApp
              </PillButton>
            </form>
          </>
        )}
      </div>
    </>
  )
}

export function Cart() {
  const open = useCartUI((s) => s.open)
  const setOpen = useCartUI((s) => s.setOpen)
  const desktop = useIsDesktop()
  // Remonta el cuerpo al abrir para reiniciar la confirmación
  const [session, setSession] = useState(0)

  useEffect(() => {
    if (open) {
      stopScroll()
      setSession((s) => s + 1)
    } else startScroll()
  }, [open])

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction={desktop ? 'right' : 'bottom'} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="bg-ink/30 fixed inset-0 z-50" />
        <Drawer.Content
          className={
            desktop
              ? 'bg-card fixed top-2 right-2 bottom-2 z-50 flex w-[min(460px,calc(100vw-16px))] flex-col rounded-[32px] outline-none'
              : 'bg-card fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] flex-col rounded-t-[32px] outline-none'
          }
        >
          {!desktop && <div aria-hidden className="bg-ink/15 mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full" />}
          <CartBody key={session} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
