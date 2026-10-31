"use client";

import { useId, useRef, useState } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { GRIND_LABELS } from "@/commerce/products";
import { grindAvailability } from "@/config/grind";
import { EditorialImage, type EditorialImageId } from "../editorial/EditorialImage";
import { useReveals } from "../motion/useReveals";

interface Option {
  id: "grano" | "molido";
  name: string;
  image: EditorialImageId;
  summary: string;
  available: boolean;
  detail: string;
}

/**
 * A tu manera — comparar en grano y molido, con disponibilidad real.
 * "En grano" está confirmado por el manual de marca. "Molido" figura como
 * pendiente hasta que un producto real del catálogo lo declare.
 */
export function GrindChoice() {
  const ref = useRef<HTMLElement>(null);
  const uid = useId();
  const { confirmed, groundConfirmed } = grindAvailability();
  const ground = confirmed.filter((g) => g !== "grano");

  const options: Option[] = [
    {
      id: "grano",
      name: "En grano",
      image: "granos-macro",
      summary: "Entero, para molerlo justo antes de preparar.",
      available: true,
      detail: "Molerlo en el momento conserva mejor el aroma. Ideal si tenés molinillo en casa.",
    },
    {
      id: "molido",
      name: "Molido",
      image: "corriente-vertical",
      summary: "Listo para tu método de preparación.",
      available: groundConfirmed,
      detail: groundConfirmed
        ? ground.map((g) => GRIND_LABELS[g]).join(", ")
        : "Las moliendas por método se van a indicar en cada café cuando estén confirmadas.",
    },
  ];
  const [active, setActive] = useState<Option["id"]>("grano");

  useReveals(ref);

  return (
    <section ref={ref} id="a-tu-manera" aria-labelledby="gc-title" className="grind-choice relative z-10">
      <header className="gc-head">
        <h2 id="gc-title" className="gc-title kz-wind" data-reveal="lines" aria-label="A tu manera.">
          <span className="kz-line" aria-hidden>
            <span className="kz-line-air">
              <span className="kz-line-inner">A tu</span>
            </span>
          </span>
          <span className="kz-line kz-voice" aria-hidden>
            <span className="kz-line-air">
              <span className="kz-line-inner">manera.</span>
            </span>
          </span>
        </h2>
        <p className="gc-intro t-body-lg text-ink-muted" data-reveal="fade">
          En grano o molido: cada café indica cómo lo podés recibir. Elegí según cómo lo preparás en casa.
        </p>
      </header>

      <div className="gc-panels" data-active={active}>
        {options.map((o) => {
          const open = o.id === active;
          const panelId = `${uid}-${o.id}`;
          return (
            <article key={o.id} className="gc-panel" data-open={open || undefined} data-reveal="fade">
              <button
                type="button"
                className="gc-panel-toggle"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setActive(o.id)}
                onMouseEnter={() => setActive(o.id)}
              >
                <span className="gc-media" aria-hidden>
                  <EditorialImage id={o.image} alt="" sizes="(max-width: 767px) 100vw, 60vw" className="gc-image" />
                </span>
                <span className="gc-panel-head">
                  <span className={`gc-state ${o.available ? "is-ok" : "is-pending"}`}>
                    {o.available ? "Disponible" : "Por confirmar"}
                  </span>
                  <span className="gc-name">{o.name}</span>
                  <span className="gc-summary">{o.summary}</span>
                </span>
              </button>
              <div id={panelId} className="gc-panel-body" role="region" aria-label={o.name}>
                <p className="gc-detail">{o.detail}</p>
                {o.available ? (
                  <a href={COLLECTION_ANCHOR} className="btn btn-primary">
                    {o.id === "grano" ? "Ver cafés en grano" : "Ver cafés molidos"}
                  </a>
                ) : (
                  <p className="gc-wait">Se va a mostrar acá cuando esté disponible.</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
