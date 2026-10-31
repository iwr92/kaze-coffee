# Auditoría de calidad de imagen: secuencia cinematográfica

Fecha: 2026-10-28. Alcance: los 4 MP4 de Kling, las secuencias publicadas en `public/cinematic/seq/` y cómo las dibuja el navegador.
No se reconstruyó ninguna secuencia ni se borró ningún recurso.

## Conclusión

**Entre el 91 % y el 96 % de la pérdida de nitidez visible viene del origen, no del pipeline.**
Los videos declaran 1280 px, pero tienen el detalle de un video de entre 700 y 900 px.
Para que se vean premium en pantallas de alta densidad hay que actuar primero sobre el origen.
El pipeline se puede mejorar (en móvil bastante), pero no compensa lo que falta.

## 1. Los MP4 originales

Los cuatro clips comparten estas características:

- **Formato:** H.264 High, nivel 3.1, 1280×716, 24 fps, 121 cuadros (5,04 s).
- **Color:** yuv420p de 8 bits, BT.709, rango limitado.
- **Codificador:** `h264_slapi`, el codificador de servidor de Kling.
- **Estructura:** un solo cuadro I seguido de 120 cuadros P, sin cuadros B. Por eso no sirven para hacer scrubbing directo.

| Clip | Bitrate | Bits/píxel/cuadro | Cuadro P medio |
|---|---|---|---|
| 01 (hero) | **4,05 Mb/s** | **0,18** | 20 KB |
| 02 | 10,4 Mb/s | 0,47 | 53 KB |
| 03 | 10,9 Mb/s | 0,49 | 55 KB |
| 04 | 8,3 Mb/s | 0,38 | 42 KB |

El clip del hero, que es la primera impresión, es el más comprimido de los cuatro.

### Resolución efectiva

La resolución efectiva es el ancho mínimo al que se puede reducir un cuadro y volver a ampliarlo con PSNR ≥ 42 dB.
La referencia "K₁₂₈₀" es el keyframe Gemini de 2752 px (la imagen de la que Kling generó el clip) reducido a 1280 px.
Mide el máximo de detalle que podría tener un 1280 de ese mismo contenido.

| Momento | K₁₂₈₀ | MP4 Kling | Energía de bordes (MP4 / K₁₂₈₀) |
|---|---|---|---|
| Inicio clip 1 (hero) | 1088 px | **704 px** | 31 % |
| Fin clip 1 | 1152 px | 832 px | 38 % |
| Inicio clip 3 (molienda) | 1280 px | 896 px | 32 % |
| Inicio clip 4 | 1216 px | 896 px | 31 % |
| Final (taza) | 512 px | 512 px | 97 % (escena suave por naturaleza) |

A mitad de los clips 2 y 4 hay cuadros que bajan a 576–640 px por desenfoque de movimiento. Eso es legítimo y no es un defecto.
El cuadro 0 del hero es el más blando de su clip.

## 2. La secuencia publicada

| | Desktop | Móvil |
|---|---|---|
| Resolución | 1280×716 | 720×402 |
| Cuadros | 472 (todos) | 236 (1 de cada 2) |
| AVIF (crf 30 / 33) | 11,7 MB | 3,0 MB |
| WebP (q72 / q68) | 16,8 MB | 4,3 MB |

Pérdida por codificación, frente al original con el mismo etalonado:

- **SSIM:** 0,985–0,995.
- **PSNR:** 43–49 dB.
- **VMAF:** 91,7–94,2. El techo medido, un cuadro contra sí mismo, es 97,4.
- **AVIF suaviza la microtextura:** conserva el 88–96 % de la energía de bordes, porque libaom con crf 30 aplana la piel del grano.
- **WebP mide ≥ 100 %:** no es más detalle sino artefactos de bloque y "ringing".

## 3. Cómo se dibuja en el navegador

Lo medí con una réplica fiel de la ruta de dibujo del motor (`scripts/replica-motor-dibujo.html`), en Chrome con GPU.
Usa el mismo encuadre, `createImageBitmap`, `imageSmoothingQuality: "high"` y el DPR limitado a 2.

| Pantalla | Ancho dibujado (px físicos) | Ampliación del archivo |
|---|---|---|
| 1440×900 @1x | 1609 | 1,26× |
| 1920×1080 @1x | 1931 | 1,51× |
| 2560×1440 @1x | 2574 | 2,01× |
| 1440×900 @2x (laptop retina) | 3218 | **2,51×** |
| 390×844 @3x (iPhone, variante 720) | 2299 | **3,19×** |

En el teléfono, el motor dibuja el canvas a DPR 2 (2,13×) y el compositor lo estira otro 1,5×.
Con el canvas a DPR 3, la energía de bordes medida sube un 16 %.

Chrome amplía el canvas con un filtro más blando que Lanczos.
Las dos imágenes coinciden casi exactamente (SSIM 0,9999), pero la de Chrome tiene un 30 % menos de energía de bordes.

## 4. ¿De dónde viene la pérdida?

Medí el RMS del laplaciano sobre un recorte de granos del hero, a resolución de pantalla.
El 100 % es el keyframe nativo (2752 px) mostrado en esa misma pantalla.

| Etapa | Retina 1440 @2x | 1920 @1x | Móvil @3x |
|---|---|---|---|
| Límite del formato 1280 px | **79 %** | **59 %** | **65 %** |
| Suavidad de la generación de Kling | **17 %** | **32 %** | **21 %** |
| Codificación del pipeline (AVIF) | 1 % | 2 % | 10 % (reducción a 720 + AVIF) |
| Ampliación en el canvas | 3 % | 7 % | 4 % |
| **Origen (límite + Kling)** | **96 %** | **91 %** | **86 %** |

## 5. Comparaciones visuales

Recortes 1:1 a escala 1440p (2560 px de ancho), en `comparaciones/`:

- **A. Actual:** el AVIF publicado, ampliado como lo hace el navegador. La piel del grano se ve "encerada", los contornos escalonados y hay algún punto magenta en la molienda.
- **B. Original + Lanczos:** recupera la textura y los bordes limpios.
- **C. Original + reducción de ruido + Lanczos + CAS 0,5:** se ve más nítida, pero la reducción de ruido aplana la piel y **parpadea** (+27 % de inestabilidad temporal). Descartada.
- **D. Original + Lanczos + CAS 0,35:** +12 % de nitidez sobre B, con +11 % de inestabilidad. Sube en la misma proporción que la nitidez, así que realza el detalle existente sin inventarlo. Recomendada.
- **R. Keyframe Gemini:** el techo. Se ven grietas, poros y cada partícula de molienda. Ningún procesado del video lo alcanza.

En la taza, R no sirve como techo: Kling terminó el clip con otra taza (SSIM 0,79 contra el keyframe 5).

## 6. Muestra de alta calidad: peso y calidad

Medido sobre 8 cuadros representativos (dos por clip) y extrapolado.
La extrapolación de la variante actual da 11,3 MB, contra 11,7 MB reales.
El VMAF está medido a resolución de pantalla contra D sin comprimir. Ese VMAF favorece levemente a las variantes con CAS.

| Variante | KB/cuadro | VMAF | Secuencia |
|---|---|---|---|
| Actual desktop: 1280, crf 30 | 24,4 | 85,6 | 11,3 MB |
| **Desktop 1920, crf 28 + CAS 0,35** | 37,1 | **93,1** | **17,1 MB** |
| Desktop 2560, crf 32 + CAS | 38,1 | 92,0 | 17,6 MB |
| Desktop 2560, crf 36 + CAS | 31,6 | 89,8 | 14,5 MB |
| Actual móvil: 720, crf 33 | 12,5 | 83,5 | 2,9 MB |
| **Móvil 1080, crf 32 + CAS 0,35** | 20,6 | **92,6** | **4,7 MB** |
| Móvil 1080, crf 36 + CAS | 17,0 | 90,2 | 3,9 MB |

**2560 no supera a 1920 con este origen:** pesa lo mismo y mide igual o peor. Más píxeles no agregan información que el video no tiene.

## 7. ¿Master 4K con IA?

**Es viable como paso de producción, pero no da un 4K real y no conviene para la web.** Estas son las razones:

- **No sería 4K real.** El detalle real es de 700–900 px, y llevarlo a 3840 son 4,3–5,5× de textura **inventada**. No debe llamarse 4K real.
- **El riesgo principal es el parpadeo.** Los ampliadores cuadro a cuadro (tipo Real-ESRGAN) inventan una textura distinta en cada cuadro. Con scrubbing el visitante se detiene y va y vuelve, y el parpadeo se vuelve muy visible. Habría que usar modelos de video con coherencia temporal (por ejemplo, los modelos de video de Topaz Video AI) y probarlos en un tramo corto antes de procesar todo.
- **La web no necesita más de 2560 px.** Hasta un 5K muestra la escena a unos 2,5× de 1280. Un 4K solo sumaría peso. No lo medí, pero con la proporción de píxeles sería varias veces el peso de la variante de 1920.
- **Uso razonable:** tener un master con IA como archivo de producción y publicar desde él a 1920 (desktop) y 1080 (móvil), una vez validado que no parpadea.

No ejecuté ningún ampliador con IA: requiere instalar binarios o servicios externos y lo dejo a tu decisión.

## 8. Recomendación

### Origen: la mayor palanca, entre el 86 % y el 96 % de la pérdida

1. **Volver a exportar los cuatro clips desde Kling a la máxima resolución que permita el plan y sin marca de agua.** No sé con certeza qué resoluciones ofrece Kling 4.0 en tu plan; hay que verificarlo en la cuenta. Si un 1080p nativo mejora la resolución efectiva, ataca directo el 79 % del límite.
2. Si no hay más resolución nativa, **evaluar un master con IA de video temporalmente coherente** en un tramo de 2 s del clip 1. Aceptarlo solo si pasa la prueba de scrubbing hacia adelante y hacia atrás.
3. **Subir el bitrate del clip 1** si Kling lo permite: es el más comprimido y es el hero.

### Pipeline: aplicable ya, con los MP4 actuales

**Desktop (pantallas 1440p y retina):**

- Decodificar con conversión de croma precisa (`lanczos+accurate_rnd+full_chroma_int`) y aplicar el etalonado.
- Ampliar con Lanczos a **1920 px**, aplicar **CAS 0,35** y codificar en AVIF crf 28.
- Son 472 cuadros, unos **17 MB**, con la misma carga de lo grueso a lo fino. El navegador amplía menos y la microtextura sobrevive.

**Móvil:**

- La misma cadena a **1080 px**, 1 de cada 2 cuadros, AVIF crf 32, unos **4,7 MB**. Es el mayor salto por megabyte: VMAF de 83,5 a 92,6.
- Subir el tope de DPR del canvas a 3 en móvil: +16 % de nitidez medida, a costa de un canvas de 1170×2532.

**Versión ligera (movimiento reducido, ahorro de datos o fallo de carga):**

- No necesita continuidad entre cuadros, así que puede usar **los cinco keyframes Gemini** (detalle real de 2752 px) a 1920 y 1080 en lugar de cuadros del video. Es la única forma de mostrar detalle real hoy.

**Opción para el hero:**

- El keyframe 1 coincide con el cuadro 0 (SSIM 0,99).
- Se podría usar como imagen de reposo del hero (primera impresión con detalle real) y fundirla con la secuencia al empezar el scroll.
- Riesgo: la caída de nitidez al empezar a moverse puede notarse. Hay que probarlo antes de decidir.
- Con los keyframes 2 a 4 se podría hacer lo mismo en los cortes entre clips (SSIM ≥ 0,98). Con el 5 no (0,79).

## Método y reproducibilidad

En `scripts/` están los scripts de medición.

- `metrics.py`: nitidez, energía espectral y resolución efectiva.
- `decompose.py`: reparto de la pérdida por etapa.
- `weight.sh`: peso y VMAF de cada variante.
- `captura-navegador.mjs` y `replica-motor-dibujo.html`: captura de lo que dibuja el navegador.

Usan rutas absolutas del entorno donde se hizo la auditoría: ajustalas antes de volver a correrlos.

Herramientas: FFmpeg 9.0.2 (libaom, libwebp, libvmaf), Python con numpy y Pillow, y Chrome con GPU en modo headless.

## Implementación (2026-10-28)

Se aplicó la variante recomendada (`npm run cinematic:build`, salida en `public/cinematic/seq-hq/`).
La validación se hizo en dos builds aislados, antes y después, fuera del `.next` del proyecto.
Se usó Chrome con GPU en modo headless y red 4G simulada (12 Mb/s, 70 ms) para la carga inicial.
Script: `scripts/validacion-antes-despues.mjs`. Resultados completos: `implementacion/resultados-*.json`.

### Nitidez medida en la app real

RMS del laplaciano sobre zonas sin texto.

| Escena | Desktop retina 1440 @2x | iPhone 390 @3x |
|---|---|---|
| Hero | +17 % | +61 % |
| Transformación | +15 % | — |
| Corriente | +14 % | +59 % |
| Taza | +11 % | +49 % |

### Carga, memoria y fluidez

| | Desktop antes → después | Móvil antes → después |
|---|---|---|
| Primer cuadro en pantalla (4G simulada) | 904 → 705 ms | 655 → 640 ms |
| Bytes del primer cuadro | 48 → 80 KB | 25 → 44 KB |
| Descargado tras 8 s sin scrollear | 8,8 MB → **3,9 MB** | 3,0 MB → **1,1 MB** |
| Descargado tras recorrer todo | 11,7 → 17,5 MB | 3,0 → 4,9 MB |
| Memoria de Chrome (todos los procesos): reposo / pico | 369 / 792 → 433 / 811 MB | 286 / 684 → 306 / 656 MB |
| Canvas | 2880×1800 (igual) | 780×1688 → **1170×2532** (DPR 3) |
| Cuadros del navegador > 50 ms durante el scroll | 1 → 0 | 0 → 0 |

### Continuidad

- **Diferencia entre posiciones consecutivas:** máximo de 44,9 contra 44,8 en desktop y de 26,3 contra 26,1 en móvil. Los picos son iguales antes y después: son cambios de contenido del video, no saltos ni flashes nuevos.
- **Ida contra vuelta en la misma posición:** mediana de 0,00 en desktop y 1,15 en móvil, sin cuadros vacíos ni errores de consola.

Comparaciones 1:1 en `implementacion/`.

### Limitaciones

- La mejora es solo del pipeline: el límite del origen (ver §4) sigue igual.
- Los tiempos de cuadro se midieron en Chrome headless en esta PC (refresco de unos 120 Hz). No reemplazan una prueba en un teléfono real de gama media.
- `deviceMemory` y `connection`, que se usan para elegir `lite`, solo existen en navegadores Chromium. En Safari, `lite` se decide por núcleos de CPU.
