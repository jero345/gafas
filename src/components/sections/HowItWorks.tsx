import { useRef } from 'react'
import { how, steps } from '../../data/content'
import { useGsap } from '../../lib/use-gsap'
import { PillButton } from '../ui/PillButton'
import { Reveal } from '../ui/Reveal'
import { onAnchorClick } from './Navbar'

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, ({ gsap }) => {
    const mm = gsap.matchMedia()
    // Desktop: sección fija mientras la línea de progreso recorre los 4 pasos
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-step]')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '[data-pin]', start: 'top top', end: '+=200%', pin: true, scrub: 0.6 },
        defaults: { ease: 'power2.inOut' },
      })
      tl.fromTo('[data-progress]', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 4 }, 0)
      items.forEach((el, i) => {
        const at = i === 0 ? 0 : i * 1.05 - 0.25
        if (i > 0) tl.fromTo(el, { opacity: 0.25, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, at)
        tl.fromTo(el.querySelector('[data-num]'), { opacity: 0.35 }, { opacity: 1, duration: 0.3 }, at)
      })
      gsap.set(items[0], { opacity: 1 })
    })
    // Tablet y móvil: una barra de progreso por paso, sin fijar la sección
    mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
        gsap.fromTo(
          el.querySelector('[data-mini]'),
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 40%', scrub: 0.5 } },
        )
      })
    })
  })

  return (
    <section id="como-funciona" ref={root} aria-labelledby="how-title" className="relative">
      <div data-pin className="flex min-h-[100svh] flex-col justify-center px-4 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">{how.eyebrow}</p>
              <h2
                id="how-title"
                className="max-w-[14ch] text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.02] font-extralight tracking-[var(--tracking-tightest)]"
              >
                {how.title}
              </h2>
            </div>
            <p className="text-muted max-w-[40ch] text-[17px] leading-relaxed lg:mb-3 lg:text-right">{how.intro}</p>
          </Reveal>

          <div className="relative mt-14 lg:mt-20">
            <div className="bg-line absolute inset-x-0 top-0 hidden h-px lg:block" aria-hidden>
              <div data-progress className="bg-ink h-px origin-left" />
            </div>
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:pt-10">
              {steps.map((s) => (
                <li key={s.n} data-step className="bg-card rounded-[28px] p-7 lg:bg-transparent lg:p-0">
                  <div className="bg-line mb-8 h-px lg:hidden" aria-hidden>
                    <div data-mini className="bg-ink h-px origin-left" />
                  </div>
                  <span data-num className="text-muted block text-[15px]">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-[clamp(1.7rem,2.4vw,2.3rem)] leading-[1.05] font-light tracking-[-0.03em]">{s.title}</h3>
                  <p className="text-muted mt-4 max-w-[34ch] text-[16px] leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <Reveal className="border-line mt-14 flex flex-col items-start gap-5 border-t pt-8 md:flex-row md:items-center md:justify-between lg:mt-16">
            <p className="text-[clamp(1.3rem,2vw,1.7rem)] leading-snug font-light tracking-[-0.02em]">{how.cta}</p>
            <div className="flex flex-wrap gap-2">
              <PillButton href="#tienda" onClick={onAnchorClick} variant="filled" size="sm">
                Ver catálogo
              </PillButton>
              <PillButton href="#precios" onClick={onAnchorClick} variant="outline" size="sm">
                Ver planes
              </PillButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
