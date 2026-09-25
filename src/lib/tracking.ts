// Hooks de tracking listos para Meta Pixel y Google Tag Manager.
// Pega los snippets oficiales en index.html y estos eventos empezarán a registrarse.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  window.fbq?.('track', event, params)
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...params })
}
