import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { EASE_OUT } from '../../lib/motion'

/** Número que rueda hacia arriba o abajo según aumente o disminuya (cantidades). */
export function RollingNumber({ value, className = '' }: { value: number; className?: string }) {
  const prev = useRef(value)
  const dir = value >= prev.current ? 1 : -1
  useEffect(() => {
    prev.current = value
  }, [value])
  const reduce = useReducedMotion()
  return (
    <span className={`relative inline-grid overflow-hidden tabular-nums ${className}`} aria-live="polite">
      <AnimatePresence initial={false} custom={dir}>
        <motion.span
          key={value}
          custom={dir}
          className="col-start-1 row-start-1 text-center"
          variants={{
            enter: (d: number) => (reduce ? { opacity: 0 } : { transform: `translateY(${d * 100}%)`, opacity: 0 }),
            center: { transform: 'translateY(0%)', opacity: 1 },
            exit: (d: number) => (reduce ? { opacity: 0 } : { transform: `translateY(${d * -100}%)`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: EASE_OUT }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Valor que cuenta hacia el nuevo total con un resorte (subtotales). */
export function CountingNumber({ value, format, className = '' }: { value: number; format: (n: number) => string; className?: string }) {
  const spring = useSpring(value, { stiffness: 140, damping: 24, mass: 0.8 })
  const text = useTransform(spring, (v) => format(v))
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>
}
