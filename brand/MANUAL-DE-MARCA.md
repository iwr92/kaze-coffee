Kaze (風, "viento" en japonés) es una tienda online de café de especialidad en grano y prensas francesas. La marca habla con calma, se ve sobria y deja que el café sea el protagonista: crema y negro, mucho aire, tipografía con carácter.

## Esencia

- **Idea central:** el viento trae el aroma antes que la taza. Kaze vende café que se siente antes de probarlo.
- **Personalidad:** sereno, preciso, cálido. Nunca ruidoso, nunca pretencioso.
- **Tagline:** *Café de especialidad, a tu ritmo.*
- **Promesa:** granos de origen trazable, tostados en pequeños lotes y enviados frescos.

## Voz y tono

- Hablá de vos al cliente, en español rioplatense, con frases cortas. Ejemplo: "Tostado el martes, en tu casa el jueves."
- Describí el café con sensaciones concretas (chocolate amargo, mandarina, panela), no con superlativos ("el mejor café del mundo").
- Títulos en oración normal (solo la primera mayúscula). Las etiquetas pequeñas van en MAYÚSCULAS con el estilo `label`.
- Sin emojis en web, packaging ni redes de marca. Un signo de exclamación por pieza, como máximo.
- El kanji 風 puede acompañar al nombre como firma, nunca como decoración repetida.

## Logo

- **Isotipo:** un grano de café cuyo surco es una ráfaga de viento. Usá `kaze-isotipo-negro` sobre `crema` y `kaze-isotipo-crema` sobre `negro`.
- **Logotipo:** KAZE con letras geométricas propias. La A sin travesaño evoca una montaña y la E son tres líneas de viento. No se reescribe con ninguna tipografía.
- **Firmas:** `kaze-firma-horizontal-*` para web, encabezados y bolsas anchas; `kaze-firma-vertical-*` para packaging, sellos y redes.
- **Área de resguardo:** dejá libre alrededor del logo como mínimo la altura del isotipo dividida por dos.
- **Tamaño mínimo:** logotipo de 72 px de ancho en pantalla (20 mm impreso); isotipo de 16 px (6 mm).
- **No hacer:** no lo estires, no lo rotes, no le agregues sombras ni degradados, no lo pongas en `tostado` ni sobre fotos con mucho detalle. Solo dos tintas: `negro` o `crema`.

## Color

La marca es bicolor. `crema` y `negro` cubren el 90 % de cualquier pieza; `tostado` es un acento que aparece poco.

- Usá `surface` como fondo general y `surface-raised` para tarjetas y bloques destacados.
- Escribí con `ink`; los textos secundarios con `ink-muted`.
- Reservá `accent` (tostado) para precios, notas de cata y enlaces. Nunca como fondo grande ni para el logo.
- Los botones principales van con fondo `ink` y texto `on-ink`.
- Para piezas de alto impacto (portada de redes, bolsa edición especial) invertí todo con el tema **Negro**: fondo `negro`, texto `crema`.
- `line` es solo para divisores; los bordes de campos de formulario usan `ink-muted` para llegar a 3:1.
- El anillo de foco es `focus`, de 2 px sólido, con 2 px de separación.

## Tipografía

Dos familias de Google Fonts:

- **Shippori Mincho B1** (familia `display`): títulos y nombres de café. Es una mincho japonesa con latinas elegantes y soporta el kanji 風.
- **Instrument Sans** (familia `sans`): textos, interfaz, precios y etiquetas.

Cargalas así:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Shippori+Mincho+B1:wght@500;600;700&display=swap">
```

- `display-xl` solo para la portada o el hero de la home, una vez por página.
- `display` para títulos de sección y `titulo` para nombres de producto.
- `body` es el texto por defecto; `body-lg` para introducciones.
- `label` siempre en mayúsculas (text-transform: uppercase) para origen, proceso y categorías.
- Nunca más de tres tamaños distintos en una misma pieza.

## Espacio y forma

- La marca respira: preferí `space-12` y `space-16` entre secciones antes que agregar líneas o cajas.
- Las esquinas son rectas (`radius-0`) o casi rectas (`radius-sm`). Solo los chips de filtro usan `radius-pill`.
- Sin sombras. La profundidad se logra con `surface-raised` o invirtiendo a negro.

## Imagen

- Fotos de producto sobre fondo `crema` liso, luz natural lateral, sombras suaves.
- Fotos de paisaje (montaña, niebla, bosque) en blanco y negro o desaturadas, para reforzar la idea de viento.
- Evitá stock con tazas de latte art genérico.

## Aplicaciones

- **Bolsa de café:** bolsa kraft o negra mate con etiqueta `Etiqueta`. Datos fijos: origen, proceso, altura, notas, fecha de tueste y peso.
- **Tienda online:** fondo `surface`, tarjetas `TarjetaProducto`, botones `Boton`.
- **Prensa francesa:** grabado del isotipo en la tapa, nunca el logotipo completo.
