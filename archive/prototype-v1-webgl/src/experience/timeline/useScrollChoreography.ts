"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type RefObject } from "react";
import { store } from "../state/store";
import { BEATS, headerTone } from "./choreography";

gsap.registerPlugin(ScrollTrigger);

function setTone(tone: "negro" | "crema") {
  const root = document.documentElement;
  if (root.dataset.tone !== tone) root.dataset.tone = tone;
}

/**
 * Línea de tiempo central. Un solo ScrollTrigger con scrub controla:
 *  - `store.progress`, que lee la escena WebGL en cada frame;
 *  - la entrada y salida de los textos HTML;
 *  - el tono del encabezado.
 * La duración de la timeline es 1, así su progreso es el de la coreografía.
 */
export function useScrollChoreography(
  sectionRef: RefObject<HTMLElement | null>,
  onActiveChange: (active: boolean) => void,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
        },
        onUpdate: () => {
          const p = tl.progress();
          store.progress = p;
          setTone(headerTone(p));
        },
      });

      // Duración total = 1.
      tl.to({}, { duration: 1 }, 0);

      const span = (r: readonly [number, number]) => r[1] - r[0];

      tl.to(
        '[data-beat="hero"]',
        { autoAlpha: 0, y: -28, duration: span(BEATS.heroOut) },
        BEATS.heroOut[0],
      );

      for (const key of ["transformation", "flow"] as const) {
        const beat = BEATS[key];
        const sel = `[data-beat="${key}"]`;
        tl.fromTo(
          sel,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: span(beat.in) },
          beat.in[0],
        );
        tl.to(sel, { autoAlpha: 0, y: -28, duration: span(beat.out) }, beat.out[0]);
      }

      tl.fromTo(
        '[data-beat="ritual"]',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: span(BEATS.ritual.in) },
        BEATS.ritual.in[0],
      );

      // Fondo sólido del encabezado solo cuando el contenido pasa por debajo.
      ScrollTrigger.create({
        trigger: section,
        start: "bottom 96px",
        onToggle: (self) => {
          document.documentElement.dataset.solid = self.isActive ? "true" : "false";
        },
      });

      // El Canvas solo renderiza mientras la sección está en pantalla.
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => onActiveChange(self.isActive),
      });
    }, section);

    return () => {
      ctx.revert();
      store.progress = 0;
    };
  }, [sectionRef, onActiveChange]);
}
