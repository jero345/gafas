import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { categories, products, type Category, type Product } from '../../data/products'
import { useCart, useCartUI } from '../../lib/cart'
import { flyToCart } from '../../lib/fly-to-cart'
import { formatCOP } from '../../lib/format'
import { EASE_OUT } from '../../lib/motion'
import { startScroll, stopScroll } from '../../lib/smooth-scroll'
import { track } from '../../lib/tracking'
import { FrameArt } from '../ui/FrameArt'
import { PillButton } from '../ui/PillButton'
import { WordReveal } from '../ui/Reveal'

function useAddToCart() {
  const add = useCart((s) => s.add)
  const bump = useCartUI((s) => s.triggerBump)
  const setOpen = useCartUI((s) => s.setOpen)
  const reveal = useCartUI((s) => s.triggerReveal)
  return async (p: Product, colorIdx: number, source: Element | null) => {
    const color = p.colors[colorIdx]
    reveal()
    const done = flyToCart(source)
    add(p.id, color.name)
    track('AddToCart', { content_ids: [p.id], content_name: p.name, value: p.price, currency: 'COP' })
    await done
    bump()
    toast.success(`${p.name} agregada`, {
      description: `Color ${color.name} · ${formatCOP(p.price)}`,
      action: { label: 'Ver carrito', onClick: () => setOpen(true) },
    })
  }
}

function Swatches({
  product,
  value,
  onChange,
  size = 'sm',
}: {
  product: Product
  value: number
  onChange: (i: number) => void
  size?: 'sm' | 'lg'
}) {
  return (
    <div role="radiogroup" aria-label={`Color de ${product.name}`} className="flex items-center gap-1">
      {product.colors.map((c, i) => (
        <button
          key={c.name}
          type="button"
          role="radio"
          aria-checked={i === value}
          aria-label={c.name}
          title={c.name}
          onClick={(e) => {
            e.stopPropagation()
            onChange(i)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault()
              const n = (value + (e.key === 'ArrowRight' ? 1 : -1) + product.colors.length) % product.colors.length
              onChange(n)
              ;(e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus()
            }
          }}
          tabIndex={i === value ? 0 : -1}
          className={`press grid place-items-center rounded-full ${size === 'lg' ? 'size-10' : 'size-8'}`}
        >
          <span
            className={`ring-offset-card block rounded-full ring-offset-2 transition-shadow duration-200 ${size === 'lg' ? 'size-7' : 'size-5'} ${
              i === value ? 'ring-ink ring-1' : 'ring-ink/10 ring-1'
            }`}
            style={{ background: c.frame }}
          />
        </button>
      ))}
    </div>
  )
}

function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product, color: number) => void }) {
  const [colorIdx, setColorIdx] = useState(0)
  const [hover, setHover] = useState(false)
  const artRef = useRef<HTMLDivElement>(null)
  const addToCart = useAddToCart()
  const reduce = useReducedMotion()
  // En hover mostramos el siguiente color con la montura rotada
  const shown = hover && product.colors.length > 1 ? (colorIdx + 1) % product.colors.length : colorIdx
  const c = product.colors[shown]
  const label = categories.find((x) => x.id === product.category)?.label

  return (
    <motion.article
      layout={!reduce}
      initial={{ opacity: 0, transform: 'scale(0.96)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      exit={{ opacity: 0, transform: 'scale(0.96)', transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, ease: EASE_OUT, layout: { duration: 0.35, ease: EASE_OUT } }}
      className="group bg-card flex flex-col rounded-[28px] p-3"
    >
      <button
        type="button"
        onClick={() => onQuickView(product, colorIdx)}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="press bg-bg/60 relative block aspect-[4/3] w-full overflow-hidden rounded-[22px] text-left"
        aria-label={`Vista rápida de ${product.name}`}
      >
        <motion.div
          layoutId={`art-${product.id}`}
          className="absolute inset-0 grid place-items-center p-6"
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <div
            ref={artRef}
            className="w-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: hover && !reduce ? 'rotate(-8deg) scale(1.06)' : 'rotate(0deg)' }}
          >
            <FrameArt
              shape={product.shape}
              frame={c.frame}
              lens={c.lens}
              className="w-full drop-shadow-[0_14px_14px_rgba(17,17,17,0.18)]"
            />
          </div>
        </motion.div>
        <span aria-hidden className="bg-card/90 text-muted absolute top-3 left-3 rounded-full px-2.5 py-1 text-[12px]">
          {label}
        </span>
        <span className="bg-ink text-bg absolute right-3 bottom-3 rounded-full px-3 py-1.5 text-[12px] opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
          Vista rápida
        </span>
      </button>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[19px] leading-tight font-normal tracking-[-0.02em]">{product.name}</h3>
          <p className="text-[16px] tabular-nums">{formatCOP(product.price)}</p>
        </div>
        <p className="text-muted mt-1 text-[13px]">{product.colors[colorIdx].name}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Swatches product={product} value={colorIdx} onChange={setColorIdx} />
          <PillButton
            size="sm"
            variant="filled"
            onClick={() => addToCart(product, colorIdx, artRef.current)}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            Agregar
          </PillButton>
        </div>
      </div>
    </motion.article>
  )
}

function QuickView({ product, initialColor, onClose }: { product: Product; initialColor: number; onClose: () => void }) {
  const [colorIdx, setColorIdx] = useState(initialColor)
  const artRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const addToCart = useAddToCart()
  const c = product.colors[colorIdx]
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    stopScroll()
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      startScroll()
      prevFocus?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 grid place-items-end p-0 sm:place-items-center sm:p-6">
      <motion.div
        className="bg-ink/30 absolute inset-0 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`qv-${product.id}`}
        initial={{ opacity: 0, transform: 'translateY(24px) scale(0.98)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
        exit={{ opacity: 0, transform: 'translateY(16px) scale(0.98)', transition: { duration: 0.18 } }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="bg-card relative grid max-h-[92svh] w-full max-w-4xl overflow-auto rounded-t-[32px] sm:rounded-[32px] md:grid-cols-2"
      >
        <div className="bg-bg/60 relative aspect-[4/3] md:aspect-auto">
          <motion.div
            layoutId={`art-${product.id}`}
            className="absolute inset-0 grid place-items-center p-8"
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <div ref={artRef} className="w-full">
              <FrameArt
                shape={product.shape}
                frame={c.frame}
                lens={c.lens}
                title={`${product.name} en ${c.name}`}
                className="w-full drop-shadow-[0_18px_18px_rgba(17,17,17,0.2)]"
              />
            </div>
          </motion.div>
        </div>
        <div className="flex flex-col p-7 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <h3 id={`qv-${product.id}`} className="text-[34px] leading-none font-light tracking-[-0.04em]">
              {product.name}
            </h3>
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label="Cerrar"
              className="press hover:bg-ink/5 -mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-[22px] font-light tabular-nums">{formatCOP(product.price)}</p>
          <p className="text-muted mt-5 text-[16px] leading-relaxed">{product.description}</p>
          <p className="text-muted mt-8 text-[13px]">
            Color: <span className="text-ink">{c.name}</span>
          </p>
          <div className="mt-2">
            <Swatches product={product} value={colorIdx} onChange={setColorIdx} size="lg" />
          </div>
          <div className="mt-auto pt-10">
            <PillButton
              variant="filled"
              size="lg"
              className="w-full"
              onClick={async () => {
                await addToCart(product, colorIdx, artRef.current)
                onClose()
              }}
            >
              Agregar al carrito
            </PillButton>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function Shop() {
  const [filter, setFilter] = useState<Category | 'todas'>('todas')
  const [quick, setQuick] = useState<{ product: Product; color: number } | null>(null)
  const visible = filter === 'todas' ? products : products.filter((p) => p.category === filter)

  return (
    <section id="tienda" aria-labelledby="shop-title" className="px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">Tienda</p>
            <h2
              id="shop-title"
              className="max-w-[14ch] text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] font-extralight tracking-[var(--tracking-tightest)]"
            >
              <WordReveal
                inView
                text="Monturas que se prueban solas"
                render={(w, i) => (i >= 3 ? <span className="text-gradient underline-lav">{w}</span> : w)}
              />
            </h2>
          </div>
          <div
            role="group"
            aria-label="Filtrar por categoría"
            className="border-ink/10 bg-card flex max-w-full gap-1 overflow-x-auto rounded-full border p-1"
          >
            {categories.map((c) => {
              const active = c.id === filter
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(c.id)}
                  className={`press relative shrink-0 rounded-full px-4 py-2.5 text-[14px] whitespace-nowrap transition-colors duration-200 ${
                    active ? 'text-bg' : 'text-ink/70 hover:text-ink'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="shop-filter"
                      className="bg-ink absolute inset-0 rounded-full"
                      transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <span className="relative">{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <LayoutGroup>
          <motion.div layout className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={(product, color) => setQuick({ product, color })} />
              ))}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {quick && (
              <QuickView key={quick.product.id} product={quick.product} initialColor={quick.color} onClose={() => setQuick(null)} />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
