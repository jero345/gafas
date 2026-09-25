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

## Agregar productos

Edita `src/data/products.ts` y añade un objeto al arreglo `products`:

```ts
{
  id: 'sol-nuevo',              // único, sin espacios
  name: 'Montura Sol Nuevo',
  category: 'sol',              // 'sol' | 'oftalmicas' | 'edicion-limitada'
  price: 230000,                // COP, sin puntos
  shape: 'round',               // 'rect' | 'round' | 'square' | 'cat' | 'aviator'
  description: '...',
  colors: [
    { name: 'Negro', frame: '#141414', lens: '#2d2f33' },
    { name: 'Carey', frame: '#8a5a3c', lens: '#5a4636' },
  ],
}
```

Las monturas se dibujan en SVG (`FrameArt`) y se recolorean con `frame`/`lens`, así el cambio de color en hover y el selector funcionan sin fotos. El campo `image` ya está previsto en el tipo `Product` para cuando haya fotos reales en `.webp`.

Para agregar una categoría nueva, súmala al tipo `Category` y al arreglo `categories` del mismo archivo.

Los planes están en `src/data/plans.ts`; los pasos, testimonios y FAQ en `src/data/content.ts`.

## Conectar una pasarela de pagos

El checkout depende de la interfaz `CheckoutProvider` en `src/lib/checkout.ts`:

```ts
interface CheckoutProvider { checkout(order: Order): Promise<void> }
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

## Estructura

```
src/
  components/sections/  Navbar, Hero, Showcase, HowItWorks, Pricing, Shop, Cart, Testimonials, FAQ, Footer
  components/ui/        PillButton, Logo, FrameArt, AnimatedNumber, Magnetic, Reveal
  hooks/                useMedia (reduced motion / pointer fino), useTilt
  lib/                  cart (Zustand), checkout, whatsapp, tracking, fly-to-cart, smooth-scroll, use-gsap, motion
  data/                 products, plans, content
public/portraits/N.webp (720w) y N-400.webp  retratos del hero (1-5)
public/frames/sun|optical|duo(.webp, -600.webp)  gafas del showcase
```

## Notas de animación

- Curvas propias (`--ease-out: cubic-bezier(0.23,1,0.32,1)`, etc.) en `src/index.css` y `src/lib/motion.ts`. La UI dura entre 150 y 300 ms; las secuencias de scroll duran más.
- Se anima solo `transform`/`opacity`. Las excepciones son la altura del FAQ (lo pide el diseño), el shimmer del gradiente (`background-position` en un texto pequeño) y el blur de los retratos en hover.
- `prefers-reduced-motion`: sin Lenis, parallax, tilt, pin, marquee, shimmer ni pulso. Solo quedan fades.
- En touch (`hover: none` / `pointer: coarse`) se desactivan el tilt, el botón magnético y el borde que sigue al cursor.
- GSAP, Lenis y el carrito (vaul + zod) se cargan en diferido para no bloquear el primer render.
