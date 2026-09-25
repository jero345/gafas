import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '../../lib/motion'
import { DEMO_MESSAGE, whatsappUrl } from '../../lib/whatsapp'
import { PillButton } from '../ui/PillButton'
import { WordReveal } from '../ui/Reveal'
import { onAnchorClick } from './Navbar'
import { PortraitFan } from './PortraitFan'

export function Hero() {
  const reduce = useReducedMotion()
  return (
    <section id="top" className="relative overflow-hidden px-4 pt-32 pb-16 md:px-8 md:pt-40 md:pb-24">
      <div className="mx-auto max-w-[1440px] text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border-ink/15 bg-card/70 text-muted mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px]"
        >
          <span className="bg-lav-500 size-1.5 rounded-full" aria-hidden />
          Prueba virtual de gafas para ópticas y marcas
        </motion.p>

        <h1 className="mx-auto max-w-[14ch] text-[clamp(2.9rem,11vw,9.5rem)] leading-[0.92] font-extralight tracking-[var(--tracking-tightest)]">
          <WordReveal
            text="Prueba tus gafas online"
            delay={0.15}
            render={(w, i) => (i >= 2 ? <span className="text-gradient underline-lav">{w}</span> : w)}
          />
        </h1>

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE_OUT }}
          className="text-muted mx-auto mt-6 max-w-[46ch] text-[17px] leading-relaxed md:text-[19px]"
        >
          Tus clientes se ven con cada montura antes de comprar. Menos devoluciones, más ventas y una experiencia que se siente de otro
          nivel.
        </motion.p>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.7, delay: 0.72, ease: EASE_OUT }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <PillButton href={whatsappUrl(DEMO_MESSAGE)} variant="filled" size="lg">
            Pide un Demo
          </PillButton>
          <PillButton href="#tienda" onClick={onAnchorClick} variant="outline" size="lg">
            Ver la tienda
          </PillButton>
        </motion.div>
      </div>

      <PortraitFan />
    </section>
  )
}
