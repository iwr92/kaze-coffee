"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Fog, SRGBColorSpace, type DirectionalLight, type HemisphereLight } from "three";
import { backgroundRamp, lerp } from "../timeline/choreography";
import { sceneState } from "./sceneState";

const NEGRO = new Color("#151311");
const rgb = { r: 0, g: 0, b: 0 };

interface StageProps {
  environmentResolution: number;
}

/**
 * Fondo, niebla e iluminación. La luz principal es lateral y cálida, como
 * una ventana de mañana; en el ritual la escena se abre a un ambiente crema.
 */
export function Stage({ environmentResolution }: StageProps) {
  const scene = useThree((s) => s.scene);
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);

  const background = useMemo(() => NEGRO.clone(), []);
  const fog = useMemo(() => new Fog(NEGRO.clone(), 9, 24), []);

  useEffect(() => {
    scene.background = background;
    scene.fog = fog;
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, background, fog]);

  useFrame(() => {
    const { background: b, ritual } = sceneState.choreo;
    backgroundRamp(b, rgb);
    background.setRGB(rgb.r, rgb.g, rgb.b, SRGBColorSpace);
    fog.color.copy(background);
    fog.near = lerp(9, 14, b);
    fog.far = lerp(24, 40, b);
    if (key.current) key.current.intensity = lerp(2.6, 2.1, ritual);
    if (rim.current) rim.current.intensity = lerp(1.3, 0.5, ritual);
    if (hemi.current) hemi.current.intensity = lerp(0.12, 1.1, b);
    scene.environmentIntensity = lerp(0.55, 1.0, b);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#f3ecdf", "#2a221c", 0.12]} />
      {/* Luz clave: lateral derecha, cálida. */}
      <directionalLight ref={key} position={[6, 3.5, 4]} color="#ffd8ad" intensity={2.6} />
      {/* Contraluz frío-crema desde atrás a la izquierda: recorta la silueta. */}
      <directionalLight ref={rim} position={[-5, 2.5, -6]} color="#d9d0c2" intensity={1.3} />

      {/* Entorno procedural (sin descargas): softboxes para reflejos. */}
      <Environment resolution={environmentResolution} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#ffd2a1"
          position={[6, 2, 2]}
          rotation-y={-Math.PI / 2}
          scale={[6, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color="#f3ecdf"
          position={[0, 6, 0]}
          rotation-x={Math.PI / 2}
          scale={[8, 1.2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#d9cbb5"
          position={[-6, 0, -2]}
          rotation-y={Math.PI / 2}
          scale={[4, 6, 1]}
        />
        <Lightformer
          form="ring"
          intensity={0.6}
          color="#ffe6c8"
          position={[0, 1, 7]}
          scale={2.5}
        />
      </Environment>
    </>
  );
}
