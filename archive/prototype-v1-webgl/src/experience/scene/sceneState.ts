import { createSceneState, type SceneState } from "../timeline/choreography";

/**
 * Estado por frame de la escena. Lo escribe <Director/> antes que cualquier
 * otro useFrame, y lo leen el resto de los componentes del Canvas.
 */
export const sceneState: {
  choreo: SceneState;
  dt: number;
  /** Puntero amortiguado, en NDC (-1 → 1). */
  pointer: { x: number; y: number };
} = {
  choreo: createSceneState(),
  dt: 0,
  pointer: { x: 0, y: 0 },
};
