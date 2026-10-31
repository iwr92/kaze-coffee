/**
 * Mensajes del hero cinematográfico y su sincronía con el scroll.
 *
 * Pocos mensajes y bien compuestos: la apertura (titular + propuesta + CTA),
 * una línea editorial durante la transformación y el cierre con el CTA a la
 * colección. Los tiempos están en progreso (0 → 1) de la secuencia.
 */

export type MomentPlacement = "bottom" | "center";

/** Una línea del titular; `indent` (em) compone el escalonado editorial. */
export interface WindLine {
  text: string;
  indent: number;
}

export interface Moment {
  id: "despertar" | "transformacion" | "ritual";
  label: string;
  title: string;
  lines: readonly WindLine[];
  /** hero: titular de apertura · caption: línea editorial intermedia · close: cierre. */
  scale: "hero" | "caption" | "close";
  body?: string;
  /** Los CTAs del hero llevan a la colección dentro de la página. */
  cta?: { label: string; href: string };
  placement: MomentPlacement;
  enter?: readonly [number, number];
  exit?: readonly [number, number];
}

export const COLLECTION_ANCHOR = "#cafes";

export const MOMENTS: readonly Moment[] = [
  {
    id: "despertar",
    label: "Café de especialidad",
    title: "El café tiene otra forma de sentirse.",
    lines: [
      { text: "El café tiene", indent: 0 },
      { text: "otra forma", indent: 0.55 },
      { text: "de sentirse.", indent: 0.2 },
    ],
    scale: "hero",
    body: "Café de especialidad seleccionado para disfrutar a tu ritmo.",
    cta: { label: "Explorar cafés", href: COLLECTION_ANCHOR },
    placement: "bottom",
    exit: [0.07, 0.15],
  },
  {
    id: "transformacion",
    label: "Del grano a la taza",
    title: "Todo comienza con un buen grano.",
    lines: [
      { text: "Todo comienza", indent: 0 },
      { text: "con un buen grano.", indent: 0.6 },
    ],
    scale: "caption",
    placement: "bottom",
    enter: [0.3, 0.36],
    exit: [0.58, 0.64],
  },
  {
    id: "ritual",
    label: "Tu ritual",
    title: "Tu momento. Tu café.",
    lines: [
      { text: "Tu momento.", indent: 0 },
      { text: "Tu café.", indent: 0.9 },
    ],
    scale: "close",
    body: "Elegí el café que va con tu forma de disfrutarlo.",
    cta: { label: "Explorar cafés", href: COLLECTION_ANCHOR },
    placement: "center",
    enter: [0.84, 0.91],
  },
] as const;

/** Etiquetas del indicador de progreso: una por mensaje. */
export const CHAPTERS = ["El grano", "La transformación", "Tu taza"] as const;
