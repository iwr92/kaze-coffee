/**
 * Progreso de la experiencia (0 → 1). Lo escribe la línea de tiempo de GSAP
 * y lo lee el bucle de dibujo del canvas. Es un objeto mutable: nunca pasa
 * por estado de React, así no hay renders por cuadro.
 */
export const cinematicProgress = { value: 0 };
