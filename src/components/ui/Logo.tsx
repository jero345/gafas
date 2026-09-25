export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 98 36" className={className} role="img" aria-label="VYSE">
      <text
        x="0"
        y="30"
        fontFamily="Inter Tight Variable, Inter Tight, sans-serif"
        fontWeight={400}
        fontSize="32"
        letterSpacing="-1.6"
        fill="currentColor"
      >
        VYSE
      </text>
      {/* Destello */}
      <path d="M89 0c.7 4.4 2.6 6.3 7 7-4.4.7-6.3 2.6-7 7-.7-4.4-2.6-6.3-7-7 4.4-.7 6.3-2.6 7-7Z" fill="currentColor" />
    </svg>
  )
}
