import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { STORE, categories, products, type Category, type Product, type ProductVariant } from '../../data/products'
import { useCart, useCartUI } from '../../lib/cart'
import { flyToCart } from '../../lib/fly-to-cart'
import { formatPrice } from '../../lib/format'
import { EASE_OUT } from '../../lib/motion'
import { startScroll, stopScroll } from '../../lib/smooth-scroll'
import { track } from '../../lib/tracking'
import { PillButton } from '../ui/PillButton'
import { WordReveal } from '../ui/Reveal'

const PAGE = 8

function useAddToCart() {
  const add = useCart((s) => s.add)
  const bump = useCartUI((s) => s.triggerBump)
  const setOpen = useCartUI((s) => s.setOpen)
  const reveal = useCartUI((s) => s.triggerReveal)
  return async (p: Product, v: ProductVariant, source: Element | null) => {
    reveal()
    const done = flyToCart(source)
    add(p.id, v.id)
    track('AddToCart', { content_ids: [v.id], content_name: p.name, value: v.price, currency: STORE.currency })
    await done
    bump()
    toast.success(`${p.name} agregada`, {
      description: `${v.color} · ${formatPrice(v.price)}`,
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
  if (product.variants.length < 2) return null
  return (
    <div role="radiogroup" aria-label={`Color de ${product.name}`} className="flex flex-wrap items-center gap-0.5">
      {product.variants.map((v, i) => (
        <button
          key={v.id}
          type="button"
          role="radio"
          aria-checked={i === value}
          aria-label={v.color}
          title={v.color}
          onClick={(e) => {
            e.stopPropagation()
            onChange(i)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault()
              const n = (value + (e.key === 'ArrowRight' ? 1 : -1) + product.variants.length) % product.variants.length
              onChange(n)
              ;(e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus()
            }
          }}
          tabIndex={i === value ? 0 : -1}
          className={`press grid place-items-center rounded-full ${size === 'lg' ? 'size-10' : 'size-7'}`}
        >
          <span
            className={`ring-offset-card block rounded-full ring-offset-2 transition-shadow duration-200 ${size === 'lg' ? 'size-7' : 'size-[18px]'} ${
              i === value ? 'ring-ink ring-1' : 'ring-ink/10 ring-1'
            }`}
            style={{ background: v.swatch }}
          />
        </button>
      ))}
    </div>
  )
}

/** Foto de la montura; en hover (mouse) cruza a la siguiente variante de color. `decorative` si ya la nombra su contenedor. */
function FrameImage({
  product,
  index,
  hover,
  sizes,
  eager,
  decorative,
}: {
  product: Product
  index: number
  hover: boolean
  sizes: string
  eager?: boolean
  decorative?: boolean
}) {
  const next = product.variants.length > 1 ? (index + 1) % product.variants.length : -1
  const layer = (v: ProductVariant, visible: boolean, alt: string) => (
    <img
      key={v.id}
      src={`${v.image}.webp`}
      srcSet={`${v.image}-400.webp 400w, ${v.image}.webp 800w`}
      sizes={sizes}
      alt={alt}
      width={800}
      height={400}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className="col-start-1 row-start-1 w-full transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    />
  )
  const current = product.variants[index]
  return (
    <div className="grid">
      {layer(current, !(hover && next >= 0), decorative ? '' : `${product.name} en ${current.color}`)}
      {next >= 0 && hover && layer(product.variants[next], true, '')}
    </div>
  )
}

function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product, variant: number) => void }) {
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  const artRef = useRef<HTMLDivElement>(null)
  const addToCart = useAddToCart()
  const reduce = useReducedMotion()
  const v = product.variants[idx]
  const label = categories.find((x) => x.id === product.category)?.label

  return (
    <motion.article
      layout={!reduce}
      initial={{ opacity: 0, transform: 'scale(0.96)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      exit={{ opacity: 0, transform: 'scale(0.96)', transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, ease: EASE_OUT, layout: { duration: 0.35, ease: EASE_OUT } }}
      className="group bg-card flex flex-col rounded-[24px] p-2.5"
    >
      <button
        type="button"
        onClick={() => onQuickView(product, idx)}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="press relative block aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white text-left"
        aria-label={`Vista rápida de ${product.name}`}
      >
        <motion.div
          layoutId={`art-${product.id}`}
          className="absolute inset-0 grid place-items-center px-3"
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <div
            ref={artRef}
            className="w-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: hover && !reduce ? 'rotate(-5deg) scale(1.06)' : 'rotate(0deg)' }}
          >
            <FrameImage
              product={product}
              index={idx}
              hover={hover}
              sizes="(min-width: 1280px) 330px, (min-width: 640px) 45vw, 90vw"
              decorative
            />
          </div>
        </motion.div>
        <span aria-hidden className="bg-bg/90 text-muted absolute top-3 left-3 rounded-full px-2.5 py-1 text-[12px]">
          {label}
        </span>
        <span className="bg-ink text-bg absolute right-3 bottom-3 rounded-full px-3 py-1.5 text-[12px] opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
          Vista rápida
        </span>
      </button>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[18px] leading-tight font-normal tracking-[-0.01em]">{product.name}</h3>
          <p className="text-[16px]">{formatPrice(v.price)}</p>
        </div>
        <p className="text-muted mt-1 text-[13px]">
          {v.color}
          {product.variants.length > 1 && ` · ${product.variants.length} colores`}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <Swatches product={product} value={idx} onChange={setIdx} />
          <a
            href={v.tryOnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-ink/80 hover:text-ink decoration-ink/25 text-[13px] underline underline-offset-4 transition-colors ${
              product.variants.length > 1 ? 'hidden 2xl:inline' : ''
            }`}
          >
            Pruébatela
          </a>
          <PillButton
            size="xs"
            variant="filled"
            onClick={() => addToCart(product, v, artRef.current)}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            Agregar
          </PillButton>
        </div>
      </div>
    </motion.article>
  )
}

function QuickView({ product, initial, onClose }: { product: Product; initial: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initial)
  const artRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const addToCart = useAddToCart()
  const v = product.variants[idx]
  const label = categories.find((x) => x.id === product.category)?.label
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
        className="bg-card relative grid max-h-[92svh] w-full max-w-4xl overflow-auto rounded-t-[32px] sm:rounded-[32px] md:grid-cols-[1.15fr_1fr]"
      >
        <div className="relative aspect-[4/3] bg-white md:aspect-auto md:min-h-[440px]">
          <motion.div
            layoutId={`art-${product.id}`}
            className="absolute inset-0 grid place-items-center p-6"
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <div ref={artRef} className="w-full">
              <FrameImage product={product} index={idx} hover={false} sizes="(min-width: 768px) 480px, 100vw" eager />
            </div>
          </motion.div>
        </div>
        <div className="flex flex-col p-7 md:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-muted text-[13px]">{label}</p>
              <h3 id={`qv-${product.id}`} className="mt-1 text-[32px] leading-none font-light tracking-[-0.03em]">
                {product.name}
              </h3>
            </div>
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
          <p className="mt-4 text-[22px] font-light">{formatPrice(v.price)}</p>
          <p className="text-muted mt-6 text-[13px]">
            Color: <span className="text-ink">{v.color}</span>
          </p>
          <div className="mt-2">
            <Swatches product={product} value={idx} onChange={setIdx} size="lg" />
          </div>
          <div className="mt-auto grid gap-2.5 pt-10">
            <PillButton
              variant="filled"
              size="md"
              className="w-full"
              onClick={async () => {
                await addToCart(product, v, artRef.current)
                onClose()
              }}
            >
              Agregar al carrito
            </PillButton>
            <PillButton variant="outline" size="md" className="w-full" href={v.tryOnUrl}>
              Pruébatela virtualmente
            </PillButton>
            <a
              href={v.url360}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink/80 hover:text-ink decoration-ink/25 mx-auto mt-1 text-[14px] underline underline-offset-4"
            >
              Ver en 360°
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function Shop() {
  const [filter, setFilter] = useState<Category | 'todas'>('todas')
  const [shown, setShown] = useState(PAGE)
  const [quick, setQuick] = useState<{ product: Product; variant: number } | null>(null)
  const filtered = filter === 'todas' ? products : products.filter((p) => p.category === filter)
  const visible = filtered.slice(0, shown)

  return (
    <section id="tienda" aria-labelledby="shop-title" className="px-4 pt-24 pb-12 md:px-8 md:pt-36 md:pb-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col items-start gap-8">
          <div>
            <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">Tienda</p>
            <h2
              id="shop-title"
              className="max-w-[14ch] text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.02] font-extralight tracking-[var(--tracking-tightest)]"
            >
              <WordReveal inView parts={['Monturas que se', { text: 'prueban solas', className: 'text-gradient' }]} />
            </h2>
          </div>
          <div
            role="group"
            aria-label="Filtrar por categoría"
            className="border-ink/10 bg-card flex max-w-full [scrollbar-width:none] gap-1 overflow-x-auto rounded-full border p-1"
          >
            {categories.map((c) => {
              const active = c.id === filter
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFilter(c.id)
                    setShown(PAGE)
                  }}
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
                <ProductCard key={p.id} product={p} onQuickView={(product, variant) => setQuick({ product, variant })} />
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-muted text-[14px]" aria-live="polite">
              {visible.length} de {filtered.length} monturas
            </p>
            {shown < filtered.length && (
              <PillButton variant="outline" size="sm" onClick={() => setShown((n) => n + PAGE)}>
                Ver más monturas
              </PillButton>
            )}
          </div>

          <AnimatePresence>
            {quick && <QuickView key={quick.product.id} product={quick.product} initial={quick.variant} onClose={() => setQuick(null)} />}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
