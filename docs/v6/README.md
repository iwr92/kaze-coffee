# KAZE V6: motion editorial

Fecha: 2026-10-31.

- **Punto de recuperación:** la V5 está en `archive/v5-design-first/src/`.
- **Motor cinematográfico intacto:** `seq-hq/`, pipeline, caché, variantes y canvas. Sus archivos tienen fecha del 28/10.

## El sistema de movimiento: un solo lenguaje, el viento

Todo el movimiento sale de un mismo vocabulario, en `src/components/motion/`. No hay efectos sueltos.

| Pieza | Qué hace | Dónde |
|---|---|---|
| `KineticTitle` | Titulares partidos en palabras que suben desde su máscara. Accesible: el lector de pantalla lee el texto completo (`aria-label`) y las piezas son `aria-hidden`. Se divide en el servidor, sin saltos de maquetación. | Todos los titulares |
| `Wind` | Ráfagas SVG que se dibujan con el scroll (DrawSVG) y granos SVG que las recorren. La posición de cada grano es una función pura del progreso: reversible. | Hero, colección, cierre |
| `useReveals` | Revelados declarativos: `words`, `mask` (ventana), `wipe` (de izquierda a derecha, atado al scroll), `fade` y `data-parallax`. | Todas las secciones |
| Curvas `kz` y `kzInOut` | Las mismas en GSAP y CSS. Hover 150–250 ms, contenido 300–600 ms, revelados 500–1300 ms. | Todo |

**Herramientas:** GSAP 3.13 ya instalado (ScrollTrigger, DrawSVG, CustomEase), CSS y SVG. No se agregó ninguna librería. La primera carga de JS pasa de 162 a 174 kB.

**Accesibilidad:**
- Con movimiento reducido no se crea ninguna animación y todo se ve en su lugar.
- Los revelados usan `opacity`, no `visibility`, así los botones no salen del orden de tabulación.
- No hay scroll-jacking: nada fija la página salvo el hero de 190svh que ya existía.

## Secciones

1. **Hero:** composición de campaña.
   - **Titular:** "Un buen café. / *Cambia el ritmo.*" a 147 px en 1440 (clamp de 96 a 150 px). La segunda línea se monta sobre el café.
   - **Bajada y CTAs:** en una sola fila, debajo del titular. La línea de datos comerciales queda al pie.
   - **Ráfagas:** nacen al final del titular y viajan hacia el café, por detrás del texto. Los granos las recorren con el scroll mientras la secuencia pasa de grano a molienda y a taza.
   - **Apertura:** palabras, ráfagas que se dibujan, café que se abre con máscara y granos que aparecen.
   - **Móvil:** titular, bajada y CTA primero; el café debajo.
2. **Colección (`#cafes`):**
   - **Entrada tipo telón:** el campo crema se abre con el scroll.
   - **Numeral monumental:** en contorno tostado, detrás del producto. Cambia con máscara y en la dirección de la navegación.
   - **Producto:** la máscara direccional de la imagen y la ficha que se reemplaza desde sus máscaras siguen como en la V5.
   - **Sin productos reales:** se mantienen los estados "Próximamente" y "Tostador a confirmar". No hay nada inventado.
3. **A tu manera (`#a-tu-manera`):**
   - Cada panel es una escena por capas: la foto (capa lenta) y partículas SVG (granos o molienda, capa rápida), cada una con su profundidad.
   - Parallax con el scroll y con el puntero.
   - El panel activo se expande, la foto se descubre con máscara y el contenido aparece por líneas.
   - Funciona con mouse (hover), toque y teclado (pestañas accesibles).
   - "Molido" sigue en "Por confirmar".
4. **Ritual (`#ritual`):**
   - La foto de la taza crece con el scroll, de ventana a casi todo el ancho, sin fijar la página.
   - Vapor SVG en bucle sobre la boca de la taza, que solo corre mientras se ve.
   - "Tu taza, / *a tu tiempo.*" y los tres pasos de preparación.
5. **Descubrí tu café (`#descubri`, nueva):**
   - Se elige una familia de sabor: Frutal, Achocolatado, Floral o Dulce. La cámara se mueve sobre la foto de la corriente hacia la taza (antes sin usar) y las notas se reemplazan.
   - Muestra los productos reales que declaran esa familia (campo `tasteFamilies` en `src/commerce/products.ts`). Hoy no hay ninguno: lo dice y ofrece ver la colección.
   - Las descripciones de cada familia son vocabulario general de cata, no notas de un producto.
6. **Cierre (`#kaze`, `#tienda`):**
   - Una ola crema con borde de viento se retira con el scroll y descubre el negro.
   - Las ráfagas crema se dibujan y el logotipo oficial crema se revela de izquierda a derecha.
   - Tagline, CTA y los tres valores de la promesa del manual. Absorbe la antigua "La diferencia".
7. **Pie:** sigue al cierre en negro, sin corte, con enlaces a todas las secciones.

**Navegación:** un solo indicador se desliza hasta la sección activa (desktop). El menú móvil incluye "Descubrí".

**Fotografías:** cada una se usa una sola vez. La secuencia va en el hero; los macros de grano y molienda, en "A tu manera"; la taza, en Ritual, y la corriente hacia la taza, en Descubrí.

## Validación

Build aislado, sin tocar el `.next` del proyecto ni el `next dev` en curso.

- TypeScript, lint y `next build` sin errores.
- **Recorridos en desktop (1440×900) y móvil (390×844), con y sin movimiento reducido:**
  - El CTA lleva a `#cafes`.
  - La colección navega 01→02→01→02→03 (botones, teclado y barra).
  - La compra apunta a `#tienda`.
  - Los paneles cambian.
  - "Descubrí" marca Floral y muestra el estado vacío.
  - La sección activa se marca y el menú móvil abre y cierra.
  - Sin desborde horizontal y sin errores de consola.
- **Reversibilidad del hero** (SSIM ida contra vuelta): desktop 0,999998 y móvil 0,9987.
- **Errores encontrados y corregidos en las capturas:**
  - El titular salía sin espacios: el espacio quedaba dentro de la máscara `inline-block`.
  - Las ráfagas pasaban por encima de la bajada del hero.
  - El numeral pisaba la barra de productos.
  - En móvil, el café quedaba arriba del titular y el indicador pisaba el CTA.
  - Las partículas se deformaban.
  - En "Descubrí" móvil el zoom mostraba la parte vacía de la foto.
  - Sin movimiento, los granos quedaban en el origen.
- **Capturas:** en `capturas/`.

## Limitaciones

- **Productos:** sin productos reales, la colección y "Descubrí tu café" muestran estados vacíos. Las secciones están listas, pero hasta cargarlos el centro comercial sigue vacío.
- **Fluidez:** se midió en Chrome sin interfaz en esta PC, no en teléfonos reales.
- **Marca de agua:** la de Kling sigue en la secuencia del hero.
- **Textos nuevos para revisar:**
  - Las cuatro familias de sabor y sus descripciones.
  - "Empezá por lo que te gusta sentir en la taza".
  - "De distintos tostadores".

## Imágenes a producir con Banana

Pautas comunes a todas:

- Fondo perla `#F7F5F0` o crema `#F3ECDF` liso.
- Luz natural lateral desde la izquierda.
- Sin texto, sin logos, sin bolsas KAZE y sin latte art.
- Mínimo 3000 px en el lado largo.

| Recurso | Uso | Composición y encuadre | Relación | Luz |
|---|---|---|---|---|
| **B1** Ritual en casa | Ritual (reemplaza el keyframe de la taza) | Taza de doble pared sobre mesa crema, mañana doméstica, sin rostros. Taza en el tercio derecho y aire a la izquierda para el titular. | 16:9 y 4:5 (mismo plano) | Ventana lateral izquierda, cálida |
| **B2** Grano entero, cenital | A tu manera, panel "En grano" | Lecho de granos tostados visto desde arriba, con un claro perla en el tercio superior para el texto. | 4:5 | Cenital suave con apoyo lateral rasante |
| **B3** Molienda media, cenital | A tu manera, panel "Molido" (cuando se confirme) | Montículo de café molido con una cuchara de madera clara. Mismo encuadre y luz que B2, para que los paneles se lean como par. | 4:5 | Igual que B2 |
| **B4** Cuatro familias de sabor | Descubrí tu café | Bodegones mínimos: una taza de café con un ingrediente que evoque la familia (piel de mandarina, trozo de cacao, flor de jazmín, panela). El mismo encuadre en las cuatro, para que la transición se lea como un cambio de plano. | 5:4 | Lateral izquierda, idéntica en las cuatro |
| **P1** Fotos de producto (reales) | Colección | Bolsa original del tostador, de frente y centrada, con el 15 % de aire. No se generan con IA. | 4:5 | Lateral suave, sin reflejos fuertes |
