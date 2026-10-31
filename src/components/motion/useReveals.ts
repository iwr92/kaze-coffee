"use client";

import { useEffect, type RefObject } from "react";
import { DURATION, gsap } from "./ease";

/**
 * Coreografía declarativa, igual en todo el sitio (solo con movimiento):
 *
 *   data-reveal="words"   KineticTitle: cada palabra sube desde su máscara
 *   data-reveal="mask"    imagen: se abre como una ventana y se asienta
 *   data-reveal="wipe"    imagen: se abre de izquierda a derecha, atada al scroll
 *   data-reveal="fade"    bloque: aparece con un desplazamiento corto
 *   data-parallax="6"     desplazamiento sutil (%) mientras cruza la pantalla
 *   [data-wind]           ráfagas SVG: se dibujan con el scroll y los granos
 *                         recorren la primera curva
 *
 * Sin JS o con movimiento reducido todo se ve en su lugar: el CSS nunca
 * oculta contenido por su cuenta.
 */
export function useReveals(ref: RefObject<HTMLElement | null>, extra?: (root: HTMLElement) => void | (() => void)) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll<HTMLElement>('[data-reveal="words"]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll(".kt-word"),
          { yPercent: 115, rotate: 4 },
          {
            yPercent: 0,
            rotate: 0,
            duration: DURATION.reveal,
            ease: "kz",
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: "top 86%" },
          },
        );
      });
      root.querySelectorAll<HTMLElement>('[data-reveal="mask"]').forEach((el) => {
        const img = el.querySelector("img, .reveal-inner");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 84%" } });
        tl.fromTo(el, { clipPath: "inset(12% 12% 12% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "kz" });
        if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.3, ease: "kz" }, 0);
      });
      root.querySelectorAll<HTMLElement>('[data-reveal="wipe"]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 88%", end: "top 35%", scrub: 0.6 },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]', root).forEach((el, i) => {
        // Solo opacidad (no autoAlpha): visibility: hidden sacaría los botones
        // del orden de tabulación hasta que se scrollea hasta ellos.
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: "kz", delay: (i % 4) * 0.06, scrollTrigger: { trigger: el, start: "top 90%" } },
        );
      });
      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax) || 5;
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      root.querySelectorAll<SVGSVGElement>("svg[data-wind]").forEach((svg) => animateWind(svg));
      return extra?.(root);
    });
    return () => mm.revert();
    // `extra` se define en cada render; la sección se arma una sola vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

/** Ráfagas: las curvas se dibujan con el scroll y los granos las recorren. */
export function animateWind(svg: SVGSVGElement, trigger: Element = svg) {
  const paths = svg.querySelectorAll<SVGPathElement>(".wind-path");
  const grains = svg.querySelectorAll<SVGGElement>(".wind-grain");
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger, start: "top 90%", end: "bottom 20%", scrub: 0.8 },
  });
  tl.fromTo(paths, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.6, stagger: 0.08 }, 0);
  const guide = paths[0];
  if (guide && grains.length) {
    // Posición = función pura del progreso: reversible y correcta desde el inicio.
    const length = guide.getTotalLength();
    const offsets = Array.from(grains, (_, i) => 0.04 + (i / grains.length) * 0.3);
    const state = { p: 0 };
    const place = () => {
      grains.forEach((g, i) => {
        const at = Math.min(0.98, offsets[i] + state.p * 0.62) * length;
        const a = guide.getPointAtLength(at);
        const b = guide.getPointAtLength(Math.min(length, at + 4));
        const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        g.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${angle})`);
        g.setAttribute("data-placed", "");
      });
    };
    place();
    tl.to(state, { p: 1, duration: 1, onUpdate: place }, 0);
  }
  return tl;
}
