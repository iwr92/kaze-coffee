"use client";

import { useEffect, useId, useRef, useState } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { GRIND_LABELS, type GrindId } from "@/commerce/products";
import { GRIND_GUIDE } from "@/config/grind";
import { gsap } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";

const round = (value: number) => Math.round(value * 100) / 100;

/** Partículas deterministas (iguales en servidor y cliente). */
function scatter(seed: number, count: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({ x: round(rand() * 100), y: round(rand() * 75), rotation: round(rand() * 360) }));
}

const GROUNDS = scatter(20261106, 520);
const BEANS = scatter(11062026, 15);

/** Radio de cada partícula para una molienda: 0 si no se ve en esa textura. */
function particleRadius(id: GrindId, i: number) {
  const { radius, count } = GRIND_GUIDE.find((g) => g.id === id)!.particle;
  return i < count ? radius * (0.8 + ((i * 37) % 10) * 0.04) : 0;
}

/**
 * A tu manera: qué significa cada molienda, sin tutoriales.
 * La textura se muestra: las mismas partículas cambian de tamaño, llevadas por
 * una ráfaga, del grano entero a la molienda elegida.
 */
export function GrindChoice() {
  const ref = useRef<HTMLElement>(null);
  const uid = useId();
  const [active, setActive] = useState<GrindId>("grano");
  const current = GRIND_GUIDE.find((g) => g.id === active)!;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useReveals(ref, (root) => {
    gsap.fromTo(
      root.querySelector(".gc-gust"),
      { drawSVG: "0% 0%" },
      { drawSVG: "0% 100%", ease: "none", scrollTrigger: { trigger: root.querySelector(".gc-stage"), start: "top 85%", end: "center 45%", scrub: 0.6 } },
    );
  });

  // Cambio de molienda: la ráfaga empuja las partículas a su nuevo tamaño.
  const first = useRef(true);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const circles = root.querySelectorAll<SVGCircleElement>(".gc-ground");
    const beans = root.querySelectorAll<SVGGElement>(".gc-bean-group");
    const showBeans = active === "grano";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (first.current || reduce) {
      first.current = false;
      circles.forEach((c, i) => gsap.set(c, { attr: { r: particleRadius(active, i) } }));
      gsap.set(beans, { opacity: showBeans ? 1 : 0, scale: 1, transformOrigin: "50% 50%" });
      return;
    }
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    tl.fromTo(circles, { x: -7 }, { x: 0, duration: 0.8, ease: "kz", stagger: { amount: 0.3, from: "random" } }, 0)
      .to(circles, { attr: { r: (i: number) => particleRadius(active, i) }, duration: 0.65, ease: "kzInOut", stagger: { amount: 0.3, from: "random" } }, 0)
      .to(
        beans,
        { opacity: showBeans ? 1 : 0, scale: showBeans ? 1 : 0.55, x: showBeans ? 0 : 6, duration: 0.55, ease: "kzInOut", stagger: { amount: 0.25, from: "random" }, transformOrigin: "50% 50%" },
        0,
      )
      .fromTo(root.querySelectorAll(".gc-swap"), { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: "kz", stagger: 0.05 }, 0.08);
    return () => {
      tl.kill();
    };
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + GRIND_GUIDE.length) % GRIND_GUIDE.length;
    setActive(GRIND_GUIDE[next].id);
    tabs.current[next]?.focus();
  };

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
          Cada método pide una molienda distinta. Elegí cómo preparás tu café y fijate cuál te conviene.
        </p>
      </header>

      <div className="gc-layout">
        <div className="gc-tabs" role="tablist" aria-label="Opciones de molienda" aria-orientation="vertical" data-reveal="fade">
          {GRIND_GUIDE.map((grind, i) => (
            <button
              key={grind.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${grind.id}`}
              aria-selected={grind.id === active}
              aria-controls={`${uid}-panel`}
              tabIndex={grind.id === active ? 0 : -1}
              className="gc-tab"
              onClick={() => setActive(grind.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {GRIND_LABELS[grind.id]}
            </button>
          ))}
        </div>

        <div className="gc-stage" data-reveal="fade">
          <svg className="gc-texture" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <path className="gc-gust" d="M-4 60 C 18 38, 34 72, 54 48 S 84 18, 104 30" vectorEffect="non-scaling-stroke" />
            {GROUNDS.map((p, i) => (
              <circle key={i} className="gc-ground" cx={p.x} cy={p.y} r={0} />
            ))}
            {BEANS.map((p, i) => (
              <g key={i} className="gc-bean-group">
                <g transform={`translate(${p.x} ${p.y}) rotate(${p.rotation})`}>
                  <ellipse rx="4.4" ry="3" className="gc-bean" />
                  <path d="M-3.200 0.6 C -1 -1.300, 1 1.300, 3.200 -0.6" className="gc-bean-crease" vectorEffect="non-scaling-stroke" />
                </g>
              </g>
            ))}
          </svg>

          <div id={`${uid}-panel`} className="gc-card" role="tabpanel" aria-labelledby={`${uid}-tab-${active}`}>
            <div className="gc-mask">
              <p className="gc-swap gc-texture-name">{current.texture}</p>
            </div>
            <div className="gc-mask">
              <p className="gc-swap gc-similar">{current.similarTo}</p>
            </div>
            <div className="gc-mask">
              <p className="gc-swap gc-use">{current.use}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="gc-foot" data-reveal="fade">
        <p>Son las opciones del catálogo. La disponibilidad de cada molienda se confirma en la tienda, según el café.</p>
        <a href={COLLECTION_ANCHOR} className="link-line">
          Ver los cafés
        </a>
      </div>
    </section>
  );
}
