"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Coreografía de una sección. `build` corre solo sin movimiento reducido,
 * dentro de un gsap.context acotado a la sección: al desmontar se revierte
 * todo (tweens, ScrollTriggers, pines y listeners que devuelva).
 *
 * Sin movimiento, la sección muestra su composición estática (el CSS por
 * defecto es la versión quieta; `data-motion` habilita la cinética).
 */
export function useScene(
  ref: RefObject<HTMLElement | null>,
  build: (root: HTMLElement, mobile: boolean) => void | (() => void),
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 767px)",
      },
      (context) => {
        const { motion, mobile } = context.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        root.dataset.motion = "on";
        const cleanup = build(root, mobile);
        return () => {
          delete root.dataset.motion;
          cleanup?.();
        };
      },
    );
    return () => mm.revert();
    // `build` se define en cada render; la sección se arma una sola vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
