import { useEffect, type RefObject } from 'react'

type GsapModule = typeof import('./gsap')

/**
 * Carga GSAP + ScrollTrigger bajo demanda (fuera de la ruta crítica) y ejecuta `setup`
 * dentro de un gsap.context limitado a `scope`. Todo se revierte al desmontar.
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: (m: GsapModule) => void) {
  useEffect(() => {
    let revert: (() => void) | undefined
    let cancelled = false
    import('./gsap').then((m) => {
      if (cancelled || !scope.current) return
      const ctx = m.gsap.context(() => setup(m), scope.current)
      revert = () => ctx.revert()
      m.ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [])
}
