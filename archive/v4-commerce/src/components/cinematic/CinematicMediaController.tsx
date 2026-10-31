"use client";

import { useEffect, useRef } from "react";
import { computeFraming, type DrawRect } from "@/cinematic/framing";
import { FrameSequence, supportsAvif } from "@/cinematic/FrameSequence";
import { SEQUENCE_BASE, type SequenceManifest, type VariantId } from "@/cinematic/manifest";
import { cinematicProgress } from "@/cinematic/progress";

const PEARL = "#f7f5f0";

/**
 * Límites por variante, para cuidar memoria y rendimiento:
 *  - maxDpr: densidad máxima del canvas. En móvil se llega a 3 (la auditoría
 *    midió +16 % de nitidez frente a dibujar a 2 y dejar que el compositor estire).
 *  - maxCanvasPixels: tope de píxeles del canvas; si se supera, baja el DPR.
 *  - bitmapBudget: memoria para cuadros decodificados (ancho × alto × 4 bytes c/u).
 */
const PROFILES: Record<VariantId, { maxDpr: number; maxCanvasPixels: number; bitmapBudget: number }> = {
  desktop: { maxDpr: 2, maxCanvasPixels: 8_300_000, bitmapBudget: 100 * 2 ** 20 },
  mobile: { maxDpr: 3, maxCanvasPixels: 3_300_000, bitmapBudget: 48 * 2 ** 20 },
  lite: { maxDpr: 2, maxCanvasPixels: 1_600_000, bitmapBudget: 24 * 2 ** 20 },
};

/** DPR efectivo del canvas: el del dispositivo, acotado por perfil y por píxeles. */
export function canvasDpr(variant: VariantId, cssW: number, cssH: number, deviceDpr: number): number {
  const profile = PROFILES[variant];
  let dpr = Math.min(deviceDpr || 1, profile.maxDpr);
  const pixels = cssW * cssH * dpr * dpr;
  if (pixels > profile.maxCanvasPixels) dpr = Math.sqrt(profile.maxCanvasPixels / (cssW * cssH));
  return Math.max(1, dpr);
}

interface CinematicMediaControllerProps {
  manifest: SequenceManifest;
  variant: VariantId;
  /** Si es false, el bucle de dibujo se detiene (sección fuera de pantalla). */
  active: boolean;
  onFirstFrame?: () => void;
}

/**
 * Escenario visual persistente: un único <canvas> donde se dibuja el cuadro
 * que corresponde al progreso de scroll. Si el cuadro pedido no está listo
 * muestra el más cercano: nunca hay flashes ni pantallas vacías.
 *
 * No se funden cuadros vecinos: con movimiento rápido (los granos que caen)
 * la mezcla produce imágenes fantasma. Se prioriza la nitidez.
 */
export function CinematicMediaController({
  manifest,
  variant,
  active,
  onFirstFrame,
}: CinematicMediaControllerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const sequenceRef = useRef<FrameSequence | null>(null);
  const dirtyRef = useRef(true);
  const activeRef = useRef(active);
  const wakeRef = useRef<(() => void) | null>(null);
  const firstFrameRef = useRef(onFirstFrame);
  firstFrameRef.current = onFirstFrame;

  useEffect(() => {
    activeRef.current = active;
    if (active) wakeRef.current?.();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const v = manifest.variants[variant];
    let disposed = false;
    let raf = 0;
    let sequence: FrameSequence | null = null;
    let firstDrawn = false;
    let lastPosition = -1;
    let lastDirection = 1;
    const rect: DrawRect = { x: 0, y: 0, width: 0, height: 0, featherTop: false, featherBottom: false };
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let topFeather: CanvasGradient | null = null;
    let bottomFeather: CanvasGradient | null = null;

    const resize = () => {
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      dpr = canvasDpr(variant, cssW, cssH, window.devicePixelRatio);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      topFeather = bottomFeather = null;
      // El póster usa el mismo encuadre que el canvas: sin salto al reemplazarlo.
      const img = posterRef.current;
      if (img && cssW > 0) {
        computeFraming(cssW, cssH, v.width / v.height, cinematicProgress.value, rect);
        Object.assign(img.style, {
          left: `${rect.x}px`,
          top: `${rect.y}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          objectFit: "fill",
        });
      }
      dirtyRef.current = true;
      wake();
    };

    const draw = () => {
      raf = 0;
      if (disposed || !sequence) return;
      const progress = cinematicProgress.value;
      // Posición continua en cuadros de esta variante.
      const position = progress * (sequence.count - 1);
      if (Math.round(position) !== Math.round(lastPosition) || lastPosition < 0) {
        if (lastPosition >= 0) lastDirection = position >= lastPosition ? 1 : -1;
        dirtyRef.current = true;
      }
      lastPosition = position;
      const base = Math.round(position);
      sequence.request(base, lastDirection);

      if (dirtyRef.current) {
        dirtyRef.current = false;
        const a = sequence.nearest(base);
        if (a) {
          computeFraming(cssW, cssH, sequence.aspect, progress, rect);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = PEARL;
          ctx.fillRect(0, 0, cssW, cssH);
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(a.bitmap, rect.x, rect.y, rect.width, rect.height);
          sequence.pin([a.index]);
          // Si el cuadro exacto no estaba, volver a dibujar cuando llegue.
          if (a.index !== base) dirtyRef.current = true;

          if (rect.featherTop || rect.featherBottom) {
            const band = Math.min(rect.height * 0.22, 140);
            if (rect.featherTop) {
              if (!topFeather) {
                topFeather = ctx.createLinearGradient(0, rect.y, 0, rect.y + band);
                topFeather.addColorStop(0, PEARL);
                topFeather.addColorStop(1, "rgba(247,245,240,0)");
              }
              ctx.fillStyle = topFeather;
              ctx.fillRect(0, rect.y - 1, cssW, band + 1);
            }
            if (rect.featherBottom) {
              const y1 = rect.y + rect.height;
              if (!bottomFeather) {
                bottomFeather = ctx.createLinearGradient(0, y1 - band, 0, y1);
                bottomFeather.addColorStop(0, "rgba(247,245,240,0)");
                bottomFeather.addColorStop(1, PEARL);
              }
              ctx.fillStyle = bottomFeather;
              ctx.fillRect(0, y1 - band, cssW, band + 1);
            }
          }

          if (!firstDrawn) {
            firstDrawn = true;
            // El canvas opaco es negro antes del primer dibujo: se muestra recién ahora.
            canvas.style.opacity = "1";
            firstFrameRef.current?.();
          }
        }
      }
      if (activeRef.current) raf = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    resize();

    (async () => {
      const avif = Boolean(v.formats.avif) && (await supportsAvif());
      if (disposed) return;
      // Caché de cuadros decodificados según presupuesto de memoria (mín. 10: la
      // ventana pedida alrededor de la posición es de 9 cuadros).
      const perBitmap = v.width * v.height * 4;
      const cacheSize = Math.max(10, Math.floor(PROFILES[variant].bitmapBudget / perBitmap));
      sequence = new FrameSequence(v, avif ? "avif" : "webp", { cacheSize });
      sequenceRef.current = sequence;
      sequence.onFrameReady = () => {
        dirtyRef.current = true;
        wake();
      };
      try {
        await sequence.start();
      } catch {
        // Si falla la red, el póster queda visible debajo del canvas.
        return;
      }
      dirtyRef.current = true;
      wake();
    })();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      wakeRef.current = null;
      sequence?.dispose();
      sequenceRef.current = null;
    };
  }, [manifest, variant]);

  const poster = manifest.variants[variant].posters[0];

  return (
    <div className="absolute inset-0 bg-pearl" aria-hidden>
      {/* Póster del primer cuadro: visible al instante, sin esperar al motor. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={posterRef}
        src={SEQUENCE_BASE + poster}
        alt=""
        className="cinematic-poster absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "60% 50%" }}
        fetchPriority="high"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} />
    </div>
  );
}
