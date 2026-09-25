export const WHATSAPP_NUMBER = ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '').replace(/\D/g, '')

export const whatsappUrl = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

export function openWhatsApp(text: string) {
  window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer')
}

export const planMessage = (plan: string, modality: string) => `Hola, quiero contratar el plan ${plan} (${modality})`

export const DEMO_MESSAGE = 'Hola VYSE 👋 Quiero pedir un demo de la prueba virtual de gafas.'
export const APPOINTMENT_MESSAGE = 'Hola VYSE 👋 Quiero agendar una cita.'
