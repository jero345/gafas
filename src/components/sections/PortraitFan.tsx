import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useCursorFx, useMediaQuery } from '../../hooks/useMedia'

// Orden del mockup, de izquierda a derecha: el centro es ph-1
const SLOTS = [
  { img: 5, alt: '' },
  { img: 4, alt: '' },
  { img: 1, alt: 'Perfil de una mujer de cabello corto y rizado con gafas oftálmicas' },
  { img: 3, alt: '' },
  { img: 2, alt: '' },
]
const CENTER = 2

// Pose de reposo medida sobre el mockup (x, y en % del tamaño de la propia carta).
// Las cartas no se tocan: separación de ~1,37 anchos en las internas y ~2,65 en las externas.
const POSES = {
  wide: [
    { x: -265, y: 40, rotate: -22, scale: 1.12, blur: 3.2 },
    { x: -137, y: 14, rotate: -8, scale: 1, blur: 1.8 },
    { x: 0, y: 0, rotate: 0, scale: 1, blur: 0 },
    { x: 137, y: 14, rotate: 8, scale: 1, blur: 1.8 },
    { x: 265, y: 40, rotate: 22, scale: 1.12, blur: 3.2 },
  ],
  // En móvil se acercan para que las laterales asomen por los bordes
  narrow: [
    { x: -215, y: 36, rotate: -20, scale: 1.08, blur: 2.6 },
    { x: -112, y: 12, rotate: -8, scale: 0.98, blur: 1.6 },
    { x: 0, y: 0, rotate: 0, scale: 1, blur: 0 },
    { x: 112, y: 12, rotate: 8, scale: 0.98, blur: 1.6 },
    { x: 215, y: 36, rotate: 20, scale: 1.08, blur: 2.6 },
  ],
}

const ENTER = { type: 'spring', bounce: 0.2, duration: 1.1 } as const
const SETTLE = { type: 'spring', bounce: 0.15, duration: 0.55 } as const

function Card({
  i,
  active,
  setActive,
  wide,
  entered,
  spread,
}: {
  i: number
  active: number | null
  setActive: (fn: (a: number | null) => number | null) => void
  wide: boolean
  entered: boolean
  spread: MotionValue<number>
}) {
  const reduce = useReducedMotion()
  const d = i - CENTER
  const rest = POSES[wide ? 'wide' : 'narrow'][i]
  const slot = SLOTS[i]
  const isActive = active === i
  const isCenter = i === CENTER

  // La carta enfocada se endereza, se levanta y pierde el blur; las vecinas le abren espacio
  const push = active === null || isActive ? 0 : Math.sign(i - active) * (Math.abs(i - active) === 1 ? 7 : 4)
  const target = {
    opacity: 1,
    x: `${rest.x + push}%`,
    y: `${rest.y - (isActive ? 5 : 0)}%`,
    rotate: isActive ? 0 : rest.rotate,
    scale: rest.scale * (isActive ? 1.04 : 1),
    filter: `blur(${isActive ? 0 : rest.blur}px)`,
  }
  // Entrada: salen apiladas del centro y se reparten como cartas
  const initial = reduce
    ? { ...target, opacity: 0 }
    : { opacity: 0, x: `${d * 12}%`, y: '45%', rotate: d * 3, scale: 0.9, filter: 'blur(10px)' }

  const delay = 0.45 + Math.abs(d) * 0.09
  // Scroll: el abanico se abre y las laterales suben un poco
  const sx = useTransform(spread, (v) => `${v * d * 14}%`)
  const sy = useTransform(spread, (v) => `${v * -Math.abs(d) * 10}%`)

  return (
    <motion.div
      className="absolute top-0 left-1/2 w-[var(--card-w)]"
      style={{
        marginLeft: 'calc(var(--card-w) / -2)',
        zIndex: isActive ? 10 : 5 - Math.abs(d),
        x: reduce ? 0 : sx,
        y: reduce ? 0 : sy,
      }}
    >
      <motion.div
        initial={initial}
        animate={target}
        transition={reduce ? { duration: 0.4 } : entered ? SETTLE : { ...ENTER, delay, filter: { duration: 0.7, delay } }}
        onHoverStart={() => setActive(() => i)}
        onHoverEnd={() => setActive((a) => (a === i ? null : a))}
        onTap={(e) => {
          // En touch, tocar alterna el foco (en mouse lo maneja el hover)
          if ((e as globalThis.PointerEvent).pointerType !== 'mouse') setActive((a) => (a === i ? null : i))
        }}
        className="relative will-change-transform"
      >
        {/* Sombra desplazada abajo-derecha como en el mockup; se anima solo su opacidad */}
        <motion.div
          aria-hidden
          className="bg-ink absolute inset-0 translate-x-[5%] translate-y-[4%] rounded-[14px] blur-xl"
          initial={false}
          animate={{ opacity: isActive ? 0.34 : isCenter && active === null ? 0.26 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <div className="bg-card relative overflow-hidden rounded-[10px] lg:rounded-[14px]">
          <img
            src={`/portraits/${slot.img}.webp`}
            srcSet={`/portraits/${slot.img}-400.webp 400w, /portraits/${slot.img}.webp 720w`}
            sizes="(min-width: 1024px) min(15.6vw, 320px), (min-width: 640px) 28vw, 42vw"
            alt={slot.alt}
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
  const wide = useMediaQuery('(min-width: 1024px)')
  const [active, setActive] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 1700)
    return () => window.clearTimeout(t)
  }, [])

  // 0 con el abanico en su sitio → 1 cuando sale por arriba
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 60%', 'end start'] })
  const spread = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  // Inclinación sutil del plano con el cursor (sin preserve-3d: las cartas nunca se intersectan)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(mx, { stiffness: 110, damping: 20 })
  const rotateX = useSpring(my, { stiffness: 110, damping: 20 })
  const shiftX = useTransform(rotateY, (v) => v * 3)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!cursorFx) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 6)
    my.set(-((e.clientY - r.top) / r.height - 0.5) * 5)
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
      className="relative mx-auto mt-8 h-[calc(var(--card-w)*1.25)] w-full [--card-w:42vw] [perspective:1600px] sm:[--card-w:28vw] md:mt-10 lg:[--card-w:min(15.6vw,320px)]"
    >
      <motion.div className="relative h-full w-full" style={cursorFx ? { rotateX, rotateY, x: shiftX } : undefined}>
        {SLOTS.map((s, i) => (
          <Card key={s.img} i={i} active={active} setActive={(fn) => setActive(fn)} wide={wide} entered={entered} spread={spread} />
        ))}
      </motion.div>
    </div>
  )
}
