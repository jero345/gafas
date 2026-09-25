import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useCursorFx, useMediaQuery } from '../../hooks/useMedia'

const COUNT = 5
const CENTER = 2

// Posición en reposo de cada carta sobre un arco. d = distancia al centro (-2…2).
// x/y en % del tamaño de la propia carta.
function restPose(d: number, spread: number) {
  const a = Math.abs(d)
  return { x: d * spread, y: a * a * 3.5, rotate: d * 6.5, scale: 1 - a * 0.055, blur: a * 1.4 }
}

const ENTER = { type: 'spring', bounce: 0.22, duration: 1 } as const
const HOVER = { type: 'spring', bounce: 0.15, duration: 0.55 } as const

function Card({
  i,
  active,
  setActive,
  spread,
  entered,
  scrollSpread,
}: {
  i: number
  active: number | null
  setActive: (fn: (a: number | null) => number | null) => void
  spread: number
  entered: boolean
  scrollSpread: MotionValue<number>
}) {
  const reduce = useReducedMotion()
  const d = i - CENTER
  const rest = restPose(d, spread)
  const isActive = active === i
  const isCenter = i === CENTER

  // Al enfocar una carta, las vecinas se abren para darle aire
  const gap = active === null || isActive ? 0 : Math.sign(i - active) * (Math.abs(i - active) === 1 ? 16 : 9)
  const blur = isActive ? 0 : active !== null && !isCenter ? rest.blur + 0.8 : rest.blur

  const target = {
    opacity: 1,
    x: `${rest.x + gap}%`,
    y: isActive ? '-6%' : `${rest.y}%`,
    rotate: isActive ? 0 : rest.rotate,
    scale: isActive ? 1.04 : rest.scale,
    filter: `blur(${blur}px)`,
  }
  const initial = reduce ? { ...target, opacity: 0 } : { opacity: 0, x: '0%', y: '30%', rotate: d * 2, scale: 0.86, filter: 'blur(8px)' }

  // Con el scroll, el abanico se abre un poco más (solo las laterales)
  const scrollX = useTransform(scrollSpread, (v) => `${v * d * 10}%`)
  const scrollY = useTransform(scrollSpread, (v) => `${v * -Math.abs(d) * 6}%`)

  return (
    <motion.div
      className="absolute top-0 left-1/2 w-[var(--card-w)]"
      style={{
        marginLeft: 'calc(var(--card-w) / -2)',
        zIndex: isActive ? 10 : COUNT - Math.abs(d),
        x: reduce ? 0 : scrollX,
        y: reduce ? 0 : scrollY,
      }}
    >
      <motion.div
        initial={initial}
        animate={target}
        transition={
          reduce
            ? { duration: 0.4 }
            : entered
              ? HOVER
              : { ...ENTER, delay: 0.35 + Math.abs(d) * 0.08, filter: { duration: 0.6, delay: 0.35 + Math.abs(d) * 0.08 } }
        }
        onHoverStart={() => setActive(() => i)}
        onHoverEnd={() => setActive((a) => (a === i ? null : a))}
        onTap={(e) => {
          // En touch, tocar alterna el foco (en mouse ya lo maneja el hover)
          if ((e as globalThis.PointerEvent).pointerType !== 'mouse') setActive((a) => (a === i ? null : i))
        }}
        style={{ transformOrigin: '50% 90%' }}
        className="relative will-change-transform"
      >
        {/* Sombra en su propia capa: se anima con opacity, no con box-shadow */}
        <motion.div
          aria-hidden
          className="bg-ink/60 absolute inset-x-[6%] top-[12%] bottom-[-2%] rounded-[28px] blur-2xl"
          animate={{ opacity: isActive ? 0.55 : isCenter ? 0.4 : 0.18 }}
          transition={{ duration: 0.3 }}
        />
        <div className="bg-card ring-ink/5 relative overflow-hidden rounded-[22px] ring-1 md:rounded-[28px]">
          <img
            src={`/portraits/${i + 1}.webp`}
            srcSet={`/portraits/${i + 1}-400.webp 400w, /portraits/${i + 1}.webp 720w`}
            sizes="(min-width: 1536px) 340px, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 44vw"
            alt={isCenter ? 'Perfil de un hombre de cabello gris con gafas oftálmicas' : ''}
            width={720}
            height={900}
            className="block aspect-[4/5] w-full object-cover select-none"
            loading={isCenter ? 'eager' : 'lazy'}
            fetchPriority={isCenter ? 'high' : 'auto'}
            decoding="async"
            draggable={false}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export function PortraitFan() {
  const ref = useRef<HTMLDivElement>(null)
  const cursorFx = useCursorFx()
  const wide = useMediaQuery('(min-width: 640px)')
  const [active, setActive] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 1500)
    return () => window.clearTimeout(t)
  }, [])

  // 0 cuando el abanico está en su sitio, 1 cuando sale por arriba
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end start'] })
  const scrollSpread = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  // Inclinación sutil de todo el plano con el cursor (sin preserve-3d: las cartas no se intersectan)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(mx, { stiffness: 110, damping: 20 })
  const rotateX = useSpring(my, { stiffness: 110, damping: 20 })
  const shiftX = useTransform(rotateY, (v) => v * 2.4)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!cursorFx) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 8)
    my.set(-((e.clientY - r.top) / r.height - 0.5) * 6)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
    setActive(null)
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto mt-12 h-[calc(var(--card-w)*1.36)] w-full [--card-w:44vw] [perspective:1600px] sm:[--card-w:30vw] md:mt-16 lg:[--card-w:22vw] 2xl:[--card-w:340px]"
    >
      <motion.div className="relative h-full w-full" style={cursorFx ? { rotateX, rotateY, x: shiftX } : undefined}>
        {Array.from({ length: COUNT }, (_, i) => (
          <Card
            key={i}
            i={i}
            active={active}
            setActive={(fn) => setActive(fn)}
            spread={wide ? 64 : 54}
            entered={entered}
            scrollSpread={scrollSpread}
          />
        ))}
      </motion.div>
    </div>
  )
}
