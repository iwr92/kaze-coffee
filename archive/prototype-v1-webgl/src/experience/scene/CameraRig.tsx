"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import { lerp, sampleCamera } from "../timeline/choreography";
import { sceneState } from "./sceneState";

/**
 * Cámara guiada por la pista de la coreografía, con parallax del puntero y
 * encuadre adaptado al aspecto: en vertical se aleja y baja la taza para
 * dejar el texto arriba; en horizontal corre la taza hacia la derecha.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const tmp = useMemo(
    () => ({
      pos: [0, 0, 0] as [number, number, number],
      target: [0, 0, 0] as [number, number, number],
      vPos: new Vector3(),
      vTarget: new Vector3(),
      dir: new Vector3(),
    }),
    [],
  );

  useFrame(() => {
    const { choreo, pointer } = sceneState;
    const aspect = size.width / Math.max(1, size.height);
    sampleCamera(choreo.progress, tmp.pos, tmp.target);
    // En vertical los desplazamientos laterales de la pista se acortan.
    if (aspect < 1) tmp.pos[0] *= aspect;
    tmp.vPos.fromArray(tmp.pos);
    tmp.vTarget.fromArray(tmp.target);

    // En pantallas angostas la cámara se aleja durante el ritual para que la
    // taza entre completa. Los granos ya se componen según el aspecto.
    const narrow = aspect < 1 ? Math.min(1.9, 0.15 + 0.85 / aspect) : 1;
    const distanceScale = lerp(1, narrow, Math.max(choreo.ritual, choreo.cup * 0.6));
    tmp.dir.subVectors(tmp.vPos, tmp.vTarget).multiplyScalar(distanceScale);

    // Encuadre del ritual: la taza a la derecha (horizontal) o abajo (vertical).
    const r = choreo.ritual;
    if (aspect >= 1) {
      tmp.vTarget.x += -1.05 * r * Math.min(1.4, aspect / 1.4);
    } else {
      tmp.vTarget.y += 0.95 * r;
    }
    tmp.vPos.addVectors(tmp.vTarget, tmp.dir);

    // Parallax: respira con el puntero, más quieto en el ritual.
    const par = 1 - 0.7 * r;
    tmp.vPos.x += pointer.x * 0.38 * par;
    tmp.vPos.y += pointer.y * 0.22 * par;

    camera.position.copy(tmp.vPos);
    camera.lookAt(tmp.vTarget);
  });

  return null;
}
