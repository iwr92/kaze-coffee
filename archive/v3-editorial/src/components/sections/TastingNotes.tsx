"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useScene } from "../motion/useScene";
import { WindLines } from "../type/WindLines";

/**
 * Sensaciones concretas, como pide el manual ("chocolate amargo, mandarina,
 * panela"). Ilustran el estilo con el que se describe cada café; no son las
 * notas de un producto en particular.
 */
const ROWS = [
  ["chocolate amargo", "mandarina", "jazmín", "panela", "miel"],
  ["cacao", "durazno", "bergamota", "caramelo", "frutos rojos"],
  ["nuez", "naranja", "flores blancas", "azúcar mascabo", "ciruela"],
];

/**
 * Notas — el aroma llega primero. Las palabras viajan con el viento en
 * hileras alternas; si el scroll acelera, el viento sopla más fuerte.
 */
export function TastingNotes() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root) => {
    const loops = gsap.utils.toArray<HTMLElement>(".notes-track", root).map((track, i) =>
      gsap.fromTo(
        track,
        { xPercent: i % 2 ? -50 : 0 },
        { xPercent: i % 2 ? 0 : -50, duration: 46 + i * 9, ease: "none", repeat: -1 },
      ),
    );

    // Ráfagas: la velocidad del scroll acelera las hileras y luego se calma.
    let gust = 1;
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
      onUpdate: (self) => {
        gust = Math.min(7, 1 + Math.abs(self.getVelocity()) / 260);
      },
    });
    const tick = () => {
      gust += (1 - gust) * 0.05;
      loops.forEach((l) => l.timeScale(gust));
    };
    gsap.ticker.add(tick);

    gsap.fromTo(
      ".notes-heading .kz-line-inner",
      { yPercent: 112 },
      { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.08, scrollTrigger: { trigger: ".notes-heading", start: "top 80%" } },
    );

    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
    };
  });

  return (
    <section ref={ref} id="notas" aria-label="Notas de cata" className="notes relative z-10 overflow-hidden bg-pearl">
      <div className="notes-head">
        <WindLines
          label="El aroma llega primero."
          lines={[
            { text: "El aroma", indent: 1.4 },
            { text: "llega primero.", indent: 0 },
          ]}
          className="notes-heading kz-mono-lg text-ink"
        />
        <p className="notes-caption t-body-lg max-w-[30ch] text-ink-muted">
          Así describimos cada café: con sensaciones concretas, no con superlativos.
        </p>
      </div>

      <div className="notes-rows" aria-label="Ejemplos de notas de cata">
        {ROWS.map((row, i) => (
          <div key={i} className={`notes-row notes-row-${i}`}>
            <div className="notes-track">
              {/* La hilera se repite para que el bucle no tenga costura. */}
              {[0, 1].map((copy) => (
                <ul key={copy} className="notes-list" aria-hidden={copy === 1 || undefined}>
                  {row.map((word) => (
                    <li key={word} className="notes-word">
                      {word}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
