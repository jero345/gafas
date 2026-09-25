import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { FAQ } from './components/sections/FAQ'
import { FinalCTA, Footer, WhatsAppFloat } from './components/sections/Footer'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { Navbar } from './components/sections/Navbar'
import { Pricing } from './components/sections/Pricing'
import { Shop } from './components/sections/Shop'
import { Showcase } from './components/sections/Showcase'
import { Testimonials } from './components/sections/Testimonials'
import { useCartUI } from './lib/cart'
import { initSmoothScroll } from './lib/smooth-scroll'

// El carrito (vaul + zod) se descarga en idle o al abrirlo por primera vez.
const loadCart = () => import('./components/sections/Cart')
const Cart = lazy(() => loadCart().then((m) => ({ default: m.Cart })))

function LazyCart() {
  const open = useCartUI((s) => s.open)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const load = () => loadCart().then(() => setReady(true))
    if (open) {
      load()
      return
    }
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000))
    const id = ric(load, { timeout: 4000 } as IdleRequestOptions)
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id)
  }, [open])
  if (!ready) return null
  return (
    <Suspense fallback={null}>
      <Cart />
    </Suspense>
  )
}

export default function App() {
  useEffect(() => {
    return initSmoothScroll()
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="bg-ink text-bg sr-only z-[100] rounded-full px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Showcase />
        <Pricing />
        <HowItWorks />
        <Shop />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
      <LazyCart />
      <Toaster
        position="bottom-center"
        offset={96}
        toastOptions={{
          style: { borderRadius: 20, background: '#111', color: '#ECECEA', border: 'none', fontFamily: 'Inter Tight Variable, sans-serif' },
          actionButtonStyle: { background: '#D9CCE3', color: '#111', borderRadius: 999 },
          classNames: { description: '!text-[#c9c8c4]' },
        }}
      />
    </MotionConfig>
  )
}
