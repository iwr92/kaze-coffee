import { CHAPTERS } from "@/cinematic/moments";

/**
 * Indicador discreto: una línea fina que se llena con el scroll y cuatro
 * marcas para los cuatro momentos. GSAP escribe directamente en el DOM
 * (`--kz-progress` y `data-active`); React no se entera en cada cuadro.
 */
export function ScrollProgress() {
  return (
    <div className="scroll-progress pointer-events-none" aria-hidden data-scroll-progress="" data-active="0">
      <div className="scroll-progress-track">
        <div className="scroll-progress-fill" />
      </div>
      <ol className="scroll-progress-marks">
        {CHAPTERS.map((chapter, i) => (
          <li key={chapter} data-chapter={i} className="scroll-progress-mark">
            <span className="scroll-progress-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="scroll-progress-name">{chapter}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
