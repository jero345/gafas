import { useRef } from 'react'
import { steps } from '../../data/content'
import { useGsap } from '../../lib/use-gsap'
import { Reveal } from '../ui/Reveal'

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, ({ gsap }) => {
    const mm = gsap.matchMedia()
    // Pinned + progreso en tablet/desktop con motion permitido
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-step]')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '[data-pin]', start: 'top top', end: '+=180%', pin: true, scrub: 0.6 },
        defaults: { ease: 'power2.inOut' },
      })
      tl.fromTo('[data-progress]', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 3 }, 0)
      items.forEach((el, i) => {
        if (i === 0) return
        tl.fromTo(el, { opacity: 0.25, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, i * 1.1 - 0.3)
      })
      gsap.set(items[0], { opacity: 1 })
      items.forEach((el, i) => {
        const num = el.querySelector('[data-num]')
        tl.fromTo(num, { opacity: 0.35 }, { opacity: 1, duration: 0.3 }, i === 0 ? 0 : i * 1.1 - 0.3)
      })
    })
    // Móvil: progreso por cada tarjeta, sin pin
    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
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
    <section ref={root} aria-labelledby="how-title" className="relative">
      <div data-pin className="flex min-h-[100svh] flex-col justify-center px-4 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">Cómo funciona</p>
            <h2
              id="how-title"
              className="max-w-[16ch] text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] font-extralight tracking-[var(--tracking-tightest)]"
            >
              Tres pasos. Cero fricción.
            </h2>
          </Reveal>

          <div className="relative mt-14 md:mt-20">
            <div className="bg-line absolute inset-x-0 top-0 hidden h-px md:block" aria-hidden>
              <div data-progress className="bg-ink h-px origin-left" />
            </div>
            <ol className="grid gap-6 md:grid-cols-3 md:gap-10 md:pt-10">
              {steps.map((s) => (
                <li key={s.n} data-step className="bg-card rounded-[28px] p-7 md:bg-transparent md:p-0">
                  <div className="bg-line mb-8 h-px md:hidden" aria-hidden>
                    <div data-mini className="bg-ink h-px origin-left" />
                  </div>
                  <span data-num className="text-muted block text-[15px] tabular-nums">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-light tracking-[-0.04em]">{s.title}</h3>
                  <p className="text-muted mt-4 max-w-[36ch] text-[16px] leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
