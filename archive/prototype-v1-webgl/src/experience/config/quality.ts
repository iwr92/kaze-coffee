export type QualityTier = "high" | "low";

export interface QualityProfile {
  tier: QualityTier;
  /** Cantidad de granos instanciados. */
  beans: number;
  /** Fragmentos de molienda que nacen de cada grano. */
  fragmentsPerBean: number;
  /** Subdivisión de la geometría del grano [alrededor, a lo largo]. */
  beanSegments: [number, number];
  /** Rango de pixel ratio para el Canvas. */
  dpr: [number, number];
  /** Vidrio con transmisión real (pasada extra de render). */
  transmission: boolean;
  /** Resolución del mapa de entorno procedural. */
  environmentResolution: number;
}

const HIGH: QualityProfile = {
  tier: "high",
  beans: 64,
  fragmentsPerBean: 150,
  beanSegments: [72, 56],
  dpr: [1, 1.75],
  transmission: true,
  environmentResolution: 256,
};

const LOW: QualityProfile = {
  tier: "low",
  beans: 30,
  fragmentsPerBean: 80,
  beanSegments: [48, 36],
  dpr: [1, 1.5],
  transmission: false,
  environmentResolution: 128,
};

export function detectQuality(): QualityProfile {
  if (typeof window === "undefined") return LOW;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (coarse || small || cores <= 4 || memory <= 4) return LOW;
  return HIGH;
}

/** Devuelve true si el navegador puede crear un contexto WebGL2. */
export function supportsWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
