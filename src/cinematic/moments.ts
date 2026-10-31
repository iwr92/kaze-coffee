/**
 * Anclas y capítulos del hero.
 *
 * V5: la composición del hero es fija (titular, propuesta y CTAs); la
 * secuencia de café vive en un panel contenido y su avance se indica con
 * tres capítulos discretos. Los tiempos están en progreso (0 → 1).
 */

export const COLLECTION_ANCHOR = "#cafes";
export const BRAND_ANCHOR = "#kaze";

/** Capítulos de la secuencia (es una transformación real, en orden). */
export const CHAPTERS = ["Grano", "Molienda", "Taza"] as const;
export const CHAPTER_STARTS = [0, 0.3, 0.7] as const;
