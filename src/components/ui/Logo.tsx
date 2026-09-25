// Destello de rayos finos, como en el mockup
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6
  const r = i % 2 ? 5.5 : 8
  return `M${(Math.cos(a) * 1.6).toFixed(2)} ${(Math.sin(a) * 1.6).toFixed(2)}L${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`
}).join('')

export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 104 36" className={className} role="img" aria-label="VYSE">
      <text
        x="0"
        y="32"
        fontFamily="Inter Tight Variable, Inter Tight, sans-serif"
        fontWeight={300}
        fontSize="30"
        textLength="82"
        lengthAdjust="spacing"
        fill="currentColor"
      >
        VYSE
      </text>
      <path d={RAYS} transform="translate(94 9)" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  )
}
