/**
 * Textos HTML reales que acompañan cada escena. Su visibilidad la anima la
 * misma línea de tiempo de GSAP que mueve la escena 3D (ver
 * useScrollChoreography), así texto y WebGL nunca se desincronizan.
 */
export function StoryBeats() {
  return (
    <>
      {/* Escena 01 — The Awakening */}
      <div
        data-beat="hero"
        className="theme-negro absolute inset-0 flex flex-col justify-end px-4 pb-12 pt-28 md:px-12 md:pb-16"
      >
        <p className="t-label text-[var(--ink-muted)]">Café de especialidad</p>
        <h1 className="t-display-xl mt-3 max-w-[12ch] text-[var(--ink)]">
          El viento trae el aroma antes que la taza.
        </h1>
        <p className="t-body-lg mt-6 max-w-[40ch] text-[var(--ink-muted)]">
          Elegimos cafés de distintos tostadores y te los acercamos frescos, para que los
          prepares a tu ritmo.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a href="#cafes" className="btn btn-primary">
            Descubrí nuestros cafés
          </a>
          <span className="t-caption text-[var(--ink-muted)]" aria-hidden>
            Deslizá para seguir el aroma
          </span>
        </div>
      </div>

      {/* Escena 02 — The Transformation */}
      <div
        data-beat="transformation"
        className="beat-hidden theme-negro absolute inset-x-0 top-0 px-4 pt-28 md:inset-y-0 md:flex md:flex-col md:justify-center md:px-12 md:pt-0"
      >
        <p className="t-label text-[var(--ink-muted)]">Molienda</p>
        <h2 className="t-display mt-3 max-w-[12ch] text-[var(--ink)]">Cada café, a su medida.</h2>
        <p className="t-body-lg mt-5 max-w-[34ch] text-[var(--ink-muted)]">
          Lo pedís en grano o molido para tu método: espresso, filtro, moka o prensa francesa.
        </p>
      </div>

      {/* Escena 03 — The Flow */}
      <div
        data-beat="flow"
        className="beat-hidden theme-negro absolute inset-x-0 top-0 px-4 pt-28 md:inset-y-0 md:left-auto md:right-0 md:flex md:w-[46%] md:flex-col md:justify-center md:px-12 md:pt-0"
      >
        <p className="t-label text-[var(--ink-muted)]">Origen</p>
        <h2 className="t-display mt-3 max-w-[12ch] text-[var(--ink)]">El aroma llega primero.</h2>
        <p className="t-body-lg mt-5 max-w-[34ch] text-[var(--ink-muted)]">
          Granos de origen trazable, tostados en pequeños lotes y enviados frescos.
        </p>
      </div>

      {/* Escena 04 — The Ritual */}
      <div
        data-beat="ritual"
        className="beat-hidden absolute inset-x-0 top-0 px-4 pt-28 md:inset-y-0 md:flex md:w-[52%] md:flex-col md:justify-center md:px-12 md:pt-0"
      >
        <h2 className="t-display max-w-[11ch] text-[var(--ink)]">Café de especialidad, a tu ritmo.</h2>
        <div className="mt-8">
          <a href="#cafes" className="btn btn-primary">
            Descubrí nuestros cafés
          </a>
        </div>
      </div>
    </>
  );
}
