# KAZE V3: dirección artística

Fecha: 2026-10-28. Base técnica sin cambios: el motor cinematográfico, `seq-hq/`, la caché, la selección de variantes y el pipeline (ver `docs/audit-calidad-imagen/`).

## Concepto

**El viento como sistema compositivo.** Los titulares se componen como ráfagas. Son líneas monumentales en Shippori Mincho con sangrías desiguales, como si el viento las empujara. Con el scroll, el viento las trae y se las lleva.

Hay un solo gesto audaz: el contraste de escala entre la tipografía monumental (hasta 10rem en desktop y 15vw en móvil) y la interfaz mínima en Instrument Sans. La calma viene de grandes vacíos perla. Sin tarjetas, sin numeración decorativa y sin "fade-up" repetido: cada movimiento responde al scroll o a una acción.

- **Color:** perla `#F7F5F0` dominante, crema `#F3ECDF` como única superficie secundaria (el campo de molienda), filetes de tinta al 16 % y tostado `#84532E` como único acento por sección.
- **Fotografía:** recortes de los keyframes Gemini a resolución nativa, con el mismo etalonado perla del video (`npm run editorial:build`).

## Secciones

### 1. Hero cinematográfico (motor existente, tipografía nueva)

Los cuatro momentos pasan a escala monumental. Cada titular es un bloque de líneas escalonadas.

- **Apertura:** al cargar, "El café tiene otra forma de sentirse." emerge línea por línea desde una máscara. Es el único momento orquestado sin scroll.
- **Con el scroll:**
  - Cada línea sube desde su máscara mientras el viento la trae desde la izquierda.
  - Al salir, el viento la arrastra hacia la derecha; cada línea viaja más lejos que la anterior.
- **Puntero (solo mouse):** las líneas se mecen con profundidades distintas.
- **Composición desktop:** el texto vive a la izquierda y en zonas vacías del video. El momento 2 va abajo, porque ahí el cuadrante está libre. El momento 4 usa la escala `lg` para no pisar la taza.
- **Composición móvil:** el texto va arriba y la imagen abajo, a 15vw.

### 2. Viento (manifiesto)

"El viento trae el aroma antes que la taza." en una sola línea de 19vw (30vw en móvil). La sección queda fija y el scroll se vuelve viento: la frase cruza la pantalla de derecha a izquierda y pasa por delante de la fotografía macro del grano abriéndose, que crece despacio.

Abajo, en calma: "Vendemos café que se siente antes de probarlo." Es el momento de tensión de la página.

### 3. Origen

Editorial asimétrico:

- **A la izquierda:** la fotografía macro de los granos, a sangre y con detalle nativo, se abre como una ventana (máscara que se expande con el scroll) mientras la imagen se asienta.
- **A la derecha, desfasado hacia abajo:** "Origen trazable.", el texto sobre la selección de tostadores y las promesas del manual ("Tostados en pequeños lotes.", "Enviados frescos."). Cada promesa entra con su filete, empujada por el viento.

### 4. Molienda (interacción)

"Molido para tu método." Se elige un método (en grano, espresso, moka, filtro o prensa francesa) y un campo de 380 partículas de café sobre crema se reacomoda en una estela diagonal. El tamaño cambia en cascada de izquierda a derecha, como una ráfaga.

- **Con el mouse:** el café se aparta del cursor.
- **Debajo del campo:** el tipo de molienda ("Gruesa.") y una referencia sensorial ("Como sal gruesa.").
- **Desktop:** los métodos son palabras serif grandes; la activa se desplaza y muestra su molienda en tostado.
- **Móvil:** los métodos son chips con scroll horizontal (el manual reserva la forma de píldora para los chips de filtro).
- **Accesibilidad:** usa radios nativos, así que funciona con teclado y lector de pantalla.

### 5. Notas

Calma después de la interacción: "El aroma llega primero." Debajo, tres hileras de notas de cata cruzan la pantalla en direcciones alternas, con la del medio a mayor escala y en tinta plena. Si el scroll acelera, el viento sopla más fuerte y después vuelve a la calma. El texto aclara que son ejemplos del estilo descriptivo, no notas de un producto.

### 6. Ritual (cierre y tienda, `#tienda`)

La fotografía de la taza ocupa todo el ancho. La tagline "Café de especialidad, a tu ritmo." descansa en el vacío perla, con la promesa del manual y el acceso a la tienda. Sin URL de Tiendanube configurada, dice "La tienda online abre pronto". En móvil va primero la taza y después el texto.

### 7. Pie

El logotipo original (SVG del manual, sin deformar) ocupa todo el ancho, con su área de resguardo. Debajo, la firma con el kanji: "風 Kaze significa viento."

## Movimiento reducido

Con `prefers-reduced-motion`:

- El hero usa la versión estática que ya existía.
- Las secciones nuevas muestran su composición quieta: el manifiesto en varias líneas y las notas como texto que se acomoda en líneas.
- No se crea ninguna animación.

## Validación (build aislado, sin tocar el servidor de desarrollo)

- TypeScript, lint y `next build` sin errores. Primera carga de JS: 158 kB (153 kB antes de la V3).
- Recorridos completos en Chrome: desktop 1440×900 y móvil 390×844, con y sin movimiento reducido. Sin errores de consola y sin desborde horizontal.
- Errores encontrados y corregidos durante la validación:
  - El encabezado volvía a ser transparente después del hero.
  - En móvil, la fila de chips (un `fieldset`, que por defecto no se achica) ensanchaba la grilla.
  - El viewport móvil se ensanchaba a 425 px: se corrigió con `overflow-x: clip` en `<html>`.
- Capturas en `capturas/`.

## Limitaciones

- La fluidez se midió en Chrome headless en esta PC, no en teléfonos reales.
- Las notas de cata y las referencias de molienda son ilustrativas o de conocimiento general. Conviene que el equipo las revise.

## Recursos a producir

### Con Kling (video)

1. **Volver a exportar los cuatro clips sin marca de agua y a la máxima resolución del plan.** Es lo que más mejora la nitidez (ver la auditoría).
2. **Versiones verticales 9:16 de los cuatro clips**, con el mismo guion y continuidad. Hoy el móvil recorta un video horizontal. Un original vertical permitiría encuadres a pantalla completa.
3. **Vapor en bucle sobre la taza final** (4–6 s, bucle perfecto, fondo perla `#F7F5F0`, 1080p o más) para el Ritual.

### Con Banana (imagen)

Pautas comunes a todas las imágenes:

- Fondo perla `#F7F5F0` o crema `#F3ECDF` liso.
- Luz natural lateral y sombras suaves.
- Sin texto, sin logos y sin latte art.
- Mínimo 3000 px en el lado largo.

Imágenes:

4. **Macro del grano tostado:** surco, poros y aceite visibles, encuadre 4:5. Reemplaza el recorte del keyframe en Origen.
5. **Cuatro texturas de molienda** (fina, fina a media, media y gruesa), en vista cenital, en cuadros idénticos 1:1. Podrían acompañar el campo de partículas de Molienda.
6. **Prensa francesa en un ritual de mañana en casa,** con superficie crema y sin marca visible. El manual menciona la prensa como producto.
7. **Paisaje de montaña con niebla y viento, desaturado o en blanco y negro.** Es el manual ("Imagen"). Sirve como pausa entre Origen y Molienda o detrás del manifiesto.
8. **Manos sirviendo o sosteniendo la taza de doble pared** (encuadre sin rostro) para reforzar "a tu ritmo".

### Reales (no generados)

9. **Fotos de los productos de cada tostador con su packaging original,** para el futuro catálogo. No deben generarse con IA.
