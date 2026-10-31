"use client";

import { useEffect, useRef, useState } from "react";
import { loadManifest, type SequenceManifest, type VariantId } from "@/cinematic/manifest";
import { CHAPTER_STARTS } from "@/cinematic/moments";
import { cinematicProgress } from "@/cinematic/progress";
import { HeroComposition } from "../hero/HeroComposition";
import { gsap, ScrollTrigger } from "../motion/ease";
import { CinematicMediaController } from "./CinematicMediaController";
import { ScrollProgress } from "./ScrollProgress";
import { StaticCinematic } from "./StaticCinematic";

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
 * Hero con la secuencia cinematográfica como atmósfera.
 *
 * Una sección algo más alta que la pantalla con un escenario `sticky`: el
 * scroll recorre la secuencia dentro del panel visual (reversible por
 * construcción) y enseguida libera la página hacia la colección.
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
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6 },
        onUpdate: () => {
          const p = tl.progress();
          cinematicProgress.value = p;
          if (progressEl) {
            progressEl.style.setProperty("--kz-progress", p.toFixed(4));
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
      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Con el scroll el viento empuja: los granos recorren la ráfaga, las
        // líneas del titular se separan apenas y el bloque cede al final.
        const wind = section.querySelector<SVGSVGElement>(".hero-wind");
        const guide = wind?.querySelector<SVGPathElement>(".wind-path");
        const grains = wind ? Array.from(wind.querySelectorAll<SVGGElement>(".wind-grain")) : [];
        if (guide && grains.length) {
          const length = guide.getTotalLength();
          const offsets = grains.map((_, i) => 0.06 + i * 0.11);
          const drift = { p: 0 };
          const place = () => {
            grains.forEach((g, i) => {
              const at = Math.min(0.99, offsets[i] + drift.p * 0.5) * length;
              const a = guide.getPointAtLength(at);
              const b = guide.getPointAtLength(Math.min(length, at + 4));
              const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + drift.p * 140 * (i % 2 ? 1 : -1);
              g.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${angle})`);
              g.setAttribute("data-placed", "");
            });
          };
          place();
          tl.to(drift, { p: 1, duration: 1, onUpdate: place }, 0);
        }
        tl.to(".hero-title .kt-line:nth-child(2)", { xPercent: 4, duration: 1 }, 0);
        tl.to(".hero-copy", { yPercent: -5, opacity: 0.4, duration: 0.22, ease: "power1.in" }, 0.78);

        // Apertura: un único momento orquestado al cargar.
        const intro = gsap.timeline({ delay: 0.1, defaults: { ease: "kz" } });
        intro
          // y: 0 anula la transformación del CSS previo al pintado, que GSAP
          // leería como un desplazamiento fijo en píxeles.
          .fromTo(".hero-title .kt-word", { yPercent: 115, y: 0, rotate: 5 }, { yPercent: 0, y: 0, rotate: 0, duration: 1.05, stagger: 0.07 })
          .fromTo("[data-hero-fade]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.45)
          .fromTo(
            ".hero-media-frame",
            { clipPath: "inset(10% 0% 10% 30%)", opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.3 },
            0.15,
          )
          .fromTo(".hero-wind .wind-path", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.6, ease: "kzInOut", stagger: 0.12 }, 0.3)
          // Los hijos (no el <g>, cuyo transform lo fija el scroll).
          .fromTo(".hero-wind .wind-grain > *", { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.04 }, 0.9);
        // GSAP ya fijó los estados iniciales: el CSS previo al pintado deja de hacer falta.
        document.documentElement.classList.remove("kz-intro-pending");
      });

      // Fondo del encabezado desde que el escenario deja de estar fijo.
      ScrollTrigger.create({
        trigger: section,
        start: "bottom bottom",
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
    <section ref={sectionRef} id="top" aria-label="Kaze, café de especialidad" className="cinematic-section relative">
      <div className="sticky top-0 h-svh overflow-hidden bg-pearl">
        <HeroComposition
          media={
            mode.kind === "cinematic" ? (
              <CinematicMediaController manifest={mode.manifest} variant={mode.variant} active={active} />
            ) : null
          }
          progress={<ScrollProgress />}
        />
      </div>
    </section>
  );
}
