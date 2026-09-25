import { testimonials } from '../../data/content'
import { Reveal } from '../ui/Reveal'

function Card({ t, hidden }: { t: (typeof testimonials)[number]; hidden?: boolean }) {
  return (
    <figure
      aria-hidden={hidden}
      className="bg-card flex w-[82vw] max-w-[420px] shrink-0 flex-col justify-between rounded-[28px] p-7 sm:w-[420px]"
    >
      <blockquote className="text-[20px] leading-snug font-light tracking-[-0.02em] md:text-[22px]">“{t.quote}”</blockquote>
      <figcaption className="mt-8 flex items-center gap-3">
        <span aria-hidden className="bg-lav-100 grid size-10 place-items-center rounded-full text-[14px] font-normal">
          {t.name
            .split(' ')
            .map((w) => w[0])
            .join('')}
        </span>
        <span>
          <span className="block text-[15px] font-normal">{t.name}</span>
          <span className="text-muted block text-[13px]">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

export function Testimonials() {
  return (
    <section aria-labelledby="t-title" className="pt-8 pb-24 md:pt-10 md:pb-36">
      <Reveal className="mx-auto max-w-[1440px] px-4 md:px-8">
        <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">Testimonios</p>
        <h2
          id="t-title"
          className="max-w-[16ch] text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.02] font-extralight tracking-[var(--tracking-tightest)]"
        >
          Ópticas que ya venden con VYSE
        </h2>
      </Reveal>
      {/* Marquee: la pista se duplica y se desplaza -50% en bucle. Reduced motion → scroll horizontal manual. */}
      <div className="marquee mt-14 [scrollbar-width:none] overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-safe:overflow-hidden">
        <div className="marquee-track flex w-max gap-4 px-2 will-change-transform">
          {testimonials.map((t) => (
            <Card key={t.name} t={t} />
          ))}
          {testimonials.map((t) => (
            <Card key={`${t.name}-dup`} t={t} hidden />
          ))}
        </div>
      </div>
    </section>
  )
}
