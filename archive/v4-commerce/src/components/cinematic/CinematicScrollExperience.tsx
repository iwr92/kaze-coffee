"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadManifest, type SequenceManifest, type VariantId } from "@/cinematic/manifest";
import { MOMENTS } from "@/cinematic/moments";
import { cinematicProgress } from "@/cinematic/progress";
import { CinematicMediaController } from "./CinematicMediaController";
import { EditorialOverlay } from "./EditorialOverlay";
import { ScrollProgress } from "./ScrollProgress";
import { StaticCinematic } from "./StaticCinematic";

gsap.registerPlugin(ScrollTrigger);

const CHAPTER_STARTS = MOMENTS.map((m) => m.enter?.[0] ?? 0);

type Mode =
  | { kind: "pending" }
  | { kind: "cinematic"; manifest: SequenceManifest; variant: VariantId }
  | { kind: "static"; manifest: SequenceManifest | null; variant: VariantId };

/**
 * desktop (1920 px) · mobile (1080 px) · lite (720 px).
 * `lite` es para teléfonos modestos o redes lentas. `deviceMemory` y
 * `connection` solo existen en navegadores Chromium: si faltan, no se asume
 * un equipo modesto.
 */
function pickVariant(): VariantId {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 768;
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency;
  const slowNetwork = /(^|-)3g$/.test(nav.connection?.effectiveType ?? "");

  if (coarse || small) {
    const modest = (memory !== undefined && memory <= 3) || (cores > 0 && cores <= 4) || slowNetwork;
    return modest ? "lite" : "mobile";
  }
  const constrained = (memory !== undefined && memory <= 2) || slowNetwork;
  return constrained ? "mobile" : "desktop";
}

/** Versión ligera: movimiento reducido o conexión con ahorro de datos. */
function prefersLightExperience(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  return Boolean(connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? ""));
}

/**
 * Experiencia cinematográfica controlada por scroll.
 *
 * Una sección alta con un escenario `sticky`. Una sola línea de tiempo de GSAP
 * (scrub) mueve el progreso de la secuencia, los textos y el indicador, así
 * todo queda sincronizado y es reversible por construcción.
 */
export function CinematicScrollExperience() {
  const [mode, setMode] = useState<Mode>({ kind: "pending" });

  useEffect(() => {
    const abort = new AbortController();
    const variant = pickVariant();
    const light = prefersLightExperience();
    loadManifest(abort.signal)
      .then((manifest) =>
        setMode(light ? { kind: "static", manifest, variant } : { kind: "cinematic", manifest, variant }),
      )
      .catch(() => {
        if (!abort.signal.aborted) setMode({ kind: "static", manifest: null, variant });
      });
    return () => abort.abort();
  }, []);

  if (mode.kind === "static") return <StaticCinematic manifest={mode.manifest} variant={mode.variant} />;
  return <CinematicStage mode={mode} />;
}

function CinematicStage({ mode }: { mode: Mode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const onFirstFrame = useCallback(() => setReady(true), []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    ScrollTrigger.config({ ignoreMobileResize: true });
    const progressEl = section.querySelector<HTMLElement>("[data-scroll-progress]");
    let chapter = -1;
    let mm: gsap.MatchMedia | null = null;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.7 },
        onUpdate: () => {
          const p = tl.progress();
          cinematicProgress.value = p;
          section.style.setProperty("--kz-progress", p.toFixed(4));
          if (progressEl) {
            progressEl.style.setProperty("--kz-progress", p.toFixed(4));
            // El capítulo cambia cuando empieza a entrar el texto de ese momento.
            let next = 0;
            for (let i = 0; i < CHAPTER_STARTS.length; i++) if (p >= CHAPTER_STARTS[i]) next = i;
            if (next !== chapter) {
              chapter = next;
              progressEl.dataset.active = String(next);
            }
          }
        },
      });
      // Duración total = 1: el progreso de la timeline es el de la secuencia.
      tl.to({}, { duration: 1 }, 0);

      // Coreografía tipográfica: el viento trae las líneas y se las lleva.
      for (const m of MOMENTS) {
        const root = `[data-moment="${m.id}"]`;
        const lines = section.querySelectorAll(`${root} .kz-line`);
        const inners = section.querySelectorAll(`${root} .kz-line-inner`);
        const label = section.querySelector(`${root} .moment-label`);
        const foot = section.querySelector(`${root} .moment-foot`);

        if (m.enter) {
          const [a, b] = m.enter;
          const d = b - a;
          tl.set(root, { autoAlpha: 1 }, a);
          tl.fromTo(`${root} .moment-rule`, { scaleX: 0 }, { scaleX: 1, duration: d * 0.6, ease: "power2.out" }, a);
          if (label) tl.fromTo(label, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: d * 0.5, ease: "power2.out" }, a);
          tl.fromTo(
            inners,
            { yPercent: 112, xPercent: -6 },
            { yPercent: 0, xPercent: 0, duration: d * 0.75, ease: "power3.out", stagger: d * 0.1 },
            a + d * 0.05,
          );
          if (foot) tl.fromTo(foot, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: d * 0.5, ease: "power2.out" }, a + d * 0.4);
        }
        if (m.exit) {
          const [a, b] = m.exit;
          const d = b - a;
          tl.to(lines, { xPercent: (i: number) => 16 + i * 10, autoAlpha: 0, duration: d, ease: "power1.in", stagger: d * 0.08 }, a);
          const rest = [label, foot].filter(Boolean);
          if (rest.length) tl.to(rest, { autoAlpha: 0, x: 48, duration: d * 0.7, ease: "power1.in" }, a);
          // Fuera de su ventana el bloque no debe recibir clics.
          tl.set(root, { autoAlpha: 0 }, b);
        }
      }

      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Apertura: un único momento orquestado al cargar.
        const intro = `[data-moment="${MOMENTS[0].id}"]`;
        const introTl = gsap.timeline({ delay: 0.15 });
        introTl
          .fromTo(`${intro} .kz-line-inner`, { yPercent: 112, y: 0 }, { yPercent: 0, duration: 1.4, ease: "power4.out", stagger: 0.09 })
          .fromTo(`${intro} .moment-rule`, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.out" }, 0.1)
          .fromTo(`${intro} .moment-label`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.2)
          .fromTo(`${intro} .moment-foot`, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0.75);
        // GSAP ya fijó los estados iniciales: el CSS previo al pintado deja de hacer falta.
        document.documentElement.classList.remove("kz-intro-pending");
      });
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        // Las líneas se mecen con el puntero, cada una a su profundidad.
        const airs = gsap.utils.toArray<HTMLElement>(".kz-line-air", section);
        const movers = airs.map((el) => gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }));
        const depth = airs.map((el) => 6 + Number(el.parentElement?.style.getPropertyValue("--kz-i") || 0) * 6);
        const onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          movers.forEach((move, i) => move(nx * depth[i]));
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });

      // Fondo del encabezado desde que el escenario deja de estar fijo y su
      // contenido empieza a pasar por debajo.
      ScrollTrigger.create({
        trigger: section,
        start: "bottom bottom",
        // onEnter/onLeaveBack: no se apaga al llegar al final de la página.
        onEnter: () => {
          document.documentElement.dataset.headerSolid = "true";
        },
        onLeaveBack: () => {
          document.documentElement.dataset.headerSolid = "false";
        },
      });

      // El escenario solo dibuja mientras la sección está en pantalla.
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setActive(self.isActive),
      });
    }, section);

    return () => {
      mm?.revert();
      ctx.revert();
      document.documentElement.classList.remove("kz-intro-pending");
      delete document.documentElement.dataset.headerSolid;
      cinematicProgress.value = 0;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Kaze, del grano a la taza"
      className="cinematic-section relative"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-pearl">
        {mode.kind === "cinematic" && (
          <CinematicMediaController
            manifest={mode.manifest}
            variant={mode.variant}
            active={active}
            onFirstFrame={onFirstFrame}
          />
        )}
        <div className="legibility-wash pointer-events-none absolute inset-0 z-[5]" aria-hidden />
        {/* Al final, la base del cuadro (la mesa) se funde con el perla de la sección siguiente. */}
        <div className="stage-fade pointer-events-none absolute inset-x-0 bottom-0 z-[5]" aria-hidden />
        <EditorialOverlay />
        <ScrollProgress />
        <span className="sr-only" aria-live="polite">
          {ready ? "" : "Cargando la secuencia"}
        </span>
      </div>
    </section>
  );
}
