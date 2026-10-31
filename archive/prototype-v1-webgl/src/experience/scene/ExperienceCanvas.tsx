"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import type { QualityProfile } from "../config/quality";
import { CameraRig } from "./CameraRig";
import { CoffeeSystem } from "./CoffeeSystem";
import { Cup } from "./Cup";
import { Director } from "./Director";
import { Stage } from "./Stage";

interface ExperienceCanvasProps {
  quality: QualityProfile;
  active: boolean;
  onReady: () => void;
}

/** Escena WebGL persistente: un solo Canvas para toda la coreografía. */
export default function ExperienceCanvas({ quality, active, onReady }: ExperienceCanvasProps) {
  return (
    <Canvas
      dpr={quality.dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 35, near: 0.1, far: 80, position: [0, 0, 9.5] }}
      gl={{
        antialias: quality.tier === "high",
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = SRGBColorSpace;
        requestAnimationFrame(onReady);
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Director />
      <CameraRig />
      <Suspense fallback={null}>
        <Stage environmentResolution={quality.environmentResolution} />
        <CoffeeSystem quality={quality} />
        <Cup transmission={quality.transmission} />
      </Suspense>
    </Canvas>
  );
}
