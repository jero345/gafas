import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE_OUT } from '../../lib/motion'

/** Fade + subida corta al entrar en viewport. En reduced motion solo fade. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: reduce ? 'none' : `translateY(${y}px)` }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

/** Titular que entra palabra por palabra con máscara. */
export function WordReveal({
  text,
  className = '',
  delay = 0,
  inView = false,
  render,
}: {
  text: string
  className?: string
  delay?: number
  inView?: boolean
  /** Permite envolver palabras específicas (p. ej. gradiente) */
  render?: (word: string, i: number) => ReactNode
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  const trigger = inView ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } } : { animate: 'show' }
  return (
    <motion.span className={className} initial="hidden" {...trigger} transition={{ staggerChildren: 0.06, delayChildren: delay }}>
      {words.map((w, i) => (
        <span key={i} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: reduce ? { opacity: 0 } : { transform: 'translateY(105%)' },
              show: { opacity: 1, transform: 'translateY(0%)', transition: { duration: reduce ? 0.4 : 0.9, ease: EASE_OUT } },
            }}
          >
            {render ? render(w, i) : w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </motion.span>
  )
}
