export type Modality = 'individual' | 'team' | 'api'

export const modalities: { id: Modality; label: string }[] = [
  { id: 'individual', label: 'Individual' },
  { id: 'team', label: 'Team & Enterprise' },
  { id: 'api', label: 'API' },
]

export interface Plan {
  id: 'lite' | 'pro' | 'max'
  name: string
  tagline: string
  featured?: boolean
  /** Precio mensual en COP por modalidad */
  price: Record<Modality, number>
  priceNote: Record<Modality, string>
  features: string[]
}

export const plans: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    tagline: 'Para ópticas que empiezan a vender online.',
    price: { individual: 149000, team: 390000, api: 290000 },
    priceNote: { individual: '/ mes', team: '/ mes · hasta 5 sedes', api: '/ mes · 5.000 pruebas' },
    features: ['Hasta 50 monturas', 'Prueba virtual en web y móvil', 'Botón de compra por WhatsApp', 'Soporte por correo'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para marcas que quieren convertir más.',
    featured: true,
    price: { individual: 349000, team: 890000, api: 690000 },
    priceNote: { individual: '/ mes', team: '/ mes · hasta 20 sedes', api: '/ mes · 25.000 pruebas' },
    features: [
      'Monturas ilimitadas',
      'Medición de distancia pupilar',
      'Analítica de pruebas y ventas',
      'Integración con Shopify y WooCommerce',
      'Soporte prioritario',
    ],
  },
  {
    id: 'max',
    name: 'Max',
    tagline: 'Para cadenas y retailers con alto volumen.',
    price: { individual: 749000, team: 1990000, api: 1490000 },
    priceNote: { individual: '/ mes', team: '/ mes · sedes ilimitadas', api: '/ mes · pruebas ilimitadas' },
    features: [
      'Todo lo de Pro',
      'Marca blanca y dominio propio',
      'Modelos 3D a medida de tu catálogo',
      'SLA 99,9 % y gerente de cuenta',
      'Onboarding presencial',
    ],
  },
]
