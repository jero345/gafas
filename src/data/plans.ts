export type Modality = 'individual' | 'team' | 'api'

export const modalities: { id: Modality; label: string }[] = [
  { id: 'individual', label: 'Individual' },
  { id: 'team', label: 'Team & Enterprise' },
  { id: 'api', label: 'API' },
]

export interface Plan {
  id: 'lite' | 'pro' | 'max'
  name: string
  description: string
  /** Encabezado de la lista ("Incluye", "Incluye todo lo de Pro, más:") */
  includesLabel: string
  features: string[]
}

// Textos del mockup "MICROSITIO VYSE"
export const plans: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    description: 'Ideal para marcas que quieren lanzar su experiencia digital rápidamente.',
    includesLabel: 'Incluye',
    features: [
      'Micrositio VYSE para tu marca',
      'Prueba virtual desde móvil y desktop',
      'Hasta 20 monturas en el banco de producto',
      'Gestión básica de catálogo',
      'Actualizaciones de plataforma',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pensado para marcas que quieren ampliar su oferta y ofrecer más opciones a sus clientes.',
    includesLabel: 'Incluye',
    features: [
      'Personalización de Micrositio VYSE para tu marca',
      'Hasta 60 monturas en el banco de producto',
      'Gestión Avanzada de catálogo',
      'Actualizaciones de plataforma',
      'Analítica de interacción',
    ],
  },
  {
    id: 'max',
    name: 'Max',
    description: 'Para marcas que quieren llevar su catálogo al siguiente nivel.',
    includesLabel: 'Incluye todo lo de Pro, más:',
    features: [
      'Hasta 120 monturas en el banco de producto',
      'Modelado 3D personalizado para monturas exclusivas',
      'Renderizado optimizado para prueba virtual',
      'Soporte prioritario',
      'Tus monturas, recreadas digitalmente con precisión.',
    ],
  },
]
