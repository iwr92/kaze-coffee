/** Contrato del manifiesto que genera scripts/cinematic/build-sequence.mjs. */

export type FrameFormat = "avif" | "webp";
/** desktop 1920 px · mobile 1080 px · lite 720 px (equipos modestos). */
export type VariantId = "desktop" | "mobile" | "lite";

export interface SequenceVariant {
  width: number;
  height: number;
  /** Uno de cada `step` cuadros del master. */
  step: number;
  count: number;
  /** Patrones relativos a SEQUENCE_BASE, con `{i}` como índice de 4 dígitos. */
  formats: Partial<Record<FrameFormat, string>> & { webp: string };
  bytes: Partial<Record<FrameFormat, number>>;
  posters: string[];
}

export interface SequenceManifest {
  version: 1;
  fps: number;
  /** Cuadros del master continuo (con fundidos entre clips). */
  frameCount: number;
  /** Cuadro del master de cada momento clave: inicio, fundidos y final. */
  keyFrames: number[];
  /** Procesado aplicado (trazabilidad; ver docs/audit-calidad-imagen). */
  processing?: Record<string, string>;
  variants: Record<VariantId, SequenceVariant>;
}

/** Secuencia de calidad alta (1920 / 1080 / 720). La anterior sigue en /cinematic/seq/. */
export const SEQUENCE_BASE = "/cinematic/seq-hq/";

export async function loadManifest(signal?: AbortSignal): Promise<SequenceManifest> {
  const res = await fetch(`${SEQUENCE_BASE}manifest.json`, { signal, cache: "force-cache" });
  if (!res.ok) throw new Error(`manifest.json: ${res.status}`);
  return (await res.json()) as SequenceManifest;
}

export function frameUrl(pattern: string, index: number): string {
  return SEQUENCE_BASE + pattern.replace("{i}", String(index).padStart(4, "0"));
}
