"use client";

import gsap from "gsap";
import { useRef } from "react";
import { EditorialImage } from "../editorial/EditorialImage";
import { useScene } from "../motion/useScene";

/**
 * Viento — el concepto de marca en una sola línea monumental.
 * La sección se fija y el scroll se vuelve viento: la frase cruza la
 * pantalla de derecha a izquierda mientras el grano se abre detrás.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root, mobile) => {
    const line = root.querySelector<HTMLElement>(".manifesto-line")!;
    const stage = root.querySelector<HTMLElement>(".manifesto-stage")!;
    const distance = () => line.scrollWidth - window.innerWidth + (mobile ? 40 : 96);

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${distance() * (mobile ? 1.1 : 0.9)}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(line, { x: () => window.innerWidth * 0.35 }, { x: () => -distance() }, 0)
      .fromTo(".manifesto-image", { scale: 0.86, yPercent: 8 }, { scale: 1.04, yPercent: -4 }, 0)
      .fromTo(".manifesto-note", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.55);
  });

  return (
    <section ref={ref} id="viento" aria-labelledby="manifesto-title" className="manifesto relative z-10 bg-pearl">
      <div className="manifesto-stage relative flex min-h-svh flex-col justify-center overflow-hidden">
        <p className="manifesto-kicker t-label text-ink-muted">
          Kaze <span lang="ja">風</span> significa viento
        </p>
        <div className="manifesto-image" aria-hidden>
          <EditorialImage
            id="ruptura-macro"
            alt=""
            sizes="(max-width: 767px) 78vw, 40vw"
            className="h-full w-full object-cover"
          />
        </div>
        <h2 id="manifesto-title" className="manifesto-line kz-display text-ink">
          El viento trae el aroma antes que la taza.
        </h2>
        <p className="manifesto-note t-body-lg max-w-[30ch] text-ink-muted">
          Vendemos café que se siente antes de probarlo.
        </p>
      </div>
    </section>
  );
}
