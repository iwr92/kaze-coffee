"use client";

import gsap from "gsap";
import { useEffect, useId, useRef, useState } from "react";
import { StoreLink } from "../StoreLink";
import { WindLines } from "../type/WindLines";

interface Method {
  id: string;
  name: string;
  grind: string;
  feel: string;
  /** Tamaño de partícula (px) y cuántas se ven en el campo. */
  size: number;
  visible: number;
}

/** Referencias generales de molienda por método (no son datos de producto). */
const METHODS: Method[] = [
  { id: "grano", name: "En grano", grind: "Entero", feel: "Para molerlo justo antes de preparar.", size: 46, visible: 30 },
  { id: "espresso", name: "Espresso", grind: "Fina", feel: "Como sal fina.", size: 3.6, visible: 380 },
  { id: "moka", name: "Moka", grind: "Fina a media", feel: "Apenas más gruesa que para espresso.", size: 5.2, visible: 330 },
  { id: "filtro", name: "Filtro", grind: "Media", feel: "Como arena.", size: 7.4, visible: 260 },
  { id: "prensa", name: "Prensa francesa", grind: "Gruesa", feel: "Como sal gruesa.", size: 12, visible: 150 },
];

const DEFAULT_METHOD = METHODS[0];
const COUNT = 380;
const BASE = 32; // px: tamaño base de cada partícula antes de escalar

/** Campo determinista (igual en servidor y cliente). */
const PARTICLES = (() => {
  let s = 20261028;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
  return Array.from({ length: COUNT }, (_, i) => {
    // Las partículas forman una estela diagonal, como una ráfaga de viento.
    const x = 3 + rand() * 94;
    const center = 70 - x * 0.42 + Math.sin(x / 13) * 7;
    const y = Math.min(96, Math.max(4, center + gauss() * 17));
    return {
      x,
      y,
      rot: rand() * 360,
      jitter: 0.65 + rand() * 0.7,
      tone: i % 7 === 0 ? "light" : i % 3 === 0 ? "mid" : "dark",
      order: rand(),
    };
  });
})();

function initialGrainStyle(p: (typeof PARTICLES)[number]): React.CSSProperties {
  const show = p.order < DEFAULT_METHOD.visible / COUNT;
  const scale = show ? (DEFAULT_METHOD.size / BASE) * p.jitter : 0;
  return { transform: `rotate(${p.rot}deg) scale(${scale})`, opacity: show ? 1 : 0 };
}

/**
 * Molienda — elegís tu método y el campo de café se reacomoda. Cada cambio
 * es una ráfaga: las partículas cambian de tamaño en cascada de izquierda a
 * derecha. Con el mouse, el café se aparta del cursor.
 */
export function GrindSelector() {
  const [methodId, setMethodId] = useState(DEFAULT_METHOD.id);
  const fieldRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef(false);
  const name = useId();
  const method = METHODS.find((m) => m.id === methodId)!;

  // Ráfaga al cambiar de método (y estado inicial sin animación).
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const first = !motionRef.current;
    motionRef.current = true;
    const grains = field.querySelectorAll<HTMLElement>(".grain");
    grains.forEach((el, i) => {
      const p = PARTICLES[i];
      const show = p.order < method.visible / COUNT;
      const scale = (method.size / BASE) * p.jitter;
      const vars = { scale: show ? scale : 0, rotation: p.rot + (method.id === "grano" ? 0 : 40), autoAlpha: show ? 1 : 0 };
      if (!motion || first) gsap.set(el, vars);
      else
        gsap.to(el, {
          ...vars,
          duration: 0.9,
          ease: "power3.out",
          delay: (p.x / 100) * 0.45 + p.order * 0.12,
          overwrite: "auto",
        });
    });
  }, [method]);

  // El café se aparta del puntero (solo mouse, con movimiento permitido).
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    if (!mq.matches) return;
    const grains = Array.from(field.querySelectorAll<HTMLElement>(".grain-air"));
    const xs = grains.map((g) => gsap.quickTo(g, "x", { duration: 0.9, ease: "power3.out" }));
    const ys = grains.map((g) => gsap.quickTo(g, "y", { duration: 0.9, ease: "power3.out" }));
    const onMove = (e: PointerEvent) => {
      const r = field.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      PARTICLES.forEach((p, i) => {
        const dx = p.x - px;
        const dy = p.y - py;
        const d = Math.hypot(dx, dy);
        const f = d < 18 ? (1 - d / 18) ** 2 * 26 : 0;
        xs[i](d > 0 ? (dx / d) * f : 0);
        ys[i](d > 0 ? (dy / d) * f : 0);
      });
    };
    const onLeave = () => {
      xs.forEach((q) => q(0));
      ys.forEach((q) => q(0));
    };
    field.addEventListener("pointermove", onMove);
    field.addEventListener("pointerleave", onLeave);
    return () => {
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section id="molienda" aria-labelledby="molienda-title" className="grind relative z-10 bg-pearl">
      <div className="grind-grid">
        <div className="grind-copy">
          <p className="t-label text-ink-muted">Molienda</p>
          <h2 id="molienda-title" className="sr-only">
            Molido para tu método
          </h2>
          <WindLines
            as="p"
            label="Molido para tu método."
            lines={[
              { text: "Molido para", indent: 0 },
              { text: "tu método.", indent: 1 },
            ]}
            className="kz-mono-lg mt-5 text-ink"
          />

          <fieldset className="grind-methods mt-12">
            <legend className="sr-only">Elegí tu método de preparación</legend>
            {METHODS.map((m) => (
              <label key={m.id} className="grind-method" data-active={m.id === methodId || undefined}>
                <input
                  type="radio"
                  name={name}
                  value={m.id}
                  checked={m.id === methodId}
                  onChange={() => setMethodId(m.id)}
                  className="sr-only"
                />
                <span className="grind-method-name">{m.name}</span>
                <span className="grind-method-grind t-label">{m.grind}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="grind-stage">
          <div ref={fieldRef} className="grind-field" data-method={method.id} aria-hidden>
            {PARTICLES.map((p, i) => (
              <span key={i} className="grain-air" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                {/* Estilo inicial constante (método por defecto): React no lo
                    vuelve a aplicar, así que no pelea con las animaciones. */}
                <span className={`grain grain-${p.tone}`} style={initialGrainStyle(p)} />
              </span>
            ))}
          </div>
          <div className="grind-caption" aria-live="polite">
            <p className="kz-display-sm text-ink">{method.grind}.</p>
            <p className="t-body-lg mt-2 text-ink-muted">{method.feel}</p>
          </div>
          <p className="t-caption mt-8 max-w-[38ch] text-ink-muted">
            Cada café se pide en grano o molido para tu método.{" "}
            <StoreLink destination="collection" className="link-ink">
              Elegir café
            </StoreLink>
          </p>
        </div>
      </div>
    </section>
  );
}
