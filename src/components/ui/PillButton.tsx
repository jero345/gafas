import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'outline' | 'filled' | 'light' | 'ghost-dark' | 'glass'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface Common {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
  /** Oculta el círculo con flecha */
  noArrow?: boolean
}

type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const base =
  'pill group relative inline-flex select-none items-center justify-between rounded-full border font-light tracking-[-0.01em] whitespace-nowrap disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  outline: 'border-ink bg-transparent text-ink hover:bg-ink/[0.04]',
  filled: 'border-ink bg-ink text-bg hover:bg-[#2a2a2a]',
  light: 'border-ink/15 bg-card text-ink hover:bg-white',
  'ghost-dark': 'border-bg/40 bg-transparent text-bg hover:bg-bg/10',
  glass: 'border-white/60 bg-white/70 text-ink shadow-[0_8px_30px_-12px_rgba(17,17,17,0.25)] backdrop-blur-md hover:bg-white/90',
}

const sizes: Record<Size, string> = {
  xs: 'h-8 gap-2 pl-3.5 pr-[3px] text-[13px]',
  sm: 'h-10 gap-3 pl-4 pr-1 text-[14px]',
  md: 'h-12 gap-3 pl-5 pr-1.5 text-[16px]',
  lg: 'h-14 gap-3 pl-6 pr-1.5 text-[17px]',
}

const circle: Record<Size, string> = { xs: 'size-[26px]', sm: 'size-8', md: 'size-9', lg: 'size-11' }

// Círculo del icono por variante (mockup: círculo negro en outline, solo anillo en filled)
const tones: Record<Variant, string> = {
  outline: 'bg-ink text-bg',
  filled: 'bg-transparent text-bg',
  light: 'bg-ink text-bg',
  'ghost-dark': 'bg-transparent text-bg',
  glass: 'bg-white text-ink',
}

function Arrow({ size, variant }: { size: Size; variant: Variant }) {
  return (
    <span aria-hidden className={`relative grid shrink-0 place-items-center rounded-full ${circle[size]} ${tones[variant]}`}>
      {/* Anillo fijo */}
      <svg viewBox="0 0 20 20" className="absolute inset-[3px] size-[calc(100%-6px)]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="10" cy="10" r="9" />
      </svg>
      {/* Flecha que sale y vuelve a entrar en hover */}
      <span className="pill-arrow relative grid size-[60%] place-items-center overflow-hidden rounded-full">
        {[0, 1].map((i) => (
          <span key={i} className="col-start-1 row-start-1 grid place-items-center">
            <svg viewBox="0 0 16 16" className="size-[78%]" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ))}
      </span>
    </span>
  )
}

export const PillButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, AsButton | AsLink>(function PillButton(
  { variant = 'outline', size = 'md', children, className = '', noArrow, ...rest },
  ref,
) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${noArrow ? 'pr-5' : ''} ${className}`
  const content = (
    <>
      <span className="relative">{children}</span>
      {!noArrow && <Arrow size={size} variant={variant} />}
    </>
  )
  if ('href' in rest && rest.href !== undefined) {
    const external = /^https?:/.test(rest.href)
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  )
})
