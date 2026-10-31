# KAZE V4: Editorial Commerce

Fecha: 2026-10-28. Primera entrega: hero refinado, Product Showcase y "A tu manera".

El motor cinematográfico no se tocó: secuencias `seq-hq/`, pipeline, caché, carga adaptativa y reversibilidad. Sus archivos tienen fecha anterior a la V4.

Las secciones de la V3 quedaron archivadas y recuperables en `archive/v3-editorial/`.

## Principio

Vendemos café. El hero presenta la marca y en un clic ("Explorar cafés") lleva a la oferta. El recorrido completo del hero se acortó de 560 a 400svh.

## Qué se implementó

### Hero (refinamiento)

- **De cuatro titulares gigantes a tres mensajes.**
  - Apertura: titular, propuesta de valor y CTA, más un indicador de scroll discreto.
  - Intermedio: una línea editorial chica, en la zona vacía del video.
  - Cierre: "Tu momento. Tu café." con el CTA.
- **Escala del titular:** baja a 5,4vw (hasta 6,25rem) para no tapar los granos. En móvil es 12,5vw, con el texto arriba y la imagen abajo.
- **CTAs:** todos llevan a `#cafes` sin pasar por la secuencia.
- **Navegación:** Cafés, A tu manera (solo en desktop) y Tienda.
- **Sobre el video:** un velo perla sutil mantiene legible la navegación. Después del hero, el encabezado pasa a fondo sólido.

### Product Showcase (`#cafes`)

"Descubrí tu próximo café." Un producto protagonista a la vez, nunca una grilla de tarjetas.

- **Imagen grande:** acotada al alto de pantalla, para que imagen, nombre, ficha, precio y compra se vean juntos al llegar.
- **Ficha comercial:**
  - Proveedor y nombre.
  - Variedad o perfil.
  - Peso y molienda.
  - Precio en tostado, como pide el manual.
  - "Comprar en la tienda".
- **Navegación:** botones anterior y siguiente, barra con todos los productos, flechas del teclado, deslizamiento táctil y anuncio para lectores de pantalla.
- **Transición:** la imagen nueva entra con una máscara en la dirección del viento y los textos se reemplazan desde sus máscaras. Con movimiento reducido, el cambio es instantáneo.
- **Compra:** el botón lleva a `product.url` (Tiendanube). Sin esa URL, a la tienda configurada. Sin tienda, a `#tienda`. Nunca a una URL inventada.
- **Cantidad de productos:** funciona con 2 o más, sin cantidad fija.
- **Sin datos reales:** muestra 3 espacios rotulados **"Pendiente de carga"** y un aviso **"Vista de diseño"**. No hay nombres, precios, pesos ni orígenes inventados.

Datos: `src/commerce/products.ts`, con el tipo `Product` (nombre, proveedor, imagen, perfil, peso, moliendas, precio ARS y URL) y la lista `PRODUCTS`, hoy vacía. Para publicar un café hay que agregar su objeto y su foto real en `public/products/`. Más adelante la lista puede llenarse desde la API de Tiendanube sin tocar los componentes.

### A tu manera (`#a-tu-manera`)

- **En grano: disponible.** La fuente es el manual: "tienda online de café de especialidad en grano y prensas francesas".
- **Molido: por confirmar.** No se ofrece hasta que un producto real lo declare. Cuando eso pase, la sección lo muestra sola (`src/config/grind.ts`).
- **Imagen:** una sola fotografía, el grano abriéndose en molienda, que muestra las dos opciones en un mismo cuadro.

### Pie (`#tienda`)

Muestra el estado real de la tienda ("La tienda online abre pronto" o "Ir a la tienda"), la navegación y el logotipo original a todo el ancho.

## Validación

Build aislado, sin tocar el `.next` del proyecto.

- **TypeScript, lint y `next build`:** sin errores.
- **Recorridos en desktop (1440×900) y móvil (390×844)**, con y sin movimiento reducido:
  - El CTA del hero lleva a `#cafes`, que queda alineado bajo el encabezado.
  - El showcase navega 1→2→3→2→3→1 con botones, teclado y barra.
  - La compra apunta a `#tienda`.
  - Molienda: "En grano: Disponible" y "Molido: Por confirmar".
  - Navegación correcta.
  - Sin desborde horizontal y sin errores de consola.
- **Reversibilidad del hero:** el cuadro coincide a la ida y a la vuelta. Móvil: SSIM 0,99999. En desktop, la única diferencia es el balanceo intencional del titular con el puntero.
- **Errores encontrados y corregidos:**
  - El encabezado perdía el fondo al llegar al final de la página.
  - El botón de compra quedaba debajo de la pantalla.
  - En móvil, "Comprar en la tienda" se partía en dos líneas.
- **Capturas:** en `capturas/`.

## Próximas secciones (planificadas, sin implementar)

| Sección | Rol | Composición | Recursos |
|---|---|---|---|
| **The Ritual** | Deseo: el momento de tomarlo en casa. | Fotografía a sangre, de luz natural, con un movimiento sutil (vapor en bucle). Titular corto en el vacío perla. CTA "Explorar cafés". | B1, K1 |
| **The Difference** | Por qué café de especialidad, en tres ideas breves: origen trazable, tueste en pequeños lotes y frescura (promesa del manual). | Macro protagonista a la izquierda, tres bloques cortos a la derecha con filetes, sin íconos. | B2, B3 |
| **Discover KAZE** | Cierre de marca y tienda. | Logotipo monumental, propuesta de valor y CTA a Tiendanube. Puede absorber el pie actual. | Ninguno nuevo |

## Recursos a producir

Pautas comunes a todas las imágenes de Banana:

- Fondo perla `#F7F5F0` liso, salvo indicación.
- Luz natural lateral desde la izquierda, con sombras suaves.
- Sin texto, sin logos, sin bolsas con marca KAZE y sin latte art.
- Mínimo 3000 px en el lado largo, para recortes de 1920 px.

### Fotos de producto (reales; no se generan con Banana)

| Recurso | Uso | Composición y encuadre | Relación | Resolución | Fondo | Luz |
|---|---|---|---|---|---|---|
| **P1** Foto de cada café | Showcase | La bolsa original del proveedor, de frente y centrada, con el 15 % de aire alrededor. Opcional: un puñado de granos al pie. | 4:5 (el área central 1:1 tiene que funcionar sola en móvil) | 2400×3000 | Perla `#F7F5F0` liso | Lateral izquierda, suave, sin reflejos fuertes en el empaque |

### Banana (imagen editorial)

| Recurso | Uso | Composición y encuadre | Relación | Resolución | Fondo | Luz |
|---|---|---|---|---|---|---|
| **B1** Ritual en casa | The Ritual | Taza de vidrio de doble pared con café, sobre una mesa crema, en mañana doméstica y sin rostros. La taza en el tercio derecho, con aire a la izquierda para el titular. | 16:9 (desktop) y 4:5 (móvil, mismo plano) | 3840×2160 / 2400×3000 | Crema `#F3ECDF` con pared perla | Ventana lateral izquierda, cálida, de mañana |
| **B2** Macro del grano tostado | The Difference | Tres o cuatro granos en macro extremo: surco, poros y brillo del aceite. Profundidad de campo corta. | 4:5 | 3000×3750 | Perla | Lateral rasante, para marcar textura |
| **B3** Grano entero y café molido | A tu manera (reemplaza el recorte actual) | Vista cenital: a la izquierda un montón de grano entero, a la derecha uno de molienda media, separados por aire. | 5:4 | 3750×3000 | Perla | Cenital suave con apoyo lateral |
| **B4** Texturas de molienda (opcional) | A tu manera, si se confirman las moliendas | Cuatro muestras cenitales idénticas (fina, fina a media, media, gruesa), cada una en su propio cuadro. | 1:1 cada una | 2000×2000 | Perla | Cenital difusa, idéntica en las cuatro |

### Kling (video)

| Recurso | Uso | Especificación |
|---|---|---|
| **K1** Vapor en bucle | The Ritual | 4–6 s, bucle perfecto, cámara fija. Taza de B1 con vapor sutil. 1080p o más, sin marca de agua. |
| **K2** Clips del hero sin marca de agua | Hero | Volver a exportar los cuatro clips a la máxima resolución del plan (ver la auditoría). |
| **K3** Versiones 9:16 de los clips (opcional) | Hero móvil | El mismo guion y continuidad, encuadre vertical nativo. |

## Para revisar

- **Textos nuevos:**
  - "Del grano a la taza".
  - "Elegí el café que va con tu forma de disfrutarlo."
  - "Cada café indica cómo podés recibirlo. Elegilo según cómo lo preparás en casa."
  - "Entero, para molerlo justo antes de preparar y conservar mejor su aroma."
- **Vista de diseño:** el aviso y los espacios pendientes están pensados para revisión. Antes de publicar, cargar productos reales o decidir si la sección se oculta.
- **Marca de agua:** la de Kling sigue en el hero.
