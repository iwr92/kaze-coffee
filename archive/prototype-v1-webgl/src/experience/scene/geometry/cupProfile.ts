import { Vector2 } from "three";

/**
 * Perfil de la taza de vidrio de doble pared (borosilicato), en unidades de
 * escena. Se revoluciona con LatheGeometry.
 *
 * Pared exterior levemente cónica, borde redondeado, pared interior que baja
 * hasta un fondo elevado: el aire entre ambas paredes es lo que da la lectura
 * de "doble pared".
 */
export const CUP = {
  height: 1.6,
  outerBottom: 0.74,
  outerTop: 0.86,
  innerTop: 0.79,
  innerBottom: 0.62,
  innerFloor: 0.34,
} as const;

function arc(
  out: Vector2[],
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  steps: number,
): void {
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    out.push(new Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
}

export function createCupProfile(): Vector2[] {
  const { height, outerBottom, outerTop, innerTop, innerBottom, innerFloor } = CUP;
  const pts: Vector2[] = [];
  const rimR = (outerTop - innerTop) / 2;

  // Fondo exterior, desde el eje hacia afuera, con canto redondeado.
  pts.push(new Vector2(0.0001, 0));
  pts.push(new Vector2(outerBottom - 0.08, 0));
  arc(pts, outerBottom - 0.08, 0.08, 0.08, -Math.PI / 2, 0, 6);

  // Pared exterior hacia el borde.
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const y = 0.08 + (height - rimR - 0.08) * t;
    // Ligera curva: la pared se abre más arriba.
    const r = outerBottom + (outerTop - outerBottom) * Math.pow(t, 0.9);
    pts.push(new Vector2(r, y));
  }

  // Borde superior redondeado (labio).
  arc(pts, innerTop + rimR, height - rimR, rimR, 0, Math.PI, 8);

  // Pared interior hacia abajo.
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const y = height - rimR - (height - rimR - innerFloor - 0.1) * t;
    const r = innerTop - (innerTop - innerBottom) * Math.pow(t, 1.1);
    pts.push(new Vector2(r, y));
  }

  // Fondo interior elevado, curvo hacia el eje.
  arc(pts, innerBottom - 0.1, innerFloor + 0.1, 0.1, 0, -Math.PI / 2, 6);
  pts.push(new Vector2(0.0001, innerFloor));

  return pts;
}

/** Radio interior de la taza a una altura dada (para el líquido). */
export function innerRadiusAt(y: number): number {
  const { height, innerTop, innerBottom, innerFloor } = CUP;
  const top = height - (CUP.outerTop - innerTop) / 2;
  const t = Math.min(1, Math.max(0, (top - y) / (top - innerFloor - 0.1)));
  return innerTop - (innerTop - innerBottom) * Math.pow(t, 1.1);
}
