# KAZE — landing cinematográfica (Pearl White)

Café de especialidad, a tu ritmo.

```bash
npm install
npm run dev                 # http://localhost:3000
npm run build && npm start  # producción
```

## Tienda (WooCommerce)

La compra termina siempre en [tienda.kazecoffee.shop](https://tienda.kazecoffee.shop). Los botones comerciales
van a la tienda, y el precio, las moliendas y el stock se leen de su API pública cada 5 minutos.

Catálogo: `src/commerce/products.ts`. Tienda: `src/config/store.ts`.
Estado del lanzamiento, fuentes y tareas pendientes: `docs/lanzamiento/README.md`.

## Secuencia cinematográfica

Los MP4 de `public/cinematic/` tienen **un solo keyframe por clip** (GOP de 121 cuadros), así que no
sirven para scrubbing directo. El pipeline los convierte en secuencias de imágenes en
`public/cinematic/seq-hq/`:

```bash
npm run cinematic:build                       # requiere ffmpeg con libaom y libwebp (~4,5 min)
FFMPEG=C:/ruta/ffmpeg.exe npm run cinematic:build
CINEMATIC_ONLY=mobile npm run cinematic:build # regenera una sola variante
CINEMATIC_SKIP_AVIF=1 npm run cinematic:build # solo WebP, rápido
```

El procesado se validó en `docs/audit-calidad-imagen/`:

- Decodificación con croma precisa.
- Etalonado perla.
- Lanczos más realce CAS 0,35.
- **Sin reducción de ruido**, porque parpadea al ir y volver con el scroll.

| Variante | Para | Resolución | Cuadros | AVIF | WebP (respaldo) |
|---|---|---|---|---|---|
| `desktop` | pantallas grandes | 1920×1074 | 472 | 17,5 MB | 27,8 MB |
| `mobile` | teléfonos y tablets | 1080×604 | 236 | 4,9 MB | 7,6 MB |
| `lite` | teléfonos modestos o red 3G | 720×402 | 236 | 3,2 MB | 4,7 MB |

La carga es progresiva según el avance:

1. Primero el cuadro 0.
2. Después los cuadros más cercanos a la posición.
3. Después un esqueleto de toda la secuencia (1 de cada 16), para los saltos rápidos.
4. Por último una ventana que se mueve con el scroll.

En 8 s sin scrollear, desktop baja unos 3,9 MB y no los 17,5 MB completos.

Los límites de memoria y DPR de cada variante están en `CinematicMediaController.tsx` (`PROFILES`).

La secuencia anterior (1280 / 720) sigue en `public/cinematic/seq/` solo como respaldo. Se puede borrar
cuando se apruebe la nueva: suma 39 MB al deploy.

## Lanzamiento comercial (actual)

Tres cafés reales, WooCommerce, guía KAZE Home Barista, preguntas frecuentes y SEO, sobre el sistema
de movimiento de la V6. Detalle: `docs/lanzamiento/README.md`.
Punto de recuperación: tag `pre-commercial-launch-2026-11-06`.

## V6: motion editorial

Sistema de movimiento del viento (titulares cinéticos, ráfagas SVG, revelados), hero de campaña,
colección con telón y numeral, A tu manera por capas, Ritual, Descubrí tu café y cierre con transición.
Detalle, validación e imágenes a producir: `docs/v6/README.md`.
Punto de recuperación de la V5: `archive/v5-design-first/src/`.

## V5: diseño primero, cine después (archivada)

Hero 60/40, colección, A tu manera, Ritual, La diferencia, cierre y pie completo.
Detalle, validación y criterios de aprobación: `docs/v5/README.md`.
Punto de recuperación de la V4: `archive/v4-commerce/src/`.

## V4: Editorial Commerce (archivada)

Hero refinado, Product Showcase (`#cafes`) y "A tu manera" (`#a-tu-manera`).
Productos: `src/commerce/products.ts` (vacío hasta tener datos y fotos reales).
Detalle, validación, próximas secciones y recursos a producir: `docs/v4/README.md`.
La V3 está archivada en `archive/v3-editorial/`.

## Dirección artística V3 (archivada)

Descripción de cada sección, criterios y recursos a producir: `docs/v3/README.md`.
Fotografías editoriales (desde `media-src/keyframes/`, sin publicar los originales):

```bash
npm run editorial:build      # genera public/editorial/ (AVIF + WebP)
```

## Código

```
src/config/store.ts                     URLs de la tienda
src/config/channels.ts                  canales de KAZE EN CASA (PedidosYa, WhatsApp)
src/commerce/drinks.ts                  bebidas de KAZE EN CASA (docs/kaze-en-casa/README.md)
src/config/site.ts                      dominio e indexación
src/cinematic/
  manifest.ts                           contrato del manifiesto
  moments.ts                            textos y sincronía de los 4 momentos
  framing.ts                            encuadre (cover en horizontal, franja inferior en vertical)
  FrameSequence.ts                      carga progresiva, decodificación con LRU, cuadro más cercano
  progress.ts                           progreso mutable (sin estado React por cuadro)
src/components/
  cinematic/CinematicScrollExperience   sección, GSAP ScrollTrigger, elección de modo
  cinematic/CinematicMediaController    canvas persistente y bucle de dibujo
  cinematic/EditorialOverlay            textos HTML
  cinematic/ScrollProgress              indicador discreto
  cinematic/StaticCinematic             versión ligera (movimiento reducido / ahorro de datos)
  BrandHeader, StoreLink, SiteFooter, StructuredData
src/commerce/products.ts                catálogo
src/commerce/woocommerce.ts             lectura del estado real de la tienda
src/commerce/cta.ts, faq.ts             botones, disponibilidad y preguntas frecuentes
src/config/grind.ts                     guía de moliendas
src/components/commerce/                ProductShowcase, GrindChoice
src/components/hero/HeroComposition.tsx hero (cinematográfico y estático)
src/components/sections/                KazeEnCasa, TrustStrip, HomeBarista, Ritual, Difference, Faq, FinalConversion
src/components/motion/                  curvas (ease.ts), revelados (useReveals.ts),
                                        KineticTitle (titulares) y Wind (ráfagas SVG)
src/styles/v6.css, launch.css           estilos base y secciones comerciales
src/styles/en-casa.css                  KAZE EN CASA (paleta propia, acotada a .ec)
scripts/cinematic/build-sequence.mjs    pipeline FFmpeg
scripts/editorial/build-editorial.mjs   fotografías editoriales
archive/prototype-v1-webgl/             prototipo anterior (Three.js), fuera del build
```

Los tiempos de los textos se ajustan en `src/cinematic/moments.ts`. El largo del scroll se ajusta en `.cinematic-section` dentro de `globals.css`.
