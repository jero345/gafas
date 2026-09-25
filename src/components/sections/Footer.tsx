import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '../../lib/motion'
import { APPOINTMENT_MESSAGE, DEMO_MESSAGE, whatsappUrl } from '../../lib/whatsapp'
import { Logo } from '../ui/Logo'
import { Magnetic } from '../ui/Magnetic'
import { PillButton } from '../ui/PillButton'
import { WordReveal } from '../ui/Reveal'
import { NAV_LINKS, onAnchorClick } from './Navbar'

export function FinalCTA() {
  return (
    <section id="contacto" aria-labelledby="cta-title" className="px-4 pb-8 md:px-8">
      <div className="bg-ink text-bg mx-auto max-w-[1440px] overflow-hidden rounded-[40px] px-6 py-20 text-center md:py-32">
        <h2
          id="cta-title"
          className="mx-auto max-w-[14ch] text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.92] font-extralight tracking-[var(--tracking-tightest)]"
        >
          <WordReveal
            inView
            text="Lleva tu óptica al siguiente nivel. Pide tu demo"
            render={(w, i) => (i >= 6 ? <span className="text-gradient underline-lav">{w}</span> : w)}
          />
        </h2>
        <p className="text-bg/70 mx-auto mt-6 max-w-[42ch] text-[17px] leading-relaxed">
          En 20 minutos te mostramos VYSE con tu propio catálogo. Sin compromiso.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic>
            <PillButton href={whatsappUrl(DEMO_MESSAGE)} variant="light" size="lg">
              Pide un Demo
            </PillButton>
          </Magnetic>
          <PillButton href={whatsappUrl(APPOINTMENT_MESSAGE)} variant="ghost-dark" size="lg">
            Agenda una cita
          </PillButton>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="px-4 pt-16 pb-10 md:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo className="h-10 w-auto md:h-14" />
          <p className="text-muted mt-4 max-w-[34ch] text-[15px]">Prueba virtual de gafas para ópticas y marcas. Hecho en Colombia.</p>
        </div>
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={onAnchorClick} className="text-ink/75 hover:text-ink transition-colors duration-200">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-line text-muted mx-auto mt-12 flex max-w-[1440px] flex-col gap-2 border-t pt-6 text-[13px] sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} VYSE. Todos los derechos reservados.</p>
        <p>Pagos y pedidos por WhatsApp · Envíos a toda Colombia</p>
      </div>
    </footer>
  )
}

export function WhatsAppFloat() {
  const reduce = useReducedMotion()
  return (
    <motion.a
      href={whatsappUrl('Hola VYSE 👋')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      initial={{ opacity: 0, transform: reduce ? 'none' : 'translateY(16px) scale(0.9)' }}
      animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
      transition={{ duration: 0.4, delay: 1.4, ease: EASE_OUT }}
      className="press pulse fixed right-4 bottom-4 isolate z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] md:right-6 md:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    </motion.a>
  )
}
