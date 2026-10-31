"use client";

import { useRef } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { EditorialImage } from "../editorial/EditorialImage";
import { gsap, ScrollTrigger } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";

/** Pasos de preparación (orientación general, en orden real). */
const STEPS = [
  { title: "Molé justo antes", text: "Si lo elegís en grano, molelo en el momento: ahí está el aroma." },
  { title: "Agua caliente, sin hervir", text: "Esperá unos segundos después del hervor para no quemar el café." },
  { title: "Esperá el aroma", text: "El viento trae el aroma antes que la taza." },
];

/**
 * The Ritual — deseo de preparar café en casa.
 * La fotografía crece desde una ventana hasta casi todo el ancho mientras
 * scrolleás (sin fijar la página) y un vapor SVG sube sobre la taza.
 */
export function Ritual() {
  const ref = useRef<HTMLElement>(null);
  useReveals(ref, (root) => {
    const media = root.querySelector(".ritual-media");
    if (!media) return;
    gsap.fromTo(
      media,
      { clipPath: "inset(14% 22% 14% 30% round 2px)" },
      { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: media, start: "top 90%", end: "center 55%", scrub: 0.6 } },
    );
    // Vapor: cada trazo sube y se desvanece en bucle, solo mientras se ve.
    const steam = gsap.utils.toArray<SVGPathElement>(".ritual-steam path", root);
    const loops = steam.map((p, i) =>
      gsap.fromTo(
        p,
        { drawSVG: "0% 0%", opacity: 0, y: 30 },
        { drawSVG: "0% 100%", opacity: 0.55, y: -20, duration: 3.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.9 },
      ),
    );
    ScrollTrigger.create({
      trigger: media,
      start: "top bottom",
      end: "bottom top",
      onToggle: (s) => loops.forEach((l) => (s.isActive ? l.play() : l.pause())),
    });
  });

  return (
    <section ref={ref} id="ritual" aria-labelledby="ritual-title" className="ritual relative z-10">
      <div className="ritual-stage">
        <figure className="ritual-media">
          <div className="ritual-media-inner" data-parallax="4">
            <span className="hidden md:block">
              <EditorialImage
                id="ritual-amplio"
                alt="Una taza de vidrio de doble pared con café recién servido, con vapor, sobre una mesa clara."
                sizes="90vw"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="md:hidden">
              <EditorialImage
                id="ritual-vertical"
                alt="Una taza de vidrio de doble pared con café recién servido, con vapor."
                sizes="100vw"
                className="h-full w-full object-cover"
              />
            </span>
          </div>
          <svg className="ritual-steam" viewBox="0 0 120 220" aria-hidden>
            <path d="M40 210 C 20 170, 62 140, 42 100 S 58 40, 46 6" />
            <path d="M62 210 C 82 168, 44 138, 66 96 S 50 38, 64 4" />
            <path d="M82 210 C 70 176, 96 150, 80 112 S 90 58, 82 20" />
          </svg>
        </figure>

        <div className="ritual-copy">
          <KineticTitle
            id="ritual-title"
            className="ritual-title"
            reveal="words"
            lines={[
              { text: "Tu taza,", voice: "serif" },
              { text: "a tu tiempo.", voice: "italic", indent: 0.4 },
            ]}
          />
          <p className="ritual-lead" data-reveal="fade">
            Elegí un café de especialidad, preparalo como te gusta y tomate el momento. El ritual empieza antes del
            primer sorbo.
          </p>
          <a href={COLLECTION_ANCHOR} className="btn btn-primary btn-lg" data-reveal="fade">
            Explorar cafés
          </a>
        </div>
      </div>

      <ol className="ritual-steps" aria-label="Cómo prepararlo">
        {STEPS.map((s, i) => (
          <li key={s.title} className="ritual-step" data-reveal="fade">
            <span className="ritual-step-n" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="ritual-step-title">{s.title}</h3>
            <p className="t-body text-ink-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
