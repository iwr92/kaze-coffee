"use client";

import { useEffect, useRef } from "react";

/**
 * Versión sin WebGL (o con movimiento reducido). Mismo relato y mismos CTAs,
 * con el motivo de ráfagas de la portada del manual
 * (brand/aplicaciones/portada.html) en lugar de la escena 3D.
 */
export function StaticExperience() {
  const heroRef = useRef<HTMLElement>(null);

  // Encabezado: firma crema sobre el hero negro, firma negra después.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const root = document.documentElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const onHero = entry.intersectionRatio > 0.12;
        root.dataset.tone = onHero ? "negro" : "crema";
        root.dataset.solid = onHero ? "false" : "true";
      },
      { threshold: [0, 0.12, 0.5, 1] },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section ref={heroRef} id="top" className="theme-negro relative z-10 flex min-h-svh flex-col justify-end overflow-hidden bg-[var(--surface)] px-4 pb-12 pt-28 md:px-12 md:pb-16">
        <svg
          aria-hidden
          viewBox="0 0 480 288"
          className="pointer-events-none absolute right-0 top-24 w-[min(640px,90vw)] md:top-1/2 md:-translate-y-1/2"
        >
          <rect x="112" y="0" width="256" height="256" fill="var(--surface-raised)" />
          <rect x="384" y="192" width="64" height="64" fill="var(--accent)" />
          {[
            [208, 48, 160, 104],
            [160, 72, 208, 56],
            [256, 96, 112, 104],
            [184, 120, 184, 80],
            [232, 144, 136, 32],
          ].map(([x, y, inner, outer]) => (
            <g key={y}>
              <rect x={x} y={y} width={inner} height="8" rx="4" fill="var(--surface)" />
              <rect x="376" y={y} width={outer} height="8" rx="4" fill="var(--ink)" />
            </g>
          ))}
        </svg>
        <div className="relative">
          <p className="t-label text-[var(--ink-muted)]">Café de especialidad</p>
          <h1 className="t-display-xl mt-3 max-w-[12ch] text-[var(--ink)]">
            El viento trae el aroma antes que la taza.
          </h1>
          <p className="t-body-lg mt-6 max-w-[40ch] text-[var(--ink-muted)]">
            Elegimos cafés de distintos tostadores y te los acercamos frescos, para que los
            prepares a tu ritmo.
          </p>
          <div className="mt-8">
            <a href="#cafes" className="btn btn-primary">
              Descubrí nuestros cafés
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[var(--surface)] px-4 py-24 md:px-12 md:py-32">
        <h2 className="t-display max-w-[11ch] text-[var(--ink)]">Café de especialidad, a tu ritmo.</h2>
        <p className="t-body-lg mt-5 max-w-[40ch] text-[var(--ink-muted)]">
          Lo pedís en grano o molido para tu método. Granos de origen trazable, tostados en
          pequeños lotes y enviados frescos.
        </p>
      </section>
    </>
  );
}
