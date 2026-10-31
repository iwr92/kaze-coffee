import { frameUrl, type FrameFormat, type SequenceVariant } from "./manifest";

/**
 * Secuencia de cuadros con acceso aleatorio.
 *
 * Descarga progresiva según el avance (no se baja todo de entrada):
 *  1. El primer cuadro, para reemplazar el póster cuanto antes.
 *  2. Los cuadros más próximos a la posición actual, en la dirección del scroll.
 *  3. Un esqueleto de toda la secuencia (1 de cada 16) para saltos rápidos.
 *  4. El resto de una ventana que se desplaza con el scroll.
 *
 * Guarda los archivos comprimidos y decodifica bajo demanda en una caché
 * acotada por memoria (un cuadro de 1920 px ocupa ~8,3 MB decodificado).
 * Si el cuadro pedido todavía no está, usa el más cercano: nunca hay vacío.
 */

const FETCH_CONCURRENCY = 6;
const DECODE_CONCURRENCY = 2;
const SKELETON_STRIDE = 16;
/** Cuadros "inmediatos" alrededor de la posición: máxima prioridad. */
const NEAR_FRAMES = 24;

export interface SequenceStats {
  loaded: number;
  total: number;
  bytes: number;
}

export interface SequenceOptions {
  /** Cantidad máxima de cuadros decodificados en memoria. */
  cacheSize: number;
  /** Ventana de descarga, como fracción de la secuencia. */
  lookahead?: number;
  lookbehind?: number;
}

export class FrameSequence {
  readonly count: number;
  readonly aspect: number;
  private readonly pattern: string;
  private readonly blobs: (Blob | undefined)[];
  private readonly bitmaps = new Map<number, ImageBitmap>();
  private readonly decoding = new Set<number>();
  private readonly fetching = new Set<number>();
  private readonly failed = new Set<number>();
  private readonly cacheSize: number;
  private readonly ahead: number;
  private readonly behind: number;
  private readonly abort = new AbortController();
  private wanted: number[] = [];
  private center = 0;
  private direction = 1;
  private sleepers: (() => void)[] = [];
  private activeDecodes = 0;
  private pinned = new Set<number>();
  private disposed = false;
  private loadedCount = 0;
  private loadedBytes = 0;

  /** Se llama cuando un cuadro nuevo queda decodificado (para redibujar). */
  onFrameReady: (() => void) | null = null;
  onProgress: ((stats: SequenceStats) => void) | null = null;

  constructor(variant: SequenceVariant, format: FrameFormat, options: SequenceOptions) {
    this.count = variant.count;
    this.aspect = variant.width / variant.height;
    this.pattern = variant.formats[format] ?? variant.formats.webp;
    this.blobs = new Array(variant.count);
    this.cacheSize = options.cacheSize;
    this.ahead = Math.ceil(this.count * (options.lookahead ?? 0.22));
    this.behind = Math.ceil(this.count * (options.lookbehind ?? 0.06));
  }

  private available(i: number): boolean {
    return i >= 0 && i < this.count && !this.blobs[i] && !this.fetching.has(i) && !this.failed.has(i);
  }

  /** Próximo cuadro a descargar según la prioridad descrita arriba. */
  private nextToFetch(): number | undefined {
    const dir = this.direction >= 0 ? 1 : -1;
    const scanWindow = (maxAhead: number, maxBehind: number) => {
      for (let d = 0; d <= Math.max(maxAhead, maxBehind); d++) {
        if (d <= maxAhead && this.available(this.center + dir * d)) return this.center + dir * d;
        if (d > 0 && d <= maxBehind && this.available(this.center - dir * d)) return this.center - dir * d;
      }
      return undefined;
    };
    const near = scanWindow(NEAR_FRAMES, Math.ceil(NEAR_FRAMES / 4));
    if (near !== undefined) return near;
    for (let i = 0; i < this.count; i += SKELETON_STRIDE) if (this.available(i)) return i;
    if (this.available(this.count - 1)) return this.count - 1;
    return scanWindow(this.ahead, this.behind);
  }

  private async fetchFrame(index: number): Promise<void> {
    this.fetching.add(index);
    try {
      const res = await fetch(frameUrl(this.pattern, index), { signal: this.abort.signal });
      if (!res.ok) {
        this.failed.add(index);
        return;
      }
      const blob = await res.blob();
      if (this.disposed) return;
      this.blobs[index] = blob;
      this.loadedCount++;
      this.loadedBytes += blob.size;
      this.onProgress?.({ loaded: this.loadedCount, total: this.count, bytes: this.loadedBytes });
      this.pump();
    } catch {
      if (!this.disposed) this.failed.add(index);
    } finally {
      this.fetching.delete(index);
    }
  }

  private async worker(): Promise<void> {
    while (!this.disposed) {
      const index = this.nextToFetch();
      if (index === undefined) {
        // Nada pendiente en la ventana: dormir hasta que el scroll la mueva.
        await new Promise<void>((resolve) => this.sleepers.push(resolve));
        continue;
      }
      await this.fetchFrame(index);
    }
  }

  private wakeWorkers(): void {
    const sleepers = this.sleepers;
    this.sleepers = [];
    for (const wake of sleepers) wake();
  }

  /** Inicia la descarga. Resuelve cuando el primer cuadro está decodificado. */
  async start(): Promise<void> {
    // El primer cuadro antes que nada, para reemplazar el póster cuanto antes.
    const res = await fetch(frameUrl(this.pattern, 0), { signal: this.abort.signal });
    const blob = await res.blob();
    this.blobs[0] = blob;
    this.loadedCount++;
    this.loadedBytes += blob.size;
    this.bitmaps.set(0, await createImageBitmap(blob));
    for (let i = 0; i < FETCH_CONCURRENCY; i++) void this.worker();
  }

  /**
   * Pide los cuadros cercanos a `center`, priorizando la dirección del scroll.
   * Llamar en cada frame de dibujo; es barato si nada cambió.
   */
  request(center: number, direction: number): void {
    if (center !== this.center || direction !== this.direction) {
      this.center = center;
      this.direction = direction;
      this.wakeWorkers();
    }
    const ahead = direction >= 0 ? 1 : -1;
    const list: number[] = [];
    // Si el cuadro exacto no llegó, decodificar el más cercano descargado.
    if (!this.blobs[center]) {
      const near = this.nearestLoaded(center);
      if (near !== undefined) list.push(near);
    }
    const span = 6;
    for (let k = 0; k <= span; k++) {
      const a = center + ahead * k;
      if (a >= 0 && a < this.count) list.push(a);
      if (k > 0 && k <= 2) {
        const b = center - ahead * k;
        if (b >= 0 && b < this.count) list.push(b);
      }
    }
    this.wanted = list;
    this.pump();
  }

  private nearestLoaded(index: number): number | undefined {
    for (let d = 1; d < this.count; d++) {
      if (this.blobs[index - d]) return index - d;
      if (this.blobs[index + d]) return index + d;
    }
    return undefined;
  }

  private pump(): void {
    while (this.activeDecodes < DECODE_CONCURRENCY) {
      const next = this.wanted.find(
        (i) => this.blobs[i] && !this.bitmaps.has(i) && !this.decoding.has(i),
      );
      if (next === undefined) return;
      this.decode(next);
    }
  }

  private decode(index: number): void {
    const blob = this.blobs[index];
    if (!blob) return;
    this.decoding.add(index);
    this.activeDecodes++;
    createImageBitmap(blob)
      .then((bmp) => {
        if (this.disposed) {
          bmp.close();
          return;
        }
        this.bitmaps.set(index, bmp);
        this.evict();
        this.onFrameReady?.();
      })
      .catch(() => {
        // Un cuadro dañado no frena la experiencia: se usa el vecino.
        this.blobs[index] = undefined;
      })
      .finally(() => {
        this.decoding.delete(index);
        this.activeDecodes--;
        if (!this.disposed) this.pump();
      });
  }

  private evict(): void {
    if (this.bitmaps.size <= this.cacheSize) return;
    const keep = new Set([...this.wanted, ...this.pinned]);
    // El más lejano a la zona pedida se va primero.
    const center = this.wanted[0] ?? 0;
    const candidates = [...this.bitmaps.keys()]
      .filter((i) => !keep.has(i))
      .sort((a, b) => Math.abs(b - center) - Math.abs(a - center));
    for (const i of candidates) {
      if (this.bitmaps.size <= this.cacheSize) break;
      this.bitmaps.get(i)?.close();
      this.bitmaps.delete(i);
    }
  }

  /** El cuadro exacto si está decodificado. */
  get(index: number): ImageBitmap | undefined {
    return this.bitmaps.get(index);
  }

  /** El cuadro decodificado más cercano a `index` (nunca vacío si hay alguno). */
  nearest(index: number): { index: number; bitmap: ImageBitmap } | null {
    const exact = this.bitmaps.get(index);
    if (exact) return { index, bitmap: exact };
    for (let d = 1; d < this.count; d++) {
      const a = this.bitmaps.get(index - d);
      if (a) return { index: index - d, bitmap: a };
      const b = this.bitmaps.get(index + d);
      if (b) return { index: index + d, bitmap: b };
    }
    return null;
  }

  /** Evita que la LRU libere los cuadros que están en pantalla. */
  pin(indices: number[]): void {
    this.pinned = new Set(indices);
  }

  dispose(): void {
    this.disposed = true;
    this.abort.abort();
    this.wakeWorkers();
    for (const bmp of this.bitmaps.values()) bmp.close();
    this.bitmaps.clear();
    this.blobs.length = 0;
    this.onFrameReady = null;
    this.onProgress = null;
  }
}

/** Detecta soporte de AVIF decodificando una imagen mínima. */
export function supportsAvif(): Promise<boolean> {
  const avif =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0);
    img.onerror = () => resolve(false);
    img.src = avif;
  });
}
