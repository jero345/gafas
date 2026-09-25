import { useId } from 'react'
import type { FrameShape } from '../../data/products'

interface Props {
  shape: FrameShape
  frame: string
  lens: string
  className?: string
  title?: string
}

// Media lente (lado derecho) por forma; el izquierdo se refleja.
const LENS: Record<FrameShape, string> = {
  rect: 'M14 -44 H118 Q140 -44 140 -22 V20 Q140 50 108 50 H40 Q14 50 14 22 Z',
  round: 'M77 -50 A62 55 0 1 1 76.9 -50 Z',
  square: 'M14 -48 H136 Q142 -48 142 -40 V38 Q142 50 128 50 H26 Q14 50 14 36 Z',
  cat: 'M14 -30 Q60 -52 150 -58 Q146 -10 128 26 Q112 52 72 50 Q20 48 14 10 Z',
  aviator: 'M14 -44 H132 Q146 -44 142 -14 Q134 52 84 56 Q30 58 16 0 Z',
}

/** Dibujo vectorial de una montura; se recolorea por props. */
export function FrameArt({ shape, frame, lens, className = '', title }: Props) {
  const id = useId().replace(/:/g, '')
  const d = LENS[shape]
  const thick = shape === 'aviator' || shape === 'round' ? 7 : 11
  return (
    <svg
      viewBox="-170 -80 340 160"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={lens} stopOpacity="0.55" />
          <stop offset="1" stopColor={lens} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* patillas */}
      <path d="M-150 -30 L-166 -34 M150 -30 L166 -34" stroke={frame} strokeWidth={thick * 0.8} strokeLinecap="round" />
      {[1, -1].map((s) => (
        <g key={s} transform={`scale(${s} 1)`}>
          <path d={d} fill={`url(#l${id})`} stroke={frame} strokeWidth={thick} strokeLinejoin="round" />
          <path d={d} fill={`url(#s${id})`} transform="translate(8 6) scale(0.9)" />
        </g>
      ))}
      {/* puente */}
      <path d="M-15 -26 Q0 -40 15 -26" stroke={frame} strokeWidth={thick * 0.9} fill="none" strokeLinecap="round" />
      {shape === 'aviator' && <path d="M-16 -44 H16" stroke={frame} strokeWidth={5} strokeLinecap="round" />}
    </svg>
  )
}
