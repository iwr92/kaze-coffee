"use client";

import { useEffect, useId, useRef, useState } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { GRIND_LABELS } from "@/commerce/products";
import { grindAvailability } from "@/config/grind";
import { EditorialImage, type EditorialImageId } from "../editorial/EditorialImage";
import { gsap } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";

interface Option {
  id: "grano" | "molido";
  name: string;
  image: EditorialImageId;
  summary: string;
  available: boolean;
  detail: string;
}

/** Partículas deterministas (iguales en servidor y cliente). */
function particles(seed: number, count: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: rand() * 360,
    s: 0.6 + rand() * 0.9,
    depth: 0.4 + rand() * 0.6,
  }));
}
const BEANS = particles(20261031, 9);
const GROUNDS = particles(31102026, 46);

/**
 * A tu manera — comparar en grano y molido, con disponibilidad real.
 * "En grano" está confirmado por el manual de marca. "Molido" figura como
 * pendiente hasta que un producto real del catálogo lo declare.
 *
 * Cada panel es una pequeña escena por capas: la fotografía (capa lenta) y
 * partículas SVG (capa rápida) que se desplazan a distinta profundidad con
 * el scroll y el puntero. El panel activo se expande y revela su contenido.
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

  useReveals(ref, (root) => {
    // Parallax por capas con el scroll: la foto se mueve lento, las partículas rápido.
    root.querySelectorAll<HTMLElement>(".gc-panel").forEach((panel) => {
      const st = { trigger: panel, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(panel.querySelector(".gc-media-inner"), { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: st });
      gsap.fromTo(panel.querySelector(".gc-layer"), { yPercent: 10 }, { yPercent: -10, ease: "none", scrollTrigger: st });
    });
    // Y con el puntero (solo mouse): cada partícula según su profundidad.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const movers = Array.from(root.querySelectorAll<SVGGElement>(".gc-particle")).map((el) => ({
      depth: Number(el.dataset.depth) || 0.5,
      x: gsap.quickTo(el, "x", { duration: 1.1, ease: "kz" }),
      y: gsap.quickTo(el, "y", { duration: 1.1, ease: "kz" }),
    }));
    const panels = root.querySelector<HTMLElement>(".gc-panels")!;
    const onMove = (e: PointerEvent) => {
      const r = panels.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      movers.forEach((m) => {
        m.x(nx * 22 * m.depth);
        m.y(ny * 16 * m.depth);
      });
    };
    panels.addEventListener("pointermove", onMove);
    return () => panels.removeEventListener("pointermove", onMove);
  });

  // Al abrir un panel: la foto se descubre con máscara y el contenido se
  // revela por líneas. Al cerrarlo, todo vuelve a su lugar.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panel = root.querySelector<HTMLElement>(`.gc-panel[data-id="${active}"]`);
    if (!panel) return;
    const tl = gsap.timeline({ defaults: { ease: "kz" } });
    tl.fromTo(panel.querySelector(".gc-media-inner"), { clipPath: "inset(0% 0% 0% 22%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7 }, 0)
      .fromTo(panel.querySelectorAll(".gc-reveal"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07 }, 0.15)
      .fromTo(panel.querySelectorAll(".gc-particle"), { scale: 0.6 }, { scale: 1, duration: 0.8, stagger: 0.01, transformOrigin: "50% 50%" }, 0);
    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <section ref={ref} id="a-tu-manera" aria-labelledby="gc-title" className="grind-choice relative z-10">
      <header className="gc-head">
        <KineticTitle
          id="gc-title"
          className="gc-title"
          reveal="words"
          lines={[
            { text: "A tu", voice: "serif" },
            { text: "manera.", voice: "italic", indent: 0.6 },
          ]}
        />
        <p className="gc-intro t-body-lg text-ink-muted" data-reveal="fade">
          En grano o molido: cada café indica cómo lo podés recibir. Elegí según cómo lo preparás en casa.
        </p>
      </header>

      <div className="gc-panels" data-active={active} role="tablist" aria-label="En grano o molido">
        {options.map((o) => {
          const open = o.id === active;
          const panelId = `${uid}-${o.id}`;
          const parts = o.id === "grano" ? BEANS : GROUNDS;
          return (
            <article key={o.id} className="gc-panel" data-id={o.id} data-open={open || undefined} data-reveal="fade">
              <button
                type="button"
                role="tab"
                className="gc-panel-toggle"
                aria-selected={open}
                aria-controls={panelId}
                onClick={() => setActive(o.id)}
                onMouseEnter={() => setActive(o.id)}
                onFocus={() => setActive(o.id)}
              >
                <span className="gc-media" aria-hidden>
                  <span className="gc-media-inner">
                    <EditorialImage id={o.image} alt="" sizes="(max-width: 1023px) 100vw, 60vw" className="gc-image" />
                  </span>
                  <svg className={`gc-layer gc-layer-${o.id}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    {parts.map((p, i) => (
                      <g key={i} className="gc-particle" data-depth={p.depth.toFixed(2)}>
                        {o.id === "grano" ? (
                          <g transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s})`}>
                            <ellipse rx="2.2" ry="1.5" className="gc-bean" vectorEffect="non-scaling-stroke" />
                            <path d="M-1.5 0.3 C -0.5 -0.6, 0.5 0.6, 1.5 -0.3" className="gc-bean-crease" vectorEffect="non-scaling-stroke" />
                          </g>
                        ) : (
                          <circle cx={p.x} cy={p.y} r={0.35 * p.s} className="gc-ground" />
                        )}
                      </g>
                    ))}
                  </svg>
                </span>
                <span className="gc-panel-head">
                  <span className={`gc-state ${o.available ? "is-ok" : "is-pending"}`}>
                    {o.available ? "Disponible" : "Por confirmar"}
                  </span>
                  <span className="gc-name">{o.name}</span>
                  <span className="gc-summary">{o.summary}</span>
                </span>
              </button>
              <div id={panelId} className="gc-panel-body" role="tabpanel" aria-label={o.name}>
                <p className="gc-detail gc-reveal">{o.detail}</p>
                <div className="gc-reveal">
                  {o.available ? (
                    <a href={COLLECTION_ANCHOR} className="btn btn-primary">
                      {o.id === "grano" ? "Ver cafés en grano" : "Ver cafés molidos"}
                    </a>
                  ) : (
                    <p className="gc-wait">Se va a mostrar acá cuando esté disponible.</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
