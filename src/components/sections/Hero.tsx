import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '../../lib/motion'
import { DEMO_MESSAGE, whatsappUrl } from '../../lib/whatsapp'
import { PillButton } from '../ui/PillButton'
import { WordReveal } from '../ui/Reveal'
import { PortraitFan } from './PortraitFan'

export function Hero() {
  const reduce = useReducedMotion()
  const fadeUp = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(10px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    transition: { duration: 0.7, delay, ease: EASE_OUT },
  })

  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-32 lg:pt-36">
      <div className="mx-auto max-w-[1440px] px-4 text-center md:px-8">
        <h1 className="mx-auto text-[clamp(2.7rem,5.8vw,6.25rem)] leading-[1.02] font-light tracking-[-0.045em]">
          <WordReveal
            delay={0.1}
            parts={['La nueva forma de', { br: 'sm' }, 'vender', { text: 'gafas online', className: 'text-gradient' }]}
          />
        </h1>

        <motion.div {...fadeUp(0.55)} className="mt-6 flex justify-center md:mt-7">
          <PillButton href={whatsappUrl(DEMO_MESSAGE)} variant="outline" size="sm">
            Pide un Demo
          </PillButton>
        </motion.div>
      </div>

      <PortraitFan />

      <motion.p
        {...fadeUp(1.1)}
        className="text-ink/85 relative z-[150] mx-auto -mt-[calc(var(--card-w)*0.5)] max-w-[44ch] px-4 pb-[calc(var(--card-w)*0.6)] text-center text-[17px] leading-snug [--card-w:42vw] sm:[--card-w:28vw] md:text-[21px] lg:-mt-[calc(var(--card-w)*0.08)] lg:pb-[calc(var(--card-w)*0.3)] lg:[--card-w:min(15.6vw,320px)]"
      >
        VYSE es una plataforma diseñada para marcas de gafas que quieren ofrecer prueba virtual realista
      </motion.p>
    </section>
  )
}
