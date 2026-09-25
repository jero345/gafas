import { useRef } from 'react'
import { useGsap } from '../../lib/use-gsap'
import { DEMO_MESSAGE, whatsappUrl } from '../../lib/whatsapp'
import { Magnetic } from '../ui/Magnetic'
import { PillButton } from '../ui/PillButton'
import { Reveal, WordReveal } from '../ui/Reveal'

const STATS = [
  { value: '-48%', label: 'devoluciones' },
  { value: '3,2×', label: 'más conversión' },
  { value: '48 h', label: 'para estar en línea' },
]

export function Showcase() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, ({ gsap }) => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scrub = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      gsap.fromTo(
        '[data-frame="a"]',
        { rotate: -10, yPercent: 25, xPercent: -5 },
        { rotate: 6, yPercent: -25, xPercent: 5, ease: 'none', scrollTrigger: scrub },
      )
      gsap.fromTo(
        '[data-frame="b"]',
        { rotate: 9, yPercent: 40, xPercent: 6 },
        { rotate: -7, yPercent: -15, xPercent: -5, ease: 'none', scrollTrigger: scrub },
      )
    })
  })

  return (
    <section id="nosotros" ref={root} className="relative overflow-hidden px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-[1440px] items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">Nosotros</p>
          <h2 className="text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95] font-extralight tracking-[var(--tracking-tightest)]">
            <WordReveal
              inView
              text="Sin probador, sin fila. Solo pide tu demo"
              render={(w, i) => (i >= 5 ? <span className="text-gradient underline-lav">{w}</span> : w)}
            />
          </h2>
          <Reveal delay={0.15}>
            <p className="text-muted mt-7 max-w-[44ch] text-[17px] leading-relaxed md:text-[19px]">
              VYSE lleva el probador de tu óptica al celular de cada cliente. Realidad aumentada precisa, cargada con tu catálogo real y
              conectada a tu canal de ventas.
            </p>
          </Reveal>
          <Reveal delay={0.25} className="mt-10">
            <Magnetic>
              <PillButton href={whatsappUrl(DEMO_MESSAGE)} variant="filled" size="lg">
                Pide un Demo
              </PillButton>
            </Magnetic>
          </Reveal>
          <Reveal delay={0.3}>
            <dl className="border-line mt-14 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-extralight tracking-[-0.04em]">{s.value}</dd>
                  <dd className="text-muted mt-1 text-[13px]">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="bg-card relative aspect-square w-full rounded-[36px] md:aspect-[5/4]">
          <div
            aria-hidden
            className="absolute inset-[12%] rounded-full opacity-70 blur-3xl"
            style={{ background: 'radial-gradient(circle, #D9CCE3 0%, rgba(217,204,227,0) 70%)' }}
          />
          <div data-frame="a" className="absolute top-[14%] left-[6%] w-[74%] will-change-transform">
            <div className="float">
              <img
                src="/frames/sun.webp"
                srcSet="/frames/sun-600.webp 600w, /frames/sun.webp 1200w"
                sizes="(min-width: 1024px) 36vw, 70vw"
                alt="Gafas de sol negras con lentes verde oscuro"
                width={1200}
                height={686}
                loading="lazy"
                decoding="async"
                className="w-full drop-shadow-[0_30px_30px_rgba(17,17,17,0.22)]"
              />
            </div>
          </div>
          <div data-frame="b" className="absolute right-[5%] bottom-[14%] w-[66%] will-change-transform">
            <div className="float [animation-delay:-3s]">
              <img
                src="/frames/optical.webp"
                srcSet="/frames/optical-600.webp 600w, /frames/optical.webp 1200w"
                sizes="(min-width: 1024px) 32vw, 62vw"
                alt="Montura oftálmica negra de acetato"
                width={1200}
                height={687}
                loading="lazy"
                decoding="async"
                className="w-full drop-shadow-[0_30px_30px_rgba(17,17,17,0.2)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
