# KAZE — experiencia web

Café de especialidad, a tu ritmo.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Estructura

```
brand/                       Manual, tokens y logos originales (copia sin modificar)
public/brand/                SVG y PNG originales servidos por la web
src/app/                     App Router: layout (fuentes), estilos y página
src/components/              Encabezado, catálogo, pie
src/commerce/                Tipos de catálogo, proveedor Tiendanube (pendiente), formato ARS
src/experience/
  Experience.tsx             Elige WebGL o versión estática; listeners del puntero
  config/quality.ts          Perfiles alto/bajo, detección de WebGL2 y movimiento reducido
  state/store.ts             Estado mutable DOM ↔ WebGL (sin renders de React por frame)
  timeline/choreography.ts   Coreografía pura: fases, cámara, rampa de fondo
  timeline/useScrollChoreography.ts  GSAP ScrollTrigger: progreso y textos
  scene/                     Canvas persistente, granos, molienda, taza, luz
  ui/                        Textos de la narrativa y fallback estático
```

## Cómo funciona la escena

- Todo depende de `progress` (0 → 1). Por eso la experiencia es reversible.
- Los granos son un `InstancedMesh` con geometría procedural (cara plana, surco en S y piel plateada).
  Sus matrices se calculan en CPU y se publican en una `DataTexture`.
- La molienda es otro `InstancedMesh`. Cada fragmento lee la matriz de su grano en GPU y nace
  donde la disolución por ruido abre ese grano, porque ambos shaders usan el mismo ruido.
  Después sigue la corriente de viento hasta la taza.
- Para ajustar los tiempos de cada fase, editá `PHASES`, `BEATS` y `CAMERA_TRACK` en `choreography.ts`.

## Estado por fase

- **Fase 01 (hecha):** sistema visual, hero, granos 3D, mouse, scroll, transformación, corriente,
  taza preliminar, fondo negro → crema, fallback y perfil móvil.
- **Fase 02:** vapor, superficie del café con movimiento, agua con más presencia, pulido del vidrio.
- **Fase 03:** catálogo real con Tiendanube (`src/commerce/providers/tiendanube.ts`).
- **Fase 04:** medición en dispositivos reales, accesibilidad y rendimiento.
