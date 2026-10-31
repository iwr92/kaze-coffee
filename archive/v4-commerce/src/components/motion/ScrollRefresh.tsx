"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

/**
 * Las medidas de las coreografías dependen de las fuentes (la línea del
 * manifiesto se mide en píxeles reales). Al terminar de cargar, se recalculan.
 */
export function ScrollRefresh() {
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
