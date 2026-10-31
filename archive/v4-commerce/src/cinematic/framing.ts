/**
 * Encuadre del video dentro del escenario.
 *
 * Horizontal: cubre el viewport, con un punto focal que sigue al sujeto.
 * Vertical: la imagen se apoya en la mitad inferior, con el texto arriba, y
 * el punto focal recorre la escena (granos → corriente → taza) para que nada
 * importante quede recortado.
 */

/** Punto focal horizontal (0 → 1 del ancho del cuadro) por cuadro del master. */
const FOCAL_TRACK: readonly [number, number][] = [
  [0, 0.6],
  [0.25, 0.62],
  [0.5, 0.7],
  [0.75, 0.68],
  [1, 0.71],
];

function focalAt(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  for (let i = 0; i < FOCAL_TRACK.length - 1; i++) {
    const [a, fa] = FOCAL_TRACK[i];
    const [b, fb] = FOCAL_TRACK[i + 1];
    if (p <= b) {
      const t = (p - a) / (b - a);
      const s = t * t * (3 - 2 * t);
      return fa + (fb - fa) * s;
    }
  }
  return FOCAL_TRACK[FOCAL_TRACK.length - 1][1];
}

export interface DrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Si la imagen no cubre todo el alto, sus bordes se funden con el fondo. */
  featherTop: boolean;
  featherBottom: boolean;
}

export function computeFraming(
  viewW: number,
  viewH: number,
  imageAspect: number,
  progress: number,
  out: DrawRect,
): DrawRect {
  const aspect = viewW / viewH;
  const focal = focalAt(progress);
  let width: number;
  let height: number;
  let centerY: number;

  if (aspect >= 1.15) {
    // Cubrir.
    width = Math.max(viewW, viewH * imageAspect);
    height = width / imageAspect;
    centerY = viewH / 2;
  } else {
    // Vertical o casi cuadrado: la imagen ocupa una franja inferior.
    const t = Math.min(1, Math.max(0, (aspect - 0.45) / (1.15 - 0.45)));
    const heightShare = 0.5 + t * 0.4; // 50 % del alto en teléfonos → 90 % en tablets
    height = viewH * heightShare;
    width = height * imageAspect;
    if (width < viewW * 1.25) {
      width = viewW * 1.25;
      height = width / imageAspect;
    }
    centerY = viewH * (0.66 - t * 0.12);
  }

  let x = viewW / 2 - focal * width;
  x = Math.min(0, Math.max(viewW - width, x));
  const lowY = Math.min(0, viewH - height);
  const highY = Math.max(0, viewH - height);
  const y = Math.min(highY, Math.max(lowY, centerY - height / 2));

  out.x = x;
  out.y = y;
  out.width = width;
  out.height = height;
  out.featherTop = y > 0.5;
  out.featherBottom = y + height < viewH - 0.5;
  return out;
}
