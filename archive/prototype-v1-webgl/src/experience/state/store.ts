/**
 * Estado compartido entre el DOM (GSAP/ScrollTrigger) y la escena WebGL.
 *
 * Es un objeto mutable a propósito: se escribe desde ScrollTrigger y desde
 * los listeners del puntero, y se lee dentro de useFrame. Nunca pasa por
 * estado de React, así que no provoca renders por frame.
 */
export interface ExperienceStore {
  /** Progreso de la coreografía, 0 → 1, ya suavizado por el scrub de GSAP. */
  progress: number;
  /** Puntero normalizado (-1 → 1), objetivo sin amortiguar. */
  pointer: { x: number; y: number };
  /** Si hubo actividad reciente del puntero (en táctil queda en false). */
  pointerActive: boolean;
}

export const store: ExperienceStore = {
  progress: 0,
  pointer: { x: 0, y: 0 },
  pointerActive: false,
};
