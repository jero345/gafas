import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '../../lib/motion'
import { LOGO } from './logo-paths'

const { text, symbol, symbolOffset } = LOGO
// Caja total: el símbolo sobresale por arriba y a la derecha del texto
const VIEW = {
  x: 0,
  y: symbolOffset.y,
  w: symbolOffset.x + symbol.width,
  h: text.height - symbolOffset.y,
}

/**
 * Logosímbolo VYSE vectorizado desde el PNG del cliente; hereda el color del texto (currentColor).
 * El símbolo gira al entrar la página y al pasar el cursor por el logo.
 */
export function Logo({ className = '', animated = true }: { className?: string; animated?: boolean }) {
  const reduce = useReducedMotion()
  const spin = animated && !reduce
  return (
    <motion.svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className={className}
      role="img"
      aria-label="VYSE"
      fill="currentColor"
      initial="rest"
      animate="rest"
      whileHover={spin ? 'hover' : undefined}
    >
      <path d={text.d} />
      <g transform={`translate(${symbolOffset.x} ${symbolOffset.y})`}>
        <motion.path
          d={symbol.d}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={spin ? { rotate: -180, opacity: 0 } : false}
          variants={{
            rest: { rotate: 0, opacity: 1, transition: { duration: 1.2, ease: EASE_OUT } },
            hover: { rotate: 90, transition: { duration: 0.6, ease: EASE_OUT } },
          }}
        />
      </g>
    </motion.svg>
  )
}
