"use client";

import { useFrame } from "@react-three/fiber";
import { store } from "../state/store";
import { damp, evaluateChoreography } from "../timeline/choreography";
import { sceneState } from "./sceneState";

/** Evalúa la coreografía una vez por frame, antes que el resto de la escena. */
export function Director() {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    sceneState.dt = dt;
    sceneState.pointer.x = damp(sceneState.pointer.x, store.pointer.x, 3.5, dt);
    sceneState.pointer.y = damp(sceneState.pointer.y, store.pointer.y, 3.5, dt);
    evaluateChoreography(store.progress, sceneState.choreo.time + dt, sceneState.choreo);
  }, -10);
  return null;
}
