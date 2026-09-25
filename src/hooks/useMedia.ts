import { useSyncExternalStore } from 'react'
import { useReducedMotion } from 'motion/react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** true en dispositivos con cursor fino (desactiva tilt/magnético/glow en touch). */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

/** true si los efectos basados en cursor deben correr. */
export function useCursorFx() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  return fine && !reduce
}

export const useIsDesktop = () => useMediaQuery('(min-width: 768px)')
