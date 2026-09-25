import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
} from 'motion/react'
import { useEffect, useRef, type PointerEvent } from 'react'
import { useCursorFx } from '../../hooks/useMedia'

// Retratos en el orden del mockup (el centro inicial es ph-1). Se duplican para que la rueda
// sea continua: el salto de un extremo al otro ocurre siempre fuera de pantalla.
const PEOPLE = [5, 4, 1, 3, 2]
const CARDS = [...PEOPLE, ...PEOPLE]
const N = CARDS.length
const START = 2 // índice que arranca en el centro

// Geometría de la rueda (en anchos de tarjeta): radio y ángulo entre tarjetas.
// Ajustada al mockup: vecinas a ~1,37 anchos y ±11°, extremas a ~2,7 anchos y ±22°.
const RADIUS = 7.2
const STEP_DEG = 11
const SLOT_PX_FACTOR = RADIUS * Math.sin((STEP_DEG * Math.PI) / 180) // desplazamiento horizontal por posición

const SPEED = 0.32 // posiciones por segundo en giro continuo (~3 s por retrato)

/** Distancia (en posiciones) de la tarjeta i al centro, envuelta a [-N/2, N/2) */
const offsetOf = (i: number, t: number) => {
  const x = i - START - t
  return ((((x + N / 2) % N) + N) % N) - N / 2
}

function Card({ i, t, onSelect }: { i: number; t: MotionValue<number>; onSelect: (i: number) => void }) {
  const img = CARDS[i]
  // Todo sale de un único motion value → sin renders de React mientras gira
  const transform = useTransform(t, (v) => {
    const s = offsetOf(i, v)
    const rad = (s * STEP_DEG * Math.PI) / 180
    const x = RADIUS * Math.sin(rad) * 100 // % del ancho de la tarjeta
    const y = ((RADIUS * (1 - Math.cos(rad))) / 1.25) * 100 // % del alto (alto = 1,25 anchos)
    return `translate3d(${x}%, ${y}%, 0) rotate(${s * STEP_DEG}deg)`
  })
  const zIndex = useTransform(t, (v) => 100 - Math.round(Math.abs(offsetOf(i, v)) * 10))
  // Fuera de ±2,4 posiciones se desvanece (ahí ya está casi fuera de pantalla)
  const opacity = useTransform(t, (v) => {
    const a = Math.abs(offsetOf(i, v))
    return a < 2.4 ? 1 : Math.max(0, 1 - (a - 2.4) / 0.7)
  })
  // Blur sin animar `filter`: una capa pre-desenfocada que aparece con opacidad al alejarse del centro
  const blurLayer = useTransform(t, (v) => Math.min(1, Math.max(0, Math.abs(offsetOf(i, v)) - 0.2) / 1.1))
  const shadow = useTransform(t, (v) => Math.max(0, 1 - Math.abs(offsetOf(i, v)) * 1.4) * 0.3)

  const src = `/portraits/${img}.webp`
  const srcSet = `/portraits/${img}-400.webp 400w, /portraits/${img}.webp 720w`
  const sizes = '(min-width: 1024px) min(15.6vw, 320px), (min-width: 640px) 28vw, 42vw'

  return (
    <motion.div
      data-card
      className="absolute top-0 left-1/2 w-(--card-w) will-change-transform"
      style={{ marginLeft: 'calc(var(--card-w) / -2)', transform, zIndex, opacity, transformOrigin: '50% 50%' }}
      onTap={() => onSelect(i)}
    >
      {/* Sombra abajo-derecha, solo cerca del centro */}
      <motion.div
        aria-hidden
        className="bg-ink absolute inset-0 translate-x-[5%] translate-y-[4%] rounded-[14px] blur-xl"
        style={{ opacity: shadow }}
      />
      <div className="bg-card relative grid overflow-hidden rounded-[10px] lg:rounded-[14px]">
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt=""
          width={720}
          height={900}
          className="col-start-1 row-start-1 block aspect-4/5 w-full object-cover select-none"
          loading={i === START ? 'eager' : 'lazy'}
          fetchPriority={i === START ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
        />
        <motion.img
          aria-hidden
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt=""
          width={720}
          height={900}
          className="col-start-1 row-start-1 block aspect-4/5 w-full scale-[1.04] object-cover blur-[3px] select-none"
          style={{ opacity: blurLayer }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
    </motion.div>
  )
}

export function PortraitFan() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const cursorFx = useCursorFx()
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })

  // t = posición de la rueda (0 → START al centro). Entra girando desde la izquierda.
  const t = useMotionValue(reduce ? 0 : -2.2)
  // Multiplicador de velocidad 0…1 con resorte: al pasar el cursor frena suave y al salir vuelve a acelerar
  const speed = useSpring(0, { stiffness: 50, damping: 18 })
  const anim = useRef<AnimationPlaybackControls | null>(null)
  const busy = useRef(true) // entrada, arrastre o salto a una tarjeta: el giro continuo espera
  const hovering = useRef(false)
  const visible = useRef(true)
  visible.current = inView

  // Entrada girando y luego giro continuo
  useEffect(() => {
    if (reduce) return
    anim.current = animate(t, 0, {
      type: 'spring',
      bounce: 0.1,
      duration: 1.8,
      delay: 0.35,
      onComplete: () => {
        busy.current = false
        if (!hovering.current) speed.set(1)
      },
    })
    return () => anim.current?.stop()
  }, [reduce, speed, t])

  useAnimationFrame((_, delta) => {
    if (reduce || busy.current || !visible.current) return
    const v = speed.get()
    if (v > 0.001) t.set(t.get() + (v * SPEED * Math.min(delta, 64)) / 1000)
  })

  const seek = (target: number, duration: number) => {
    anim.current?.stop()
    busy.current = true
    anim.current = animate(t, target, { type: 'spring', bounce: 0.12, duration, onComplete: () => (busy.current = false) })
  }

  // Tocar una tarjeta lateral la trae al centro
  const onSelect = (i: number) => {
    if (reduce) return
    const s = offsetOf(i, t.get())
    if (Math.abs(s) > 0.3) seek(t.get() + s, 0.8)
  }

  // Arrastrar para girar la rueda, con inercia al soltar
  const slotPx = () => (ref.current?.querySelector<HTMLElement>('[data-card]')?.offsetWidth ?? 240) * SLOT_PX_FACTOR
  const onPanStart = () => {
    anim.current?.stop()
    busy.current = true
  }
  const onPan = (_: unknown, info: PanInfo) => t.set(t.get() - info.delta.x / slotPx())
  const onPanEnd = (_: unknown, info: PanInfo) => seek(t.get() - (info.velocity.x / slotPx()) * 0.3, 0.9)

  // Inclinación sutil del plano con el cursor (sin preserve-3d: las tarjetas no se intersectan)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(mx, { stiffness: 110, damping: 20 })
  const rotateX = useSpring(my, { stiffness: 110, damping: 20 })
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!cursorFx) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 5)
    my.set(-((e.clientY - r.top) / r.height - 0.5) * 4)
  }

  return (
    <motion.div
      ref={ref}
      role="img"
      aria-label="Retratos de personas usando gafas, girando en círculo"
      onPointerMove={onMove}
      onHoverStart={() => {
        hovering.current = true
        speed.set(0)
      }}
      onHoverEnd={() => {
        hovering.current = false
        speed.set(1)
        mx.set(0)
        my.set(0)
      }}
      onPanStart={reduce ? undefined : onPanStart}
      onPan={reduce ? undefined : onPan}
      onPanEnd={reduce ? undefined : onPanEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{ touchAction: 'pan-y' }}
      className="relative mx-auto mt-8 h-[calc(var(--card-w)*1.95)] w-full cursor-grab select-none [--card-w:42vw] [perspective:1600px] active:cursor-grabbing sm:[--card-w:28vw] md:mt-10 lg:[--card-w:min(15.6vw,320px)]"
    >
      <motion.div className="relative h-full w-full" style={cursorFx ? { rotateX, rotateY } : undefined}>
        {CARDS.map((_, i) => (
          <Card key={i} i={i} t={t} onSelect={onSelect} />
        ))}
      </motion.div>
    </motion.div>
  )
}
