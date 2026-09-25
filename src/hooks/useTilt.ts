import { useMotionValue, useSpring, type MotionValue } from 'motion/react'
import type { PointerEvent } from 'react'
import { useCursorFx } from './useMedia'

const SPRING = { stiffness: 150, damping: 18, mass: 0.6 }

/** Tilt 3D con resorte. Devuelve rotateX/rotateY y handlers; inactivo en touch y reduced motion. */
export function useTilt(max = 8) {
  const enabled = useCursorFx()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX: MotionValue<number> = useSpring(rx, SPRING)
  const rotateY: MotionValue<number> = useSpring(ry, SPRING)

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
  }
  const onPointerLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return { enabled, style: { rotateX, rotateY }, handlers: { onPointerMove, onPointerLeave } }
}
