import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useState, type PointerEvent } from 'react'
import { modalities, plans, type Modality, type Plan } from '../../data/plans'
import { useTilt } from '../../hooks/useTilt'
import { EASE_OUT } from '../../lib/motion'
import { track } from '../../lib/tracking'
import { openWhatsApp, planMessage } from '../../lib/whatsapp'
import { PillButton } from '../ui/PillButton'
import { Reveal } from '../ui/Reveal'

function Segmented({ value, onChange }: { value: Modality; onChange: (m: Modality) => void }) {
  return (
    <div
      role="group"
      aria-label="Modalidad"
      className="border-ink/10 inline-flex max-w-full [scrollbar-width:none] overflow-x-auto rounded-full border bg-[#e2e2df] p-1"
    >
      {modalities.map((m) => {
        const active = m.id === value
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(m.id)}
            className={`press relative shrink-0 rounded-full px-4 py-2 text-[14px] whitespace-nowrap transition-colors duration-200 md:px-5 md:text-[15px] ${
              active ? 'text-ink' : 'text-ink/65 hover:text-ink'
            }`}
          >
            {active && (
              <motion.span
                layoutId="modality-pill"
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(17,17,17,0.08),0_4px_12px_-4px_rgba(17,17,17,0.12)]"
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
  const { enabled, style, handlers } = useTilt(3)
  const reduce = useReducedMotion()
  const gx = useMotionValue(-400)
  const gy = useMotionValue(-400)
  const x = useSpring(gx, { stiffness: 300, damping: 30 })
  const y = useSpring(gy, { stiffness: 300, damping: 30 })
  const modalityLabel = modalities.find((m) => m.id === modality)!.label

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
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE_OUT }}
      className="[perspective:1200px]"
    >
      <motion.article
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={enabled ? style : undefined}
        className="border-ink relative flex h-full min-h-[440px] flex-col rounded-[16px] border p-6 md:p-7"
      >
        {/* Borde que se ilumina siguiendo el cursor (solo transform) */}
        {enabled && (
          <div aria-hidden className="glow-border pointer-events-none absolute -inset-px overflow-hidden rounded-[16px]">
            <motion.div
              className="size-[400px] rounded-full"
              style={{ x, y, background: 'radial-gradient(circle, #A78AB5 0%, rgba(167,138,181,0.5) 30%, transparent 65%)' }}
            />
          </div>
        )}

        <h3 className="text-[clamp(2.8rem,4.2vw,3.75rem)] leading-none font-extralight tracking-[-0.04em]">{plan.name}</h3>
        <p className="text-ink/80 mt-8 max-w-[28ch] text-[14px] leading-snug">{plan.description}</p>

        <p className="mt-7 text-[14px] font-normal">{plan.includesLabel}</p>
        <ul className="text-ink/80 mt-3 space-y-2.5 text-[14px] leading-snug">
          {plan.features.map((f) => (
            <li key={f} className="max-w-[28ch]">
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <PillButton onClick={contract} variant="outline" size="xs" aria-label={`Contratar por WhatsApp el plan ${plan.name}`}>
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
    <section id="precios" aria-label="Planes" className="relative z-10 px-4 pb-24 md:px-8 md:pb-36">
      <div className="mx-auto max-w-[1180px]">
        <Reveal className="-mt-6 flex justify-center sm:-mt-10">
          <Segmented value={modality} onChange={setModality} />
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-5">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} modality={modality} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
