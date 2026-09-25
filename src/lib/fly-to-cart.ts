/**
 * Clona el elemento de origen y lo hace volar (WAAPI: solo transform + opacity) hasta el icono del carrito.
 * Resuelve cuando la miniatura aterriza.
 */
export function flyToCart(source: Element | null): Promise<void> {
  const target = document.getElementById('cart-icon')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!source || !target || reduce) return Promise.resolve()

  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  // El navbar puede estar volviendo a entrar (translateY); apuntamos a su posición final
  const toX = to.left + to.width / 2
  const toY = Math.max(to.top + to.height / 2, 44)

  const size = Math.min(from.width, 160)
  const clone = source.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  clone.setAttribute('aria-hidden', 'true')
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size * 0.4}px`,
    width: `${size}px`,
    margin: '0',
    zIndex: '60',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  })
  document.body.appendChild(clone)

  const dx = toX - (from.left + from.width / 2)
  const dy = toY - (from.top + from.height / 2)
  // Arco: primero sube un poco, luego cae hacia el carrito
  const anim = clone.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(0.6) rotate(-10deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(-20deg)`, opacity: 0.4 },
    ],
    { duration: 700, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' },
  )
  return anim.finished.then(
    () => clone.remove(),
    () => clone.remove(),
  )
}
