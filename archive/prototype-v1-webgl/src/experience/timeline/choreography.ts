/**
 * Coreografía central de KAZE.
 *
 * Todo lo que ocurre en la escena es una función pura del progreso de scroll
 * (0 → 1). Por eso la experiencia es reversible: subir el scroll evalúa los
 * mismos valores en sentido inverso. El tiempo solo agrega movimiento
 * ambiental (flotación, giro de la corriente), nunca cambia la narrativa.
 *
 *   0.00 ─ 0.12  Escena 01 · The Awakening      granos flotando, hero visible
 *   0.10 ─ 0.32  Escena 02 · viento que reúne    los granos se juntan en un vórtice
 *   0.20 ─ 0.54  Escena 02 · The Transformation  los granos se abren en molienda
 *   0.34 ─ 0.86  Escena 03 · The Flow             la molienda baja con el viento
 *   0.52 ─ 1.00  Escena 04 · The Ritual           taza, agua caliente, fondo crema
 */

export const WORLD = {
  /** Centro del vórtice donde se reúnen los granos. */
  vortex: { x: 0, y: -1, z: 0 },
  /** Base de la taza. La corriente termina dentro de ella. */
  cup: { x: 0, y: -14, z: 0 },
} as const;

/** Ventanas de cada fase. Compartidas con la línea de tiempo del DOM. */
export const PHASES = {
  gather: [0.1, 0.32],
  morph: [0.2, 0.54],
  flow: [0.34, 0.86],
  cup: [0.52, 0.7],
  background: [0.64, 0.84],
  bed: [0.62, 0.8],
  pourIn: [0.74, 0.78],
  brew: [0.76, 0.91],
  pourOut: [0.86, 0.91],
  ritual: [0.7, 0.92],
} as const;

/** Ventanas de los textos HTML (entrada y salida). */
export const BEATS = {
  heroOut: [0.03, 0.1],
  transformation: { in: [0.22, 0.27], out: [0.44, 0.48] },
  flow: { in: [0.5, 0.55], out: [0.64, 0.69] },
  // El mensaje final entra cuando el agua ya terminó de caer.
  ritual: { in: [0.91, 0.96] },
} as const;

export interface SceneState {
  progress: number;
  time: number;
  gather: number;
  morph: number;
  flow: number;
  cup: number;
  background: number;
  bed: number;
  pourHead: number;
  pourTail: number;
  brew: number;
  ritual: number;
}

export function createSceneState(): SceneState {
  return {
    progress: 0,
    time: 0,
    gather: 0,
    morph: 0,
    flow: 0,
    cup: 0,
    background: 0,
    bed: 0,
    pourHead: 0,
    pourTail: 0,
    brew: 0,
    ritual: 0,
  };
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Amortiguación independiente del framerate. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function win(range: readonly [number, number], p: number): number {
  return smoothstep(range[0], range[1], p);
}

/** Evalúa la coreografía para un progreso dado. Escribe en `out` sin allocations. */
export function evaluateChoreography(p: number, time: number, out: SceneState): SceneState {
  out.progress = p;
  out.time = time;
  out.gather = win(PHASES.gather, p);
  out.morph = win(PHASES.morph, p);
  out.flow = win(PHASES.flow, p);
  out.cup = win(PHASES.cup, p);
  out.background = win(PHASES.background, p);
  out.bed = win(PHASES.bed, p);
  out.pourHead = win(PHASES.pourIn, p);
  out.pourTail = win(PHASES.pourOut, p);
  out.brew = win(PHASES.brew, p);
  out.ritual = win(PHASES.ritual, p);
  return out;
}

/* ——— Fondo ——— */

/**
 * Rampa del fondo: del negro KAZE al crema pasando por tonos de tueste,
 * como luz de mañana entrando. Una interpolación directa pasa por un gris
 * sin temperatura.
 */
const BACKGROUND_RAMP: readonly [number, number, number, number][] = [
  [0, 0x15, 0x13, 0x11],
  [0.38, 0x46, 0x33, 0x25],
  [0.7, 0xb9, 0xa2, 0x86],
  [1, 0xf3, 0xec, 0xdf],
];

/** Escribe en `out` el color sRGB (0 → 1) del fondo para t ∈ [0, 1]. */
export function backgroundRamp(t: number, out: { r: number; g: number; b: number }): void {
  const x = clamp01(t);
  let i = 0;
  while (i < BACKGROUND_RAMP.length - 2 && x > BACKGROUND_RAMP[i + 1][0]) i++;
  const a = BACKGROUND_RAMP[i];
  const b = BACKGROUND_RAMP[i + 1];
  const k = clamp01((x - a[0]) / (b[0] - a[0]));
  out.r = lerp(a[1], b[1], k) / 255;
  out.g = lerp(a[2], b[2], k) / 255;
  out.b = lerp(a[3], b[3], k) / 255;
}

/** Tono del encabezado: cambia cuando el fondo ya es más claro que oscuro. */
export function headerTone(p: number): "negro" | "crema" {
  return win(PHASES.background, p) > 0.55 ? "crema" : "negro";
}

/* ——— Cámara ——— */

export interface CameraKey {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Trayectoria de la cámara. Acompaña la corriente desde la nube de granos
 * hasta la taza. Se interpola con Hermite (Catmull-Rom no uniforme) para que
 * no haya frenadas en cada llave.
 */
export const CAMERA_TRACK: readonly CameraKey[] = [
  { at: 0.0, position: [0, 0, 9.5], target: [0, 0, 0] },
  { at: 0.14, position: [0, -0.2, 9.1], target: [0, -0.2, 0] },
  { at: 0.34, position: [1.3, -0.9, 8.0], target: [0, -1.0, 0] },
  { at: 0.44, position: [0.3, -1.9, 8.2], target: [0, -2.2, 0] },
  { at: 0.52, position: [-1.6, -5.2, 7.6], target: [0, -6.2, 0] },
  { at: 0.72, position: [0.9, -10.4, 6.6], target: [0, -12.2, 0] },
  { at: 0.88, position: [0.15, -11.85, 5.5], target: [0, -13.05, 0] },
  { at: 1.0, position: [0, -11.95, 5.25], target: [0, -13.1, 0] },
];

type Vec3Tuple = [number, number, number];

function hermite(p0: number, p1: number, m0: number, m1: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * p0 +
    (t3 - 2 * t2 + t) * m0 +
    (-2 * t3 + 3 * t2) * p1 +
    (t3 - t2) * m1
  );
}

function tangent(
  keys: readonly CameraKey[],
  i: number,
  pick: "position" | "target",
  axis: number,
): number {
  const prev = keys[Math.max(0, i - 1)];
  const next = keys[Math.min(keys.length - 1, i + 1)];
  const dt = next.at - prev.at;
  if (dt <= 0) return 0;
  return (next[pick][axis] - prev[pick][axis]) / dt;
}

/** Muestrea la pista de cámara. `outPos` y `outTarget` se reutilizan. */
export function sampleCamera(p: number, outPos: Vec3Tuple, outTarget: Vec3Tuple): void {
  const keys = CAMERA_TRACK;
  const t = clamp01(p);
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const span = b.at - a.at;
  const local = span > 0 ? clamp01((t - a.at) / span) : 0;
  for (let axis = 0; axis < 3; axis++) {
    outPos[axis] = hermite(
      a.position[axis],
      b.position[axis],
      tangent(keys, i, "position", axis) * span,
      tangent(keys, i + 1, "position", axis) * span,
      local,
    );
    outTarget[axis] = hermite(
      a.target[axis],
      b.target[axis],
      tangent(keys, i, "target", axis) * span,
      tangent(keys, i + 1, "target", axis) * span,
      local,
    );
  }
}
