import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { faqs } from '../../data/content'
import { EASE_OUT } from '../../lib/motion'
import { Reveal } from '../ui/Reveal'

function Item({ q, a, i, open, onToggle }: { q: string; a: string; i: number; open: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion()
  return (
    <li className="border-line border-b">
      <h3>
        <button
          type="button"
          id={`faq-q-${i}`}
          aria-expanded={open}
          aria-controls={`faq-a-${i}`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 rounded-none py-6 text-left text-[19px] font-light tracking-[-0.02em] md:text-[24px]"
        >
          {q}
          <span aria-hidden className="border-ink/15 relative grid size-9 shrink-0 place-items-center rounded-full border">
            <span className="bg-ink absolute h-px w-3.5" />
            <span
              className={`bg-ink absolute h-3.5 w-px transition-transform duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'scale-y-0' : ''}`}
            />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-a-${i}`}
            role="region"
            aria-labelledby={`faq-q-${i}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <p className="text-muted max-w-[62ch] pr-12 pb-6 text-[16px] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="soporte" aria-labelledby="faq-title" className="px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="text-muted mb-5 text-[13px] tracking-[0.18em] uppercase">Soporte</p>
          <h2
            id="faq-title"
            className="max-w-[12ch] text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.02] font-extralight tracking-[var(--tracking-tightest)]"
          >
            Preguntas frecuentes
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="border-line border-t">
            {faqs.map((f, i) => (
              <Item key={f.q} {...f} i={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
