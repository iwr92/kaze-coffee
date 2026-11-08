# KAZE EN CASA: bebidas preparadas

Sección de campaña entre el hero y la franja de beneficios (`#en-casa`). Vende bebidas calientes y frías por **PedidosYa y WhatsApp**. Nunca envía a WooCommerce.

Punto de recuperación previo: tag de git `pre-kaze-en-casa-2026-11-08`.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `src/commerce/drinks.ts` | Catálogo de bebidas, paleta y temas HOT / ICED. Única fuente de datos. |
| `src/config/channels.ts` | Canales de pedido (variables de entorno) y armado de enlaces. |
| `src/components/sections/KazeEnCasa.tsx` | Sección, selector y coreografía GSAP. |
| `src/styles/en-casa.css` | Estilos, todos acotados a `.ec`. |
| `public/drinks/` | Fotografías de las bebidas (fase 2). |

## Estado: fase 1

- Las 9 bebidas del brief están cargadas: 6 protagonistas (3 HOT y 3 ICED) y Espresso, Americano y Latte como "También".
- **No hay precios, tamaños, ingredientes, horarios, cobertura ni promociones.** Las descripciones son textos de campaña que solo se apoyan en el nombre de cada bebida. Reemplazarlas cuando estén las recetas reales.
- **Fotografías:** las seis protagonistas tienen foto (ver la tabla de fase 2). Si una bebida queda con `image: null`, muestra un placeholder rotulado "Foto pendiente".
- **Los canales no están configurados.** Los dos botones se ven como "Canal en preparación", junto con la nota "Estamos habilitando los pedidos por PedidosYa y WhatsApp". No se afirma que se pueda pedir.

## Habilitar los pedidos

Definir en Vercel (Production) y volver a desplegar:

```
NEXT_PUBLIC_KAZE_PEDIDOSYA_URL=https://www.pedidosya.com.ar/...   # URL https de la tienda en PedidosYa
NEXT_PUBLIC_KAZE_WHATSAPP_NUMBER=549XXXXXXXXXX                     # internacional, solo dígitos
NEXT_PUBLIC_KAZE_DELIVERY_NOTE=Texto breve de zona de entrega        # opcional, solo si está confirmado
```

- La URL de PedidosYa se valida: tiene que ser https y de `pedidosya.com` o `pedidosya.com.ar`. Si no, el canal queda "en preparación".
- WhatsApp abre `wa.me` con un mensaje editable que nombra la bebida elegida ("Hola KAZE, quiero pedir un Cappuccino.").
- Cada canal se habilita por separado.

## Fase 2: fotografías

Guardar cada foto en `public/drinks/` con el nombre de la tabla y completar `image` en `drinks.ts`:

```ts
image: { src: "/drinks/cappuccino.webp", alt: "Cappuccino de KAZE en taza ...", width: 1600, height: 2000 },
```

| Bebida | Archivo | Original | Estado |
|---|---|---|---|
| Cappuccino | `cappuccino.webp` | `public/drinks/8.png` | Integrada (provisoria: la espuma es un punto chico, se lee más como macchiato) |
| Vanilla Latte | `vanilla-latte.webp` | `public/drinks/6.png` | Integrada (provisoria: casi idéntica a 5.png y sin leche visible) |
| Hot Mocha | `hot-mocha.webp` | `public/drinks/4.png` | Integrada |
| Iced Latte | `iced-latte.webp` | `public/drinks/2.png` | Integrada |
| Iced Vanilla Latte | `iced-vanilla-latte.webp` | `media-src/drinks/iced-vanilla-latte.png` | Integrada (vaso distinto, más angosto y con sorbete negro) |
| Iced Mocha | `iced-mocha.webp` | `public/drinks/3.png` | Integrada |
| Latte | `latte.webp` | `public/drinks/5.png` | Cargada en datos; "También" no muestra foto |
| Americano | `americano.webp` | `public/drinks/7.png` | Cargada en datos; "También" no muestra foto |
| Espresso | `espresso.webp` | — | Pendiente (opcional) |
| (Iced Americano) | — | `public/drinks/1.png` | Sin usar: la bebida no está en el menú |

Recomendaciones para las fotos:

- Bebidas reales de KAZE. Nada de fotos de stock ni de productos de terceros.
- Recipiente aislado: fondo transparente (WebP con alfa) o un fondo liso controlado. La escena pone el color y el halo detrás.
- Formato vertical 4:5, al menos 1600 × 2000 px. WebP de calidad 80 a 85, idealmente por debajo de 300 KB.
- Mismo encuadre, altura del recipiente y luz en las seis, para que el crossfade no salte.
- El mocha, solo con lo que lleva realmente (sin virutas si no las tiene).

Proceso usado con el Iced Vanilla Latte (repetir igual con las demás):

1. Verificar el alfa del PNG: esquinas en 0 y recorte sin halo de fondo.
2. Convertir a WebP con calidad 85 y `alphaQuality` 100 (sharp). No se nota diferencia visible y pesa un 94 % menos.
3. Guardar el WebP en `public/drinks/` y el PNG original en `media-src/drinks/`, que no se publica.
4. Normalizar el encuadre (desde la segunda tanda): recortar al contenido y recolocar en un lienzo 1080 × 1350 con la base del vaso al 87,5 % de la altura, centrado. Vasos HOT al 62 % de alto, ICED sin sorbete al 70 %. Así todas comparten escala, sombra y crossfade sin tocar el CSS.
5. Completar `image` en `drinks.ts`. Con foto, la capa usa `.ec-layer-photo`: crece por fuera de la caja del placeholder y suma una sombra de apoyo, una sombra proyectada y un filo crema mínimo.

Con las fotos, revisar escala (`.ec-product`), la posición del vapor y el hielo (`.ec-fx`, coordenadas en un lienzo de 600 × 800) y la intensidad del halo.

## Movimiento

- **Entrada:** un iris borgoña se abre sobre el perla con el scroll (reversible). Después entran el eyebrow, el titular por máscaras, la bebida con escala y profundidad, y el selector.
- **Selector:** cambia la bebida (crossfade direccional), el color ambiental (interpolación de variables CSS), la palabra monumental, el nombre y la descripción (máscaras), el vapor o el hielo (DrawSVG) y el indicador (desliza y se estira).
- **Profundidad:** cada plano se desplaza a su velocidad con el scroll. Con mouse en escritorio, también sigue al puntero.
- **Salida:** una ola perla sube y entrega la página a la franja siguiente (reversible).
- **Movimiento reducido o sin JS:** sin animaciones, todo visible. El selector funciona igual.
- Sin scroll-jacking ni pins. Todos los ScrollTrigger viven en un `gsap.matchMedia` con alcance a la sección y se revierten al desmontar.

## Accesibilidad

- El selector es un `tablist` con flechas, Inicio y Fin, foco visible y tabindex itinerante.
- Las protagonistas son botones con `aria-pressed`.
- Un anuncio `aria-live` informa la bebida elegida.
- Lo que no está activo queda oculto para lectores de pantalla (`aria-hidden` / `inert`).
