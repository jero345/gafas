import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { selectCount, useCart, useCartUI } from '../../lib/cart'
import { EASE_OUT } from '../../lib/motion'
import { scrollToHash } from '../../lib/smooth-scroll'
import { APPOINTMENT_MESSAGE, DEMO_MESSAGE, whatsappUrl } from '../../lib/whatsapp'
import { Logo } from '../ui/Logo'
import { PillButton } from '../ui/PillButton'
import { RollingNumber } from '../ui/AnimatedNumber'

export const NAV_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Soporte', href: '#soporte' },
  { label: 'Precios', href: '#precios' },
  { label: 'Tienda', href: '#tienda' },
  { label: 'Contacto', href: '#contacto' },
]

/** Sección visible para marcar el enlace activo (en el hero, "Nosotros", como en el mockup). */
function useActiveSection() {
  const [active, setActive] = useState('#nosotros')
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href)
    const els = ids.map((id) => document.querySelector(id)).filter((el): el is Element => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const onTop = () => window.scrollY < 200 && setActive('#nosotros')
    window.addEventListener('scroll', onTop, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onTop)
    }
  }, [])
  return active
}

export const onAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  const href = e.currentTarget.getAttribute('href')
  if (!href?.startsWith('#')) return
  e.preventDefault()
  scrollToHash(href)
}

function CartButton() {
  const count = useCart(selectCount)
  const bump = useCartUI((s) => s.bump)
  const setOpen = useCartUI((s) => s.setOpen)
  const reduce = useReducedMotion()
  return (
    <motion.button
      id="cart-icon"
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Abrir carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
      className="press border-ink/15 bg-card/80 relative grid size-10 place-items-center rounded-full border lg:size-9"
      key={bump}
      animate={bump && !reduce ? { scale: [1, 1.18, 0.94, 1] } : undefined}
      transition={{ duration: 0.45, ease: EASE_OUT }}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z" strokeLinejoin="round" />
        <path d="M9 10V7a3 3 0 0 1 6 0v3" strokeLinecap="round" />
      </svg>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="bg-ink text-bg absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-medium"
          >
            <RollingNumber value={count} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function Navbar() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const reduce = useReducedMotion()
  const reveal = useCartUI((s) => s.reveal)
  const activeHref = useActiveSection()

  useEffect(() => {
    if (reveal) setHidden(false)
  }, [reveal])

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 12)
    if (menu) return
    setHidden(y > prev && y > 160)
  })

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu])

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-4"
      animate={{ transform: hidden && !reduce ? 'translateY(-120%)' : 'translateY(0%)' }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      <nav
        aria-label="Principal"
        className={`mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 rounded-full px-4 transition-[background-color,box-shadow,backdrop-filter] duration-300 md:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] ${
          scrolled || menu ? 'bg-bg/70 shadow-[0_1px_0_rgba(17,17,17,0.06),0_8px_30px_-12px_rgba(17,17,17,0.12)] backdrop-blur-xl' : ''
        }`}
      >
        <a href="#top" onClick={onAnchorClick} className="press shrink-0 rounded-md" aria-label="VYSE, ir al inicio">
          <Logo className="h-8 w-auto md:h-9" />
        </a>

        <ul className="hidden items-center gap-3 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={onAnchorClick}
                aria-current={activeHref === l.href ? 'location' : undefined}
                className={`hover:text-ink rounded-full px-3 py-2 text-[14px] transition-colors duration-200 ${
                  activeHref === l.href ? 'text-ink font-semibold' : 'text-ink/75'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 lg:justify-self-end">
          <span className="hidden lg:contents">
            <PillButton href={whatsappUrl(DEMO_MESSAGE)} size="xs" variant="outline">
              Pide un Demo
            </PillButton>
          </span>
          <span className="hidden md:contents">
            <PillButton href={whatsappUrl(APPOINTMENT_MESSAGE)} size="xs" variant="filled">
              Agenda una cita
            </PillButton>
          </span>
          <CartButton />
          <button
            type="button"
            className="press border-ink/15 bg-card/80 grid size-10 place-items-center rounded-full border lg:hidden"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenu((m) => !m)}
          >
            <span className="relative block h-3 w-4" aria-hidden>
              <span
                className={`bg-ink absolute top-0 left-0 h-px w-4 transition-transform duration-200 ${menu ? 'translate-y-1.5 rotate-45' : ''}`}
              />
              <span
                className={`bg-ink absolute bottom-0 left-0 h-px w-4 transition-transform duration-200 ${menu ? '-translate-y-[5px] -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)', transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            style={{ transformOrigin: 'top right' }}
            className="border-ink/10 bg-card/95 mx-auto mt-2 max-w-[1440px] rounded-[28px] border p-3 shadow-xl backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      onAnchorClick(e)
                      setMenu(false)
                    }}
                    className="active:bg-ink/5 block rounded-2xl px-4 py-3 text-2xl font-light tracking-[-0.03em]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid gap-2 p-1 sm:grid-cols-2">
              <PillButton href={whatsappUrl(DEMO_MESSAGE)} variant="outline">
                Pide un Demo
              </PillButton>
              <PillButton href={whatsappUrl(APPOINTMENT_MESSAGE)} variant="filled">
                Agenda una cita
              </PillButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
