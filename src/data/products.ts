export type Category = 'sol' | 'oftalmicas' | 'edicion-limitada'

export const categories: { id: Category | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'sol', label: 'Sol' },
  { id: 'oftalmicas', label: 'Oftálmicas' },
  { id: 'edicion-limitada', label: 'Edición limitada' },
]

export interface ProductColor {
  name: string
  frame: string // color de la montura
  lens: string // tinte del lente
}

/** Forma de la montura; la dibuja <FrameArt />. Si tienes foto, usa `image`. */
export type FrameShape = 'rect' | 'round' | 'cat' | 'aviator' | 'square'

export interface Product {
  id: string
  name: string
  category: Category
  price: number // COP
  description: string
  shape: FrameShape
  colors: ProductColor[]
  /** Opcional: ruta a una foto webp en /public. Si existe, reemplaza el dibujo SVG. */
  image?: string
}

export const products: Product[] = [
  {
    id: 'aura',
    name: 'Montura Aura',
    category: 'oftalmicas',
    price: 180000,
    shape: 'rect',
    description: 'Acetato italiano pulido a mano, perfil rectangular suave y bisagras flex. La montura para todos los días.',
    colors: [
      { name: 'Negro', frame: '#151515', lens: '#e9edf0' },
      { name: 'Carey', frame: '#7a4a2c', lens: '#efe9e1' },
      { name: 'Cristal', frame: '#c9c4bd', lens: '#eef0f2' },
    ],
  },
  {
    id: 'lumen',
    name: 'Montura Lumen',
    category: 'sol',
    price: 210000,
    shape: 'round',
    description: 'Redonda, ligera y con lentes polarizados UV400. Pensada para el sol de la costa y la ciudad.',
    colors: [
      { name: 'Carey', frame: '#8a5a3c', lens: '#5a4636' },
      { name: 'Negro', frame: '#141414', lens: '#2d2f33' },
      { name: 'Lavanda', frame: '#a78ab5', lens: '#6e5580' },
    ],
  },
  {
    id: 'nova',
    name: 'Montura Nova',
    category: 'sol',
    price: 240000,
    shape: 'cat',
    description: 'Cat-eye con puntas elevadas y acetato de alta densidad. Presencia sin esfuerzo.',
    colors: [
      { name: 'Negro', frame: '#121212', lens: '#34302e' },
      { name: 'Rosa humo', frame: '#c7a2a4', lens: '#7b5b5d' },
    ],
  },
  {
    id: 'orbit',
    name: 'Montura Orbit',
    category: 'oftalmicas',
    price: 165000,
    shape: 'round',
    description: 'Metal de titanio ultraligero de 9 g con plaquetas ajustables. Casi no la sientes.',
    colors: [
      { name: 'Oro', frame: '#b59a5b', lens: '#eef0f2' },
      { name: 'Plata', frame: '#9ea3a8', lens: '#eef0f2' },
      { name: 'Grafito', frame: '#3b3d40', lens: '#eef0f2' },
    ],
  },
  {
    id: 'vesper',
    name: 'Montura Vesper',
    category: 'sol',
    price: 260000,
    shape: 'aviator',
    description: 'Aviador de doble puente con lentes degradados. Un clásico reinterpretado.',
    colors: [
      { name: 'Oro', frame: '#b59a5b', lens: '#6b5a48' },
      { name: 'Grafito', frame: '#3b3d40', lens: '#3a4448' },
    ],
  },
  {
    id: 'mira',
    name: 'Montura Mira',
    category: 'oftalmicas',
    price: 195000,
    shape: 'square',
    description: 'Cuadrada, de acetato grueso y líneas limpias. Carácter para el día a día.',
    colors: [
      { name: 'Negro', frame: '#151515', lens: '#e9edf0' },
      { name: 'Verde oliva', frame: '#5f6348', lens: '#eef0f2' },
      { name: 'Miel', frame: '#b07a3e', lens: '#efe9e1' },
    ],
  },
  {
    id: 'eclipse',
    name: 'Eclipse Edición 01',
    category: 'edicion-limitada',
    price: 420000,
    shape: 'cat',
    description: 'Serie numerada de 200 unidades. Acetato bicolor lavanda y lentes espejados.',
    colors: [
      { name: 'Lavanda', frame: '#a78ab5', lens: '#8e7aa0' },
      { name: 'Perla', frame: '#e3dcd2', lens: '#a38db3' },
    ],
  },
  {
    id: 'halo',
    name: 'Halo Edición 02',
    category: 'edicion-limitada',
    price: 390000,
    shape: 'round',
    description: 'Titanio con baño de oro de 18k y estuche de cuero hecho en Bogotá. Solo 150 piezas.',
    colors: [
      { name: 'Oro', frame: '#c2a45e', lens: '#4d4236' },
      { name: 'Negro mate', frame: '#1c1c1c', lens: '#2b2d31' },
    ],
  },
]
