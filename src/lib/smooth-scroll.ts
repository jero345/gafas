import type Lenis from 'lenis'

let lenis: Lenis | null = null

/** Lenis sincronizado con el ticker de GSAP. Se carga en diferido para no bloquear el primer render. */
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  let cleanup = () => {}
  let cancelled = false
  Promise.all([import('lenis'), import('./gsap')]).then(([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
    if (cancelled) return
    const instance = new LenisCtor({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) })
    lenis = instance
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    // Recalcula posiciones cuando cargan fuentes e imágenes
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
    cleanup = () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  })
  return () => {
    cancelled = true
    cleanup()
  }
}

export function scrollToHash(hash: string) {
  const el = document.querySelector<HTMLElement>(hash)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -16 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()
