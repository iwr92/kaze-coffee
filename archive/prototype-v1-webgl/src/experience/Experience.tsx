"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectQuality,
  prefersReducedMotion,
  supportsWebGL2,
  type QualityProfile,
} from "./config/quality";
import { store } from "./state/store";
import { useScrollChoreography } from "./timeline/useScrollChoreography";
import { StaticExperience } from "./ui/StaticExperience";
import { StoryBeats } from "./ui/StoryBeats";

// Three.js y la escena se cargan aparte: el HTML del hero no los espera.
const ExperienceCanvas = dynamic(() => import("./scene/ExperienceCanvas"), { ssr: false });

type Mode = { kind: "pending" } | { kind: "webgl"; quality: QualityProfile } | { kind: "static" };

export function Experience() {
  const [mode, setMode] = useState<Mode>({ kind: "pending" });

  useEffect(() => {
    if (prefersReducedMotion() || !supportsWebGL2()) {
      setMode({ kind: "static" });
      return;
    }
    setMode({ kind: "webgl", quality: detectQuality() });
  }, []);

  if (mode.kind === "static") return <StaticExperience />;
  return <CinematicExperience quality={mode.kind === "webgl" ? mode.quality : null} />;
}

function CinematicExperience({ quality }: { quality: QualityProfile | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const onActiveChange = useCallback((value: boolean) => setActive(value), []);
  const onReady = useCallback(() => setReady(true), []);

  useScrollChoreography(sectionRef, onActiveChange);

  // Puntero: solo mouse/lápiz. En táctil el scroll es la única interacción.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      store.pointerActive = true;
    };
    const onLeave = () => {
      store.pointer.x = 0;
      store.pointer.y = 0;
      store.pointerActive = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, []);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1400ms] ease-out"
        style={{ opacity: ready ? 1 : 0, visibility: active ? "visible" : "hidden" }}
        aria-hidden
      >
        {quality && <ExperienceCanvas quality={quality} active={active} onReady={onReady} />}
      </div>

      <section
        ref={sectionRef}
        id="top"
        aria-label="Kaze, del grano a la taza"
        className="relative z-10 h-[680svh]"
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          <StoryBeats />
        </div>
      </section>
    </>
  );
}
