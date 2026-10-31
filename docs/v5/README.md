# KAZE V5: diseño primero, cine después

Fecha: 2026-10-28.

**Base intacta:** el motor cinematográfico (`seq-hq/`, pipeline, caché, variantes y canvas) no se modificó; sus archivos tienen fecha anterior a la V5.

**Punto de recuperación:** la V4 está en `archive/v4-commerce/src/`.

## Dirección

**La web es el héroe; el video es atmósfera.** La página se sostiene sin animación: con movimiento reducido el hero muestra una foto fija y todo lo demás es igual.

- **Gesto central, titulares de dos voces:**
  - Shippori Mincho B1 en peso 800, que es la marca: pesada y editorial.
  - Instrument Sans en cursiva estrecha (eje `wdth` 76–78), que es el ritmo.
  - Como Shippori no tiene cursiva, la segunda voz es Instrument Sans, la otra tipografía oficial.
- **Ritmo de superficies:** perla (hero), crema (colección), perla (A tu manera), perla con foto cálida (Ritual), negro (Diferencia), perla (cierre) y negro (pie).
- **Tostado:** solo en precios, índices, puntos de estado y foco.
- **Curvas:** `kz` (0.22, 1, 0.36, 1) para entradas y `kzInOut` (0.65, 0, 0.35, 1) para cambios de estado. Son las mismas en GSAP (`CustomEase`) y en CSS.
- **Duraciones:** 200 ms en hover, 300–600 ms en cambios de contenido y 600–1100 ms en revelados.

## Secciones

1. **Hero:** composición en dos zonas, 60/40.
   - Zona izquierda:
     - Etiqueta, titular "Un buen café. / *Cambia el ritmo.*" a 118 px en 1440 (clamp de 76 a 132 px) y propuesta de valor.
     - "Explorar cafés" (va a `#cafes`) y "Conocer KAZE" (va a `#kaze`).
     - Datos comerciales: "Café de especialidad en grano · Tienda online en Argentina".
   - Zona derecha: la secuencia, fundida en el perla con máscaras (sin caja) y tres capítulos discretos (Grano, Molienda, Taza).
   - Recorrido de scroll: de 400 a 190svh.
   - En móvil: titular y CTA primero, el café debajo.
2. **Colección (`#cafes`):** "Descubrí tu / *próximo café.*" con introducción sobre perla, y el producto sobre campo crema.
   - Imagen al 58 % del ancho, de hasta 840 px de alto.
   - Índice grande (01 / 03), tostador, nombre a 84 px, perfil, peso, formato, precio grande en tostado y CTA de 58 px.
   - Transiciones con máscara direccional; la ficha se reemplaza desde sus máscaras.
   - Barra de productos con miniaturas y una línea de producto activo.
   - Se navega con flechas, teclado y deslizamiento.
   - Sin productos reales muestra "Próximamente", "Tostador a confirmar", un contorno neutro de bolsa (sin marca) y la nota "Estamos preparando la primera selección". No hay ningún dato inventado.
3. **A tu manera (`#a-tu-manera`):** dos paneles comparables, En grano y Molido.
   - En desktop, el panel activo se expande. La foto pasa de desaturada a color y aparece el detalle con su acción.
   - En móvil son paneles apilados: texto arriba, foto abajo.
   - "En grano: Disponible" está confirmado por el manual. "Molido: Por confirmar" no tiene acción comercial hasta que un producto real lo declare.
4. **Ritual (`#ritual`):** "Tu taza, / *a tu tiempo.*" sobre la fotografía de la taza, fundida en el perla, con parallax sutil. Debajo, tres pasos de preparación con orientación general.
5. **La diferencia (`#kaze`):** tema negro de alto contraste. "Lo que cambia / *en tu taza.*", macro del grano abriéndose y los tres valores de la promesa del manual (origen trazable, pequeños lotes, envío fresco). Sin certificaciones ni atributos inventados.
6. **Cierre (`#tienda`):** el logotipo original a todo el ancho, "Café de especialidad, / *a tu ritmo.*" y el CTA. Sin URL de Tiendanube dice "La tienda online abre pronto".
7. **Pie:** tema negro, con la firma crema (versión indicada por el manual sobre negro), descripción, columnas Tienda y Kaze, estado de la tienda y línea legal mínima. No hay enlaces a páginas o redes que no existen.

**Navegación:**
- Desktop: enlaces con subrayado animado y sección activa (punto tostado).
- Móvil: menú a pantalla completa con enlaces grandes y "Ir a la tienda". Escape lo cierra, el foco entra al menú y el fondo no scrollea.

## Validación

Build aislado, sin tocar el `.next` del proyecto ni servidores existentes.

- TypeScript, lint y `next build` sin errores. Primera carga de JS: 162 kB.
- **Recorridos en desktop (1440×900) y móvil (390×844), con y sin movimiento reducido:**
  - El CTA lleva a `#cafes`.
  - La colección navega 01→02→01→02→03.
  - La compra apunta a `#tienda` (no a una URL inventada).
  - Los paneles cambian.
  - La sección activa se marca.
  - El menú móvil abre y cierra.
  - Sin desborde horizontal y sin errores de consola.
- **Reversibilidad del hero** (SSIM ida contra vuelta): desktop 1,000 y móvil 0,999.
- **Errores encontrados y corregidos:**
  - El titular quedaba invisible: el CSS previo al pintado y GSAP sumaban dos desplazamientos.
  - Los botones revelados quedaban fuera del orden de tabulación (`autoAlpha` → `opacity`).
  - El botón del menú móvil se veía sin texto (una regla de estilo demasiado amplia).
  - Texto sobre los granos en el panel móvil.
  - El titular del hero tocaba el borde en móvil.
- **Capturas:** en `capturas/`.

## Criterios de aprobación

| Pregunta | Respuesta y evidencia |
|---|---|
| ¿Se ve premium sin la animación? | Sí: `capturas/desktop-sin-animacion-hero.png` muestra la misma composición con foto fija. |
| ¿El titular tiene protagonismo? | Sí: 118 px en 1440, en dos voces y ocupando el 60 % del hero. |
| ¿Los productos son el centro comercial? | La estructura sí: es la primera sección, a un clic, con imagen dominante y ficha grande. **Pero sin fotos y datos reales todavía es una vitrina vacía.** Ese es hoy el límite principal. |
| ¿La composición se siente diseñada? | Hay asimetría deliberada (60/40, 7/5, panel expandible) y un sistema tipográfico propio. |
| ¿Las microinteracciones transmiten calidad? | Máscaras direccionales, subrayados que entran y salen, presión en botones y paneles que se expanden, con curvas consistentes. |
| ¿Hay variedad visual? | Siete superficies distintas, incluidos dos bloques negros, y cada sección con una composición propia. |
| ¿Es cómoda de recorrer? | Producto a un clic, hero de 190svh, navegación con sección activa y menú móvil con objetivos grandes. |
| ¿Coincide con KAZE? | Logos originales, tipografías oficiales, paleta del manual y tostado como acento. |
| ¿Parece de alta gama y no una plantilla? | Sin tarjetas repetidas, sin degradados decorativos y sin numeración gratuita: el 01–03 de la colección y de los pasos del ritual son secuencias reales. |

## Para revisar

- **Textos nuevos:**
  - Titular y bajada del hero.
  - "Tienda online en Argentina".
  - Los tres pasos del Ritual: orientación general de preparación.
  - "Lo que cambia en tu taza".
  - "Cada uno llega con la marca y el empaque de su tostador".
- **Imágenes repetidas:** `ruptura-macro` aparece una vez (La diferencia) y las tomas de granos cambian entre secciones. Igual siguen siendo recortes de los mismos cinco keyframes: las fotos de Banana de `docs/v4/README.md` (B1–B4) siguen siendo necesarias para dar variedad real.
- **Marca de agua:** la de Kling sigue en la secuencia del hero.
