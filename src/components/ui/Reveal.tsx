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

/** Fragmento del titular: palabras sueltas, una frase que entra como bloque (p. ej. con gradiente) o un salto de línea. */
export type HeadlinePart = string | { text: string; className: string } | { br: 'always' | 'sm' }

/**
 * Titular que entra palabra por palabra con máscara.
 * Usa `text` para texto plano o `parts` para mezclar frases resaltadas y saltos de línea.
 */
export function WordReveal({
  text,
  parts,
  className = '',
  delay = 0,
  inView = false,
}: {
  text?: string
  parts?: HeadlinePart[]
  className?: string
  delay?: number
  inView?: boolean
}) {
  const reduce = useReducedMotion()
  const trigger = inView ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } } : { animate: 'show' }

  // Aplana a unidades: cada palabra suelta o frase resaltada es una máscara
  type Unit = { node: ReactNode; key: string } | { br: 'always' | 'sm'; key: string }
  const units: Unit[] = []
  ;(parts ?? [text ?? '']).forEach((p, pi) => {
    if (typeof p === 'string')
      p.split(' ')
        .filter(Boolean)
        .forEach((w, wi) => units.push({ node: w, key: `${pi}-${wi}` }))
    else if ('br' in p) units.push({ br: p.br, key: `br-${pi}` })
    else units.push({ node: <span className={p.className}>{p.text}</span>, key: `${pi}` })
  })

  const variants = {
    hidden: reduce ? { opacity: 0 } : { transform: 'translateY(105%)' },
    show: { opacity: 1, transform: 'translateY(0%)', transition: { duration: reduce ? 0.4 : 0.9, ease: EASE_OUT } },
  }

  return (
    <motion.span className={className} initial="hidden" {...trigger} transition={{ staggerChildren: 0.06, delayChildren: delay }}>
      {units.map((u, i) => {
        if ('br' in u) return <br key={u.key} className={u.br === 'sm' ? 'max-sm:hidden' : undefined} />
        const next = units[i + 1]
        return (
          <span key={u.key} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <motion.span className="inline-block" variants={variants}>
              {u.node}
            </motion.span>
            {/* sin espacio solo antes de un salto fijo; el salto 'sm' desaparece en móvil y necesita el espacio */}
            {next && !('br' in next && next.br === 'always') && '\u00A0'}
          </span>
        )
      })}
    </motion.span>
  )
}
