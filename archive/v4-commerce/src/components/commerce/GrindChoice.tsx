"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { GRIND_LABELS } from "@/commerce/products";
import { grindAvailability } from "@/config/grind";
import { EditorialImage } from "../editorial/EditorialImage";

/**
 * A tu manera — en grano o molido, solo con opciones confirmadas.
 * Hoy está confirmado "en grano" (manual de marca). El molido figura como
 * pendiente hasta que un producto real lo declare en el catálogo.
 */
export function GrindChoice() {
  const ref = useRef<HTMLElement>(null);
  const { confirmed, groundConfirmed } = grindAvailability();
  const ground = confirmed.filter((g) => g !== "grano");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".gc-title .kz-line-inner",
        { yPercent: 112 },
        { yPercent: 0, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: ".gc-title", start: "top 85%" } },
      );
      gsap.fromTo(
        ".gc-media",
        { clipPath: "inset(0% 0% 0% 22%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".gc-media", start: "top 90%", end: "top 40%", scrub: 0.6 } },
      );
      gsap.fromTo(
        ".gc-media img",
        { scale: 1.14 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: ".gc-media", start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        ".gc-option",
        { autoAlpha: 0, x: -24 },
        { autoAlpha: 1, x: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".gc-options", start: "top 85%" } },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} id="a-tu-manera" aria-labelledby="gc-title" className="grind-choice relative z-10 bg-pearl">
      <div className="gc-grid">
        <div className="gc-copy">
          <p className="t-label text-ink-muted">En grano o molido</p>
          <h2 id="gc-title" className="gc-title kz-wind mt-4 text-ink" aria-label="A tu manera.">
            <span className="kz-line" aria-hidden>
              <span className="kz-line-air">
                <span className="kz-line-inner">A tu manera.</span>
              </span>
            </span>
          </h2>
          <p className="t-body-lg mt-6 max-w-[34ch] text-ink-muted">
            Cada café indica cómo podés recibirlo. Elegilo según cómo lo preparás en casa.
          </p>

          <ul className="gc-options" aria-label="Opciones de molienda">
            <li className="gc-option">
              <div className="gc-option-head">
                <h3 className="gc-option-name">En grano</h3>
                <span className="gc-state gc-state-ok">Disponible</span>
              </div>
              <p className="t-body text-ink-muted">Entero, para molerlo justo antes de preparar y conservar mejor su aroma.</p>
            </li>
            <li className="gc-option">
              <div className="gc-option-head">
                <h3 className="gc-option-name">Molido</h3>
                <span className={`gc-state ${groundConfirmed ? "gc-state-ok" : "gc-state-pending"}`}>
                  {groundConfirmed ? "Disponible" : "Por confirmar"}
                </span>
              </div>
              <p className="t-body text-ink-muted">
                {groundConfirmed
                  ? ground.map((g) => GRIND_LABELS[g]).join(" · ")
                  : "Las moliendas por método se van a indicar en cada café cuando estén confirmadas."}
              </p>
            </li>
          </ul>

          <a href={COLLECTION_ANCHOR} className="btn btn-ghost mt-10">
            Ver los cafés
          </a>
        </div>

        <figure className="gc-media">
          <EditorialImage
            id="ruptura-macro"
            alt="Granos de café tostado abriéndose en molienda en el aire."
            sizes="(max-width: 767px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
