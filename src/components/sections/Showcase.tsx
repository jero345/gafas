import { useRef } from 'react'
import { useGsap } from '../../lib/use-gsap'
import { DEMO_MESSAGE, whatsappUrl } from '../../lib/whatsapp'
import { Magnetic } from '../ui/Magnetic'
import { PillButton } from '../ui/PillButton'
import { Reveal, WordReveal } from '../ui/Reveal'

// Degradado de la montura inferior: sólida arriba a la derecha, se desvanece hacia abajo-izquierda (mockup)
const FADE_MASK = 'linear-gradient(205deg, #000 30%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.12) 82%, transparent 96%)'

export function Showcase() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, ({ gsap }) => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Entrada: cada montura llega desde su lado con giro, ligada al scroll
      const enter = { trigger: '[data-stage]', start: 'top 95%', end: 'top 55%', scrub: 0.8 }
      gsap.fromTo(
        '[data-frame="sun"]',
        { xPercent: -18, yPercent: 20, rotate: -14, opacity: 0 },
        { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1, ease: 'none', scrollTrigger: enter },
      )
      gsap.fromTo(
        '[data-frame="optical"]',
        { xPercent: 16, yPercent: 30, rotate: 12, opacity: 0 },
        { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1, ease: 'none', scrollTrigger: enter },
      )
      // Salida: siguen rotando suavemente mientras la sección sale
      const exit = { trigger: '[data-stage]', start: 'top 55%', end: 'bottom top', scrub: 0.8 }
      gsap.to('[data-frame="sun"] > div', { rotate: 6, yPercent: -12, ease: 'none', scrollTrigger: exit })
      gsap.to('[data-frame="optical"] > div', { rotate: -5, yPercent: -6, ease: 'none', scrollTrigger: exit })
    })
  })

  return (
    <section id="nosotros" ref={root} aria-labelledby="showcase-title" className="relative overflow-hidden px-4 pt-24 md:px-8 md:pt-32">
      <div className="mx-auto max-w-[1440px] text-center">
        <h2 id="showcase-title" className="text-[clamp(2.7rem,5.8vw,6.25rem)] leading-[1.02] font-light tracking-[-0.045em]">
          <WordReveal
            inView
            parts={[
              { text: 'pide tu', className: 'text-gradient' },
              { text: 'demo', className: 'text-gradient underline-lav' },
            ]}
          />
        </h2>
        <Reveal delay={0.15}>
          <p className="text-ink/80 mx-auto mt-5 max-w-[72ch] text-[15px] leading-snug md:text-[16px]">
            VYSE permite a marcas y ópticas crear experiencias de prueba virtual precisas donde los clientes pueden descubrir, probarse y
            comprar gafas desde cualquier dispositivo.
          </p>
        </Reveal>
      </div>

      {/* Escenario: posiciones medidas sobre el mockup (en % del escenario) */}
      <div data-stage className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-[1180px] sm:aspect-[21/10]">
        <div data-frame="sun" className="absolute top-[2%] left-[2%] w-[70%] will-change-transform sm:left-[10%] sm:w-[46%]">
          <div>
            <img
              src="/frames/sun.webp"
              srcSet="/frames/sun-600.webp 600w, /frames/sun.webp 1200w"
              sizes="(min-width: 1280px) 540px, (min-width: 640px) 46vw, 70vw"
              alt="Gafas de sol negras con lentes verde oscuro"
              width={1200}
              height={686}
              loading="lazy"
              decoding="async"
              className="float w-full"
            />
          </div>
        </div>

        <div
          data-frame="optical"
          className="absolute top-[42%] right-[0%] w-[74%] will-change-transform sm:top-[40%] sm:right-[13%] sm:w-[51%]"
        >
          <div>
            <img
              src="/frames/optical.webp"
              srcSet="/frames/optical-600.webp 600w, /frames/optical.webp 1200w"
              sizes="(min-width: 1280px) 600px, (min-width: 640px) 51vw, 74vw"
              alt="Montura oftálmica negra de acetato"
              width={1200}
              height={687}
              loading="lazy"
              decoding="async"
              className="float w-full [animation-delay:-3s]"
              style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
            />
          </div>
        </div>

        <div className="absolute top-[50%] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Magnetic strength={0.4}>
            <PillButton href={whatsappUrl(DEMO_MESSAGE)} variant="glass" size="sm">
              Pide un Demo
            </PillButton>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
