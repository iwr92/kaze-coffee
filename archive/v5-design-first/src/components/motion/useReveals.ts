"use client";

import { useEffect, type RefObject } from "react";
import { DURATION, gsap } from "./ease";

/**
 * Revelados editoriales declarativos, iguales en todo el sitio:
 *
 *   data-reveal="lines"   titular: cada .kz-line-inner sube desde su máscara
 *   data-reveal="mask"    imagen: se abre como una ventana y se asienta
 *   data-reveal="fade"    texto o bloque: aparece con un desplazamiento corto
 *   data-parallax="6"     desplazamiento sutil (en %) mientras cruza la pantalla
 *
 * Solo con movimiento permitido. Sin JS o con movimiento reducido, todo se ve
 * en su lugar desde el principio (el CSS nunca oculta contenido).
 */
export function useReveals(ref: RefObject<HTMLElement | null>, extra?: (root: HTMLElement) => void | (() => void)) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll(".kz-line-inner"),
          { yPercent: 112, y: 0 },
          { yPercent: 0, y: 0, duration: DURATION.reveal, ease: "kz", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 86%" } },
        );
      });
      root.querySelectorAll<HTMLElement>('[data-reveal="mask"]').forEach((el) => {
        const img = el.querySelector("img, canvas, .reveal-inner");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 84%" } });
        tl.fromTo(el, { clipPath: "inset(10% 10% 10% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "kz" });
        if (img) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.2, ease: "kz" }, 0);
      });
      const fades = gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]', root);
      revealFades(fades);
      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax) || 5;
        gsap.fromTo(
          el,
          { yPercent: -amount },
          { yPercent: amount, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
      return extra?.(root);
    });
    return () => mm.revert();
    // `extra` se define en cada render; la sección se arma una sola vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

/**
 * Aparición escalonada de los bloques que entran juntos a la pantalla.
 * Solo opacidad (no autoAlpha): con visibility: hidden el navegador saca los
 * botones del orden de tabulación hasta que se scrollea hasta ellos.
 */
function revealFades(els: HTMLElement[]) {
  els.forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "kz",
        delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: "top 90%" },
      },
    );
  });
}
