import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useState, type PointerEvent } from 'react'
import { modalities, plans, type Modality, type Plan } from '../../data/plans'
import { useTilt } from '../../hooks/useTilt'
import { formatCOP } from '../../lib/format'
import { EASE_OUT } from '../../lib/motion'
import { track } from '../../lib/tracking'
import { openWhatsApp, planMessage } from '../../lib/whatsapp'
import { PillButton } from '../ui/PillButton'
import { Reveal, WordReveal } from '../ui/Reveal'

function Segmented({ value, onChange }: { value: Modality; onChange: (m: Modality) => void }) {
  return (
    <div
      role="group"
      aria-label="Modalidad"
      className="border-ink/10 bg-card inline-flex max-w-full overflow-x-auto rounded-full border p-1"
    >
      {modalities.map((m) => {
        const active = m.id === value
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(m.id)}
            className={`press relative shrink-0 rounded-full px-4 py-2.5 text-[14px] whitespace-nowrap transition-colors duration-200 md:px-6 md:text-[15px] ${
              active ? 'text-bg' : 'text-ink/70 hover:text-ink'
            }`}
          >
            {active && (
              <motion.span
                layoutId="modality-pill"
                className="bg-ink absolute inset-0 rounded-full"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PlanCard({ plan, modality, index }: { plan: Plan; modality: Modality; index: number }) {
  const { enabled, style, handlers } = useTilt(4)
  const reduce = useReducedMotion()
  const gx = useMotionValue(-400)
  const gy = useMotionValue(-400)
  const x = useSpring(gx, { stiffness: 300, damping: 30 })
  const y = useSpring(gy, { stiffness: 300, damping: 30 })
  const modalityLabel = modalities.find((m) => m.id === modality)!.label
  const dark = plan.featured

  const onMove = (e: PointerEvent<HTMLElement>) => {
    handlers.onPointerMove(e)
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    gx.set(e.clientX - r.left - 200)
    gy.set(e.clientY - r.top - 200)
  }
  const onLeave = () => {
    handlers.onPointerLeave()
    gx.set(-400)
    gy.set(-400)
  }

  const contract = () => {
    track('Lead', { plan: plan.name, modality: modalityLabel })
    openWhatsApp(planMessage(plan.name, modalityLabel))
  }

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(40px)' }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE_OUT }}
      className="[perspective:1200px]"
    >
      <motion.article
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={enabled ? style : undefined}
        className={`relative flex h-full flex-col overflow-hidden rounded-[32px] p-7 md:p-8 ${
          dark ? 'bg-ink text-bg' : 'bg-card text-ink'
        } ${dark ? '' : 'ring-ink/[0.06] ring-1'}`}
      >
        {/* Borde que se ilumina siguiendo el cursor (solo transform) */}
        {enabled && (
          <div aria-hidden className="glow-border pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
            <motion.div
              className="size-[400px] rounded-full"
              style={{ x, y, background: 'radial-gradient(circle, #A78AB5 0%, rgba(167,138,181,0.35) 35%, transparent 65%)' }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-[28px] font-light tracking-[-0.03em]">{plan.name}</h3>
          {plan.featured && <span className="bg-lav-100 text-ink rounded-full px-3 py-1 text-[12px] font-normal">Más elegido</span>}
        </div>
        <p className={`mt-2 text-[15px] ${dark ? 'text-bg/70' : 'text-muted'}`}>{plan.tagline}</p>

        <div className="mt-8 flex min-h-[74px] items-end gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={modality}
              initial={{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
              exit={{ opacity: 0, transform: 'translateY(-12px)', filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="text-[clamp(2.6rem,4.4vw,3.6rem)] leading-none font-extralight tracking-[-0.05em] tabular-nums"
            >
              {formatCOP(plan.price[modality])}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className={`mt-2 text-[14px] ${dark ? 'text-bg/70' : 'text-muted'}`}>COP {plan.priceNote[modality]}</p>

        <ul className={`mt-8 space-y-3 border-t pt-6 text-[15px] ${dark ? 'border-bg/15' : 'border-line'}`}>
          {plan.features.map((f) => (
            <li key={f} className="flex gap-3">
              <svg
                viewBox="0 0 16 16"
                className={`mt-1 size-4 shrink-0 ${dark ? 'text-lav-100' : 'text-lav-700'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-10">
          <PillButton onClick={contract} variant={dark ? 'light' : 'filled'} size="lg" className="w-full">
            Contratar por WhatsApp
          </PillButton>
        </div>
      </motion.article>
    </motion.div>
  )
}

export function Pricing() {
  const [modality, setModality] = useState<Modality>('individual')
  return (
    <section id="precios" aria-labelledby="pricing-title" className="px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">Precios</p>
            <h2
              id="pricing-title"
              className="max-w-[14ch] text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] font-extralight tracking-[var(--tracking-tightest)]"
            >
              <WordReveal inView text="Un plan para cada óptica" />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <Segmented value={modality} onChange={setModality} />
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} modality={modality} index={i} />
          ))}
        </div>
        <p className="text-muted mt-6 text-[14px]">Precios en pesos colombianos, IVA no incluido. Paga el año y recibe 2 meses gratis.</p>
      </div>
    </section>
  )
}
