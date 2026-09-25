import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'outline' | 'filled' | 'light' | 'ghost-dark'
type Size = 'sm' | 'md' | 'lg'

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
  'pill group relative inline-flex select-none items-center justify-between gap-3 rounded-full border font-normal tracking-[-0.01em] whitespace-nowrap disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  outline: 'border-ink/80 bg-transparent text-ink hover:bg-ink/[0.04]',
  filled: 'border-ink bg-ink text-bg hover:bg-[#2a2a2a]',
  light: 'border-ink/15 bg-card text-ink hover:bg-white',
  'ghost-dark': 'border-bg/40 bg-transparent text-bg hover:bg-bg/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 pl-4 pr-1 text-[14px]',
  md: 'h-12 pl-5 pr-1.5 text-[15px]',
  lg: 'h-14 pl-6 pr-1.5 text-[16px]',
}

const circle: Record<Size, string> = { sm: 'size-8', md: 'size-9', lg: 'size-11' }

function Arrow({ size, variant }: { size: Size; variant: Variant }) {
  const tone = variant === 'filled' || variant === 'ghost-dark' ? 'bg-bg text-ink' : 'bg-ink text-bg'
  return (
    <span
      aria-hidden
      className={`pill-arrow relative grid shrink-0 place-items-center overflow-hidden rounded-full ${circle[size]} ${tone}`}
    >
      {[0, 1].map((i) => (
        <span key={i} className="col-start-1 row-start-1 grid place-items-center">
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ))}
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
