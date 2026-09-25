# VYSE — Landing + tienda de prueba virtual de gafas

Vite · React · TypeScript · Tailwind v4 · Motion · GSAP/ScrollTrigger · Lenis · vaul · sonner · Zustand · zod

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + build de producción en /dist
npm run preview    # sirve /dist
```

## Cambiar el número de WhatsApp

Edita `.env` (usa `.env.example` como plantilla):

```
VITE_WHATSAPP_NUMBER=573001234567
```

Formato internacional **sin `+` ni espacios** (Colombia = `57` + número). Reinicia `npm run dev` o vuelve a hacer build: Vite lee el `.env` al arrancar.

Los mensajes están en `src/lib/whatsapp.ts` (demo, cita, planes) y `src/lib/checkout.ts` (pedido).

## Catálogo de productos

El catálogo es el real del cliente: sale de `optica.johnbecerra.dev/mocks/catalog.json` y de sus fotos. Está guardado en `assets-src/catalogo/`: el JSON y un `.jpg` por producto.

```bash
node scripts/import-catalog.cjs
```

El script hace esto:

1. Recorta cada foto al contorno de la montura y la exporta a `public/products/{id}.webp` (800 px) y `{id}-400.webp`.
2. Agrupa los productos con el mismo nombre como **variantes de color** de un modelo. Por ejemplo, las 7 "Vyse Shield Sport" quedan como una card con 7 colores.
3. Escribe `src/data/catalog.generated.ts`. Ese archivo no se edita a mano.

**Agregar o cambiar un producto:**

1. Actualiza `assets-src/catalogo/catalog.json` y pon la foto como `assets-src/catalogo/{id}.jpg`.
2. Agrega el nombre del color en `COLOR_OVERRIDES`, dentro de `scripts/import-catalog.cjs`. Los colores se nombraron revisando cada foto; si falta, el script calcula uno aproximado.
3. Corre el script.

Cada variante tiene `tryOnUrl` y `url360`, los links al probador virtual de VYSE, y el quick view los usa. `m61` no tiene foto porque da 404 también en el sitio del cliente.

**Moneda:** el catálogo del cliente trae los precios en dólares ("$85.00"), así que la tienda muestra USD. Para vender en pesos cambia `STORE` en `src/data/products.ts` a `{ currency: 'COP', locale: 'es-CO', decimals: 0 }` y actualiza los precios. El mensaje de WhatsApp usa la misma moneda.

Para agregar una categoría, súmala al tipo `Category` y al arreglo `categories` de `src/data/products.ts`, y a `CATEGORY_IDS` del script.

## Marca: logo y tipografía

- **Logo:** vectorizado desde los PNG del cliente (`assets-src/logos/`) con `node scripts/trace-logo.cjs`. El script genera `src/components/ui/logo-paths.ts` y `public/favicon.svg`. El componente `Logo` hereda el color del texto y su símbolo gira al cargar y en hover.
- **Tipografía:** F37 Bolton, la que mandó el cliente en el Drive. Está en `public/fonts/F37Bolton-VF.woff2`: es la versión variable (pesos 20 a 900) con subset latino, sin eje de itálica. El original queda en `assets-src/fonts/`. **F37 Bolton es una fuente comercial:** confirma que el cliente tenga licencia **web** antes de publicar.

Los planes están en `src/data/plans.ts`; los pasos, testimonios y FAQ en `src/data/content.ts`.

## Conectar una pasarela de pagos

El checkout depende de la interfaz `CheckoutProvider` en `src/lib/checkout.ts`:

```ts
interface CheckoutProvider {
  checkout(order: Order): Promise<void>
}
```

- `WhatsAppCheckoutProvider`: el proveedor activo. Abre `wa.me` con el pedido.
- `PaymentGatewayCheckoutProvider`: stub listo. Hace `POST /api/checkout` con el `Order` y redirige a `redirectUrl`.

Pasos:

1. Crea en tu backend (Wompi, Mercado Pago, ePayco, Stripe…) un endpoint que reciba el `Order`, cree la transacción y responda `{ "redirectUrl": "https://..." }`. **No calcules el total en el cliente**: recalcula los precios en el servidor.
2. En `src/lib/checkout.ts` cambia la última línea:
   ```ts
   export const checkoutProvider: CheckoutProvider = new PaymentGatewayCheckoutProvider('https://tu-api.com/checkout')
   ```
3. Si quieres ofrecer ambas opciones, instancia los dos proveedores y elige uno según un botón del carrito (`src/components/sections/Cart.tsx`).

## Tracking

`src/lib/tracking.ts` llama a `window.fbq?.('track', …)` y hace `dataLayer.push` en `AddToCart`, `InitiateCheckout` (pedido) y `Lead` (planes). Pega los snippets de Meta Pixel y GTM en `index.html` y los eventos empezarán a registrarse.

## Cambiar imágenes

Los originales están en `IMAGENES-…/IMAGENES`. Se exportan a webp en dos tamaños con sharp, para que el navegador elija el más liviano (`srcset`):

- **Retratos del hero:** 720×900 y 400×500, recortados 4:5 desde arriba.
- **Gafas:** fondo transparente recortado (`trim`), a 1200 y 600 px de ancho.

Si reemplazas una foto, expórtala con los mismos nombres y tamaños.

## Carrusel circular del hero

Los retratos giran de forma continua sobre una rueda en `src/components/sections/PortraitFan.tsx`. Constantes principales:

- `RADIUS` y `STEP_DEG`: tamaño de la rueda y separación entre tarjetas.
- `SPEED`: velocidad de giro, en retratos por segundo.

Comportamiento:

- Al pasar el cursor frena suave hasta detenerse y al salir retoma.
- Se pausa cuando no está en pantalla.
- Se puede arrastrar para girarla, y tocar una tarjeta lateral la trae al centro.
- Con reduced motion queda quieta.

## Estructura

```
src/
  components/sections/  Navbar, Hero, PortraitFan, Showcase, Pricing, HowItWorks, Shop, Cart, Testimonials, FAQ, Footer
  components/ui/        PillButton, Logo (+ logo-paths), AnimatedNumber, Magnetic, Reveal
  hooks/                useMedia (reduced motion / pointer fino), useTilt
  lib/                  cart (Zustand), checkout, whatsapp, tracking, fly-to-cart, smooth-scroll, use-gsap, motion
  data/                 products (+ catalog.generated), plans, content
scripts/                import-catalog.cjs, trace-logo.cjs
assets-src/             originales: catálogo del cliente, logos, fuente
public/portraits/N.webp (720w) y N-400.webp  retratos del hero (1-5)
public/frames/sun|optical|duo(.webp, -600.webp)  gafas del showcase
public/products/{id}.webp, {id}-400.webp           fotos del catálogo
```

## Notas de animación

- Curvas propias (`--ease-out: cubic-bezier(0.23,1,0.32,1)`, etc.) en `src/index.css` y `src/lib/motion.ts`. La UI dura entre 150 y 300 ms; las secuencias de scroll duran más.
- Se anima solo `transform`/`opacity`. Las excepciones son la altura del FAQ (lo pide el diseño), el shimmer del gradiente (`background-position` en un texto pequeño) y el blur de los retratos en hover.
- `prefers-reduced-motion`: sin Lenis, parallax, tilt, pin, marquee, shimmer ni pulso. Solo quedan fades.
- En touch (`hover: none` / `pointer: coarse`) se desactivan el tilt, el botón magnético y el borde que sigue al cursor.
- GSAP, Lenis y el carrito (vaul + zod) se cargan en diferido para no bloquear el primer render.
