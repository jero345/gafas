// Vectoriza el logosímbolo VYSE (PNG del cliente) a paths SVG: texto y símbolo por separado.
// Uso: node scripts/trace-logo.cjs  → escribe src/components/ui/logo-paths.ts y public/favicon.svg
const sharp = require('sharp')
const potrace = require('potrace')
const fs = require('fs')

const SRC = 'assets-src/logos/LOGOSIMBOLO/VYSE LOGOSIMBOLO 1.png'
// Cajas medidas sobre el PNG de 3000×2190
const TEXT = { left: 456, top: 1072, width: 2215 - 456 + 1, height: 1537 - 1072 + 1 }
const SYMBOL = { left: 2216, top: 652, width: 2701 - 2216 + 1, height: 1138 - 652 + 1 }

async function trace(box) {
  const png = await sharp(SRC).extract(box).flatten({ background: '#ffffff' }).png().toBuffer()
  return new Promise((resolve, reject) =>
    potrace.trace(png, { threshold: 128, turdSize: 20, optTolerance: 0.4 }, (err, svg) => {
      if (err) return reject(err)
      resolve(svg.match(/ d="([^"]+)"/)[1])
    }),
  )
}

;(async () => {
  const text = await trace(TEXT)
  const symbol = await trace(SYMBOL)
  const out = `// Generado por scripts/trace-logo.cjs a partir del logosímbolo del cliente. No editar a mano.
// Coordenadas en píxeles del PNG original; el símbolo va desplazado respecto al texto.
export const LOGO = {
  text: { d: '${text}', width: ${TEXT.width}, height: ${TEXT.height} },
  symbol: { d: '${symbol}', width: ${SYMBOL.width}, height: ${SYMBOL.height} },
  /** Posición del símbolo relativa a la esquina superior izquierda del texto */
  symbolOffset: { x: ${SYMBOL.left - TEXT.left}, y: ${SYMBOL.top - TEXT.top} },
} as const
`
  fs.writeFileSync('src/components/ui/logo-paths.ts', out)

  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 ${SYMBOL.width + 60} ${SYMBOL.height + 60}">
  <style>path{fill:#111}@media (prefers-color-scheme:dark){path{fill:#ececea}}</style>
  <path d="${symbol}"/>
</svg>
`
  fs.writeFileSync('public/favicon.svg', favicon)
  console.log('text path', text.length, 'chars · symbol path', symbol.length, 'chars')
})()
