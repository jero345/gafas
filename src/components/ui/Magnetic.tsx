import { motion, useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'
import { useCursorFx } from '../../hooks/useMedia'

/** Envuelve un elemento y lo atrae suavemente hacia el cursor. Inactivo en touch / reduced motion. */
export function Magnetic({ children, strength = 0.35, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const enabled = useCursorFx()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 16, mass: 0.5 })
  const y = useSpring(my, { stiffness: 220, damping: 16, mass: 0.5 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * strength)
    my.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={enabled ? { x, y } : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {/* padding amplía el área de atracción sin mover el layout */}
      <div className={enabled ? '-m-6 p-6' : ''}>{children}</div>
    </motion.div>
  )
}
