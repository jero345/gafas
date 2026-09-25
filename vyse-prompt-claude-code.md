# ROL
Eres un design engineer senior especializado en interfaces premium y animación web.
Vas a construir la landing + tienda de VYSE, una plataforma de prueba virtual de gafas.

# PASO 0 — INSTALAR SKILL (obligatorio antes de escribir código)
1. Ejecuta: `npx skills add emilkowalski/skill`
2. Lee completo el SKILL.md instalado y aplica sus principios de animación, easing,
   timing y craft de UI en TODO el proyecto. Si algo de este prompt contradice la skill
   en temas de calidad de animación, gana la skill.
3. Confírmame en 3 bullets qué principios de la skill vas a aplicar.

# PASO 1 — REFERENCIA VISUAL
Adjunto un PDF con 2 mockups (hero desktop + versión larga con pricing). Replícalo con
fidelidad alta:
- Fondo: #ECECEA (gris cálido). Texto: #111111. Tarjetas: #F5F4F1.
- Acento: gradiente lavanda #D9CCE3 → #A78AB5, usado en "gafas online" y "pide tu demo",
  con subrayado fino del mismo tono.
- Tipografía: grotesca ultraligera (Inter Tight 200/300 o Geist Light) con titulares
  enormes, tracking negativo y mucho aire.
- Botones píldora con borde de 1px y un círculo negro con flecha ↗ a la derecha.
  Existen variantes outline y filled.
- Logo "VYSE" con el asterisco/destello arriba a la derecha (hazlo en SVG).

# STACK
- Vite + React + TypeScript + Tailwind CSS
- `motion` (Framer Motion) para las animaciones de componentes y layout
- GSAP + ScrollTrigger para las secuencias ligadas al scroll
- Lenis para smooth scroll
- `vaul` para el drawer del carrito en móvil y `sonner` para los toasts
- Zustand para el carrito, persistido en localStorage
- Sin backend: catálogo y planes viven en `/src/data/*.ts`

# ESTRUCTURA DE LA WEB
1. **Navbar** fija con blur al hacer scroll y se esconde al bajar. Enlaces: Nosotros,
   Soporte, Precios, Tienda, Contacto. CTAs: "Pide un Demo" y "Agenda una cita".
   Incluye un icono de carrito con badge de cantidad que rebota al agregar un producto.
2. **Hero**
   - El titular entra palabra por palabra (máscara + translateY, stagger).
   - El texto en gradiente hace un shimmer lento en loop.
   - Abanico de 5 retratos inclinados: entran desde abajo con rotación, tienen tilt 3D
     con el mouse y parallax con el scroll. Los laterales tienen blur y la tarjeta
     central queda nítida y con sombra. En hover, la tarjeta se endereza y pierde el blur.
   - Usa placeholders para las imágenes en `/public/portraits/1-5.webp`.
3. **Showcase de gafas** (segundo mockup)
   - Dos monturas en PNG flotando con rotación ligada al scroll (GSAP scrub).
   - Botón "Pide un Demo" magnético.
4. **Cómo funciona**: 3 pasos (Sube tu catálogo → Prueba virtual → Vende más).
   Sección pinned con progreso animado.
5. **Pricing**
   - Toggle segmentado Individual / Team & Enterprise / API, con indicador que se
     desliza (layoutId).
   - Tarjetas Lite / Pro / Max con reveal escalonado, tilt suave y borde que se ilumina
     siguiendo el cursor.
   - Cada plan tiene el botón "Contratar por WhatsApp" (ver lógica abajo).
   - Copia los textos exactos del mockup.
6. **Tienda / Catálogo de monturas** (sección de compras)
   - Grid filtrable por categoría (Sol, Oftálmicas, Edición limitada) con transiciones
     de layout animadas al filtrar.
   - Cada card muestra imagen, nombre, precio en COP, selector de color y botón
     "Agregar". En hover, la imagen de la montura rota y cambia de color.
   - Quick view en modal con shared layout animation desde la card.
   - Animación "fly to cart": una miniatura vuela desde la card hasta el icono del
     carrito, y luego aparece un toast de sonner.
   - Crea 8 productos mock en `/src/data/products.ts`.
7. **Carrito**
   - Drawer lateral en desktop y vaul bottom sheet en móvil.
   - Permite editar cantidades con números animados (count up/down) y eliminar ítems
     con animación de salida.
   - Muestra subtotal animado.
   - Formulario corto con nombre, ciudad y dirección, validado con zod.
   - Botón "Finalizar pedido por WhatsApp".
8. **Testimonios**: marquee infinito que se pausa en hover.
9. **FAQ**: acordeón con altura animada.
10. **CTA final + Footer**, con un botón flotante de WhatsApp que tiene un pulso sutil.

# LÓGICA DE COMPRA POR WHATSAPP
- Número en `.env` → `VITE_WHATSAPP_NUMBER` (formato internacional, sin +).
- Crea `/src/lib/checkout.ts` con la interfaz
  `CheckoutProvider { checkout(order): Promise<void> }`.
  Implementa `WhatsAppCheckoutProvider` y deja preparado
  `PaymentGatewayCheckoutProvider` (stub) para conectar una pasarela después.
- Genera un ID de pedido con el formato `VY-YYMMDD-XXXX`.
- El mensaje se construye con `encodeURIComponent` y se abre
  `https://wa.me/{numero}?text=...` en una pestaña nueva. Formato del mensaje:

  ```
  Hola VYSE 👋 Quiero hacer este pedido:
  Pedido: VY-260924-A1B2
  • 2x Montura Aura (Negro) — $360.000
  • 1x Montura Lumen (Carey) — $210.000
  Total: $570.000 COP
  Nombre: ... | Ciudad: ... | Dirección: ...
  ```

- Para los planes, el mensaje es: "Hola, quiero contratar el plan {Plan} ({modalidad})".
- Después de enviar, muestra una pantalla de confirmación animada (check dibujado con
  pathLength) y vacía el carrito.
- Deja hooks listos para tracking: `window.fbq?.('track','InitiateCheckout')` y
  `dataLayer.push`.

# REGLAS DE ANIMACIÓN
- Quiero una web muy animada pero premium, nunca recargada. Todo debe correr a 60fps.
- Anima solo `transform` y `opacity`. Usa `will-change` con criterio.
- Easing personalizado (nada de linear) y duraciones cortas para la UI (150–300ms).
  Las secuencias de scroll pueden ser más largas.
- Respeta `prefers-reduced-motion`: desactiva parallax, tilt y marquee y deja solo fades.
- Desactiva en touch los efectos que dependen del cursor (tilt, magnético, borde que
  sigue el mouse).
- Micro-interacciones en todos los botones: press scale 0.97 y hover con la flecha
  que se desplaza.

# CALIDAD
- Mobile first. Revisa los breakpoints 375, 768, 1280 y 1920.
- Lighthouse ≥ 90 en performance y accesibilidad. Imágenes en webp con lazy loading.
- Accesibilidad: foco visible, aria en el drawer y el modal, contraste AA en textos.
- SEO: meta tags, Open Graph y JSON-LD de Organization + Product.
- Código modular en `/components/sections`, `/components/ui`, `/lib`, `/data`.
- Al terminar, entrega un README con cómo cambiar el número de WhatsApp, cómo
  agregar productos y cómo conectar una pasarela.

# FORMA DE TRABAJO
1. Instala la skill y resume sus principios.
2. Propón la estructura de carpetas y los tokens de diseño.
3. Construye sección por sección y muéstrame cada una antes de seguir.
4. Termina con una QA de animaciones en móvil.
