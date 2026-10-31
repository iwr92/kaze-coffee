"use client";

import { useRef } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { EditorialImage } from "../editorial/EditorialImage";
import { useReveals } from "../motion/useReveals";

/** Pasos de preparación (orientación general, en orden). */
const STEPS = [
  { title: "Molé justo antes", text: "Si lo elegís en grano, molelo en el momento: ahí está el aroma." },
  { title: "Agua caliente, sin hervir", text: "Esperá unos segundos después del hervor para no quemar el café." },
  { title: "Esperá el aroma", text: "El viento trae el aroma antes que la taza." },
];

/** The Ritual — el deseo de preparar café en casa. */
export function Ritual() {
  const ref = useRef<HTMLElement>(null);
  useReveals(ref);

  return (
    <section ref={ref} id="ritual" aria-labelledby="ritual-title" className="ritual relative z-10">
      <div className="ritual-stage">
        <figure className="ritual-media" data-reveal="mask">
          <div className="ritual-media-inner reveal-inner" data-parallax="4">
            <span className="hidden md:block">
              <EditorialImage
                id="ritual-amplio"
                alt="Una taza de vidrio de doble pared con café recién servido, con vapor, sobre una mesa clara."
                sizes="80vw"
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
        </figure>

        <div className="ritual-copy">
          <h2 id="ritual-title" className="ritual-title kz-wind" data-reveal="lines" aria-label="Tu taza, a tu tiempo.">
            <span className="kz-line" aria-hidden>
              <span className="kz-line-air">
                <span className="kz-line-inner">Tu taza,</span>
              </span>
            </span>
            <span className="kz-line kz-voice" aria-hidden>
              <span className="kz-line-air">
                <span className="kz-line-inner">a tu tiempo.</span>
              </span>
            </span>
          </h2>
          <p className="ritual-lead t-body-lg text-ink-muted" data-reveal="fade">
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
