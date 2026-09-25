// Importa el catálogo real del cliente (optica.johnbecerra.dev/mocks/catalog.json + fotos):
// recorta cada foto a la montura, la exporta a webp, calcula el color del marco
// y agrupa por nombre (las variantes de color de un mismo modelo).
//
// Uso: node scripts/import-catalog.cjs
//   entrada: assets-src/catalogo/catalog.json y assets-src/catalogo/{id}.jpg
//   salida:  public/products/{id}.webp, {id}-400.webp y src/data/catalog.generated.ts
const sharp = require('sharp')
const fs = require('fs')

const SRC = 'assets-src/catalogo'
const OUT = 'public/products'
fs.mkdirSync(OUT, { recursive: true })

const CATEGORY_IDS = {
  'Lentes de Sol': 'sol',
  Clásicas: 'clasicas',
  Deportivos: 'deportivos',
  Lectura: 'lectura',
  Premium: 'premium',
  Ultraligeros: 'ultraligeros',
}

// Nombres de color revisados a ojo sobre cada foto (la detección automática queda como respaldo
// para productos nuevos). Si agregas un producto, súmalo aquí.
const COLOR_OVERRIDES = {
  m1: 'Negro',
  m2: 'Carey',
  m3: 'Negro y azul',
  m4: 'Negro',
  m5: 'Carey',
  m6: 'Durazno',
  m7: 'Rosa',
  m8: 'Rosa',
  m9: 'Violeta',
  m10: 'Rojo',
  m11: 'Lila',
  m12: 'Negro',
  m16: 'Carey',
  m17: 'Dorado',
  m18: 'Nude',
  m19: 'Azul marino',
  m20: 'Negro',
  m21: 'Carey rosa',
  m25: 'Negro',
  m26: 'Carey',
  m27: 'Negro',
  m28: 'Rosa',
  m30: 'Gris',
  m31: 'Negro',
  m33: 'Negro',
  m34: 'Marfil',
  m35: 'Negro',
  m36: 'Negro',
  m37: 'Carey',
  m41: 'Carey',
  m42: 'Negro',
  m43: 'Rojo',
  m44: 'Lila',
  m45: 'Negro',
  m46: 'Azul claro',
  m47: 'Gris',
  m48: 'Vino',
  m49: 'Azul',
  m50: 'Cristal',
  m51: 'Carey',
  m52: 'Rojo',
  m53: 'Rosa',
  m54: 'Negro',
  m55: 'Negro y dorado',
  m56: 'Cereza',
  m57: 'Vino',
  m58: 'Oro rosa',
  m59: 'Dorado',
  m63: 'Gris',
  m66: 'Oro rosa',
  m68: 'Rosa',
  m73: 'Negro',
  m74: 'Cristal',
  m75: 'Carey',
  m76: 'Gris cristal',
  m77: 'Verde',
  m78: 'Dorado',
  m79: 'Negro',
  m80: 'Caramelo',
  mont: 'Azul',
  mx1: 'Bronce',
  mx2: 'Café',
  mx3: 'Beige',
  mx4: 'Negro',
  mx5: 'Carey rosa',
  mx6: 'Fucsia',
}

// Swatch por nombre de color, para que el mismo color se vea igual en todas las cards
const COLOR_HEX = {
  Negro: '#151515',
  'Negro y azul': '#1f2a4a',
  'Negro y dorado': '#2a2418',
  Carey: '#6b4226',
  'Carey rosa': '#b86f6a',
  Durazno: '#f1b99a',
  Rosa: '#e2a6b0',
  Violeta: '#7a3f8f',
  Rojo: '#b3202c',
  Cereza: '#8e1b2b',
  Vino: '#6d1f33',
  Lila: '#a98bd0',
  Dorado: '#c9a55a',
  'Oro rosa': '#d7a18a',
  Nude: '#e8c0a4',
  'Azul marino': '#23305a',
  Azul: '#2a4fa8',
  'Azul claro': '#8fb3d9',
  Gris: '#8a8c90',
  'Gris cristal': '#c9c7c4',
  Cristal: '#e6e6e3',
  Marfil: '#efe6d2',
  Verde: '#3aa577',
  Caramelo: '#b77b45',
  Bronce: '#6a5238',
  Café: '#5a3a24',
  Beige: '#d9c3ad',
  Fucsia: '#e0226e',
}

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s, l]
}

/** Nombre aproximado de color a partir del promedio del marco */
function colorName([r, g, b]) {
  const [h, s, l] = rgbToHsl(r, g, b)
  if (l < 0.24) return 'Negro'
  if (s < 0.12) return l < 0.45 ? 'Gris oscuro' : l < 0.7 ? 'Gris' : 'Cristal'
  if (h < 12 || h >= 340) return l < 0.35 ? 'Vino' : l > 0.62 ? 'Rosa' : 'Rojo'
  if (h < 40) return l < 0.38 ? 'Carey' : l > 0.62 ? 'Nude' : 'Miel'
  if (h < 65) return l > 0.55 ? 'Dorado claro' : 'Dorado'
  if (h < 170) return 'Verde'
  if (h < 250) return l > 0.6 ? 'Azul claro' : 'Azul'
  if (h < 290) return 'Lila'
  return l > 0.6 ? 'Rosa' : 'Fucsia'
}

async function processImage(id) {
  const file = `${SRC}/${id}.jpg`
  // trim usa el píxel de la esquina como fondo (sirve para fondos blancos o grisáceos)
  const trimmed = await sharp(file).trim({ threshold: 18 }).toBuffer({ resolveWithObject: true })
  const { width, height } = trimmed.info
  const padX = Math.round(width * 0.08)
  const padY = Math.round(height * 0.18)
  const base = sharp(trimmed.data)
    .extend({ top: padY, bottom: padY, left: padX, right: padX, background: '#ffffff' })
    .flatten({ background: '#ffffff' })
  const buf = await base.toBuffer()
  // Lienzo 2:1 para que todas las cards tengan la misma proporción
  await sharp(buf).resize(800, 400, { fit: 'contain', background: '#ffffff' }).webp({ quality: 80 }).toFile(`${OUT}/${id}.webp`)
  await sharp(buf).resize(400, 200, { fit: 'contain', background: '#ffffff' }).webp({ quality: 78 }).toFile(`${OUT}/${id}-400.webp`)

  // Color del marco: tono representativo del cuerpo de la montura (percentil 35 de luminancia
  // entre los píxeles no-blancos). El promedio simple se aclaraba por los bordes suavizados.
  const { data, info } = await sharp(trimmed.data).resize(200).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const px = []
  for (let i = 0; i < info.width * info.height; i++) {
    const R = data[i * 3],
      G = data[i * 3 + 1],
      B = data[i * 3 + 2]
    if (255 * 3 - (R + G + B) > 120) px.push([R, G, B, 0.2126 * R + 0.7152 * G + 0.0722 * B])
  }
  px.sort((p, q) => p[3] - q[3])
  // Promedio de una ventana alrededor del percentil 35 para evitar ruido
  const at = (f) => Math.floor(px.length * f)
  const win = px.slice(at(0.25), Math.max(at(0.45), at(0.25) + 1))
  const avg = win.length ? [0, 1, 2].map((c) => Math.round(win.reduce((s, p) => s + p[c], 0) / win.length)) : [150, 150, 150]
  const clear = px.length < info.width * info.height * 0.06 && avg.reduce((s, v) => s + v, 0) / 3 > 140
  const hex = '#' + avg.map((v) => v.toString(16).padStart(2, '0')).join('')
  const name = COLOR_OVERRIDES[id] ?? (clear ? 'Cristal' : colorName(avg))
  return { swatch: COLOR_HEX[name] ?? hex, color: name }
}

;(async () => {
  const { productos } = JSON.parse(fs.readFileSync(`${SRC}/catalog.json`, 'utf8'))
  const models = new Map()
  const skipped = []

  for (const p of productos) {
    if (!fs.existsSync(`${SRC}/${p.id}.jpg`)) {
      skipped.push(p.id)
      continue
    }
    const { swatch, color } = await processImage(p.id)
    const key = slug(p.nombre)
    if (!models.has(key)) {
      models.set(key, { id: key, name: p.nombre, category: CATEGORY_IDS[p.categoria] ?? 'clasicas', featured: false, variants: [] })
    }
    const m = models.get(key)
    m.featured ||= !!p.destacado
    // Evita nombres de color repetidos dentro del mismo modelo
    const same = m.variants.filter((v) => v.color === color || (v.color.startsWith(`${color} `) && /\d$/.test(v.color))).length
    m.variants.push({
      id: p.id,
      color: same ? `${color} ${same + 1}` : color,
      swatch,
      price: Number(String(p.precio).replace(/[^0-9.]/g, '')),
      image: `/products/${p.id}`,
      tryOnUrl: p.simuladorUrl,
      url360: p.url360,
    })
  }

  const list = [...models.values()]
  const out = `// Generado por scripts/import-catalog.cjs desde el catálogo del cliente. No editar a mano:
// cambia assets-src/catalogo/catalog.json (o las fotos) y vuelve a correr el script.
import type { Product } from './products'

export const catalog: Product[] = ${JSON.stringify(list, null, 2)}
`
  fs.writeFileSync('src/data/catalog.generated.ts', out)
  console.log(
    `${list.length} modelos, ${list.reduce((n, m) => n + m.variants.length, 0)} variantes. Sin foto: ${skipped.join(', ') || 'ninguno'}`,
  )
})()
