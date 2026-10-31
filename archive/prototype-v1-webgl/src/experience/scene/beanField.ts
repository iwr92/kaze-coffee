import {
  DataTexture,
  FloatType,
  Matrix4,
  NearestFilter,
  Quaternion,
  RGBAFormat,
  Vector3,
  type Ray,
} from "three";
import { WORLD, clamp01, damp, smoothstep, type SceneState } from "../timeline/choreography";

/**
 * Campo de granos.
 *
 * Calcula en CPU la transformación de cada grano (son pocos) y la publica en:
 *  - `matrices`: el array de instanceMatrix del InstancedMesh de granos.
 *  - `texture`: una DataTexture que leen los fragmentos de molienda en GPU
 *    para nacer sobre la superficie de su grano y heredar su movimiento.
 *
 * Fila i de la textura: 4 texels con las columnas de la matriz + 1 texel
 * con (morph_i, 0, 0, 0).
 */

export const BEAN_TEXELS = 5;

interface BeanSeed {
  base: Vector3;
  phase: number;
  axis: Vector3;
  orientation: Quaternion;
  spinSpeed: number;
  scale: number;
  /** Retardo de transformación: el viento barre de izquierda a derecha. */
  delay: number;
  /** Radio y altura dentro del vórtice. */
  vortexRadius: number;
  vortexHeight: number;
  vortexAngle0: number;
}

interface BeanRuntime {
  spin: number;
  swirl: number;
  push: Vector3;
  spinKick: number;
  morph: number;
}

export interface BeanField {
  count: number;
  matrices: Float32Array;
  dissolve: Float32Array;
  texture: DataTexture;
  update(state: SceneState, dt: number, pointerRay: Ray | null): void;
  dispose(): void;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CAMERA_Z = 9.5;
const TAN_HALF_FOV = Math.tan((35 / 2) * (Math.PI / 180));

/**
 * Composición del hero. Distribución con separación mínima (tipo Poisson)
 * en profundidad, con más densidad arriba a la derecha y una zona más libre
 * abajo a la izquierda, donde vive el texto. Algunos granos muy cercanos a
 * cámara, en los bordes, dan escala y profundidad.
 */
function layoutBeans(count: number, aspect: number, rand: () => number): BeanSeed[] {
  const seeds: BeanSeed[] = [];
  const placed: Vector3[] = [];
  const portrait = aspect < 1;
  let attempts = 0;

  while (seeds.length < count && attempts < count * 400) {
    attempts++;
    // Profundidad: mayoría en el plano medio, algunos muy cerca o muy lejos.
    const r = rand();
    const z = r < 0.1 ? 2 + rand() * 2.2 : r < 0.75 ? -3.5 + rand() * 5 : -9 + rand() * 5.5;
    const dist = CAMERA_Z - z;
    const halfH = dist * TAN_HALF_FOV;
    const halfW = halfH * aspect;
    const nx = rand() * 2.3 - 1.15;
    const ny = rand() * 2.3 - 1.15;

    // Zona de texto (abajo a la izquierda en desktop, abajo en vertical):
    // ahí solo quedan granos lejanos, chicos y velados por la niebla.
    const inText = portrait
      ? ny < 0.3 && z > -5
      : nx < 0.2 && ny < 0.25 && z > -5;
    if (inText) continue;
    // Banda superior de navegación.
    if (ny > 0.82 && z > -2 && rand() > 0.3) continue;

    const pos = new Vector3(nx * halfW, ny * halfH, z);
    const minGap = 0.75 + Math.max(0, z) * 0.18;
    let ok = true;
    for (const other of placed) {
      if (other.distanceTo(pos) < minGap) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    placed.push(pos);

    const axis = new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    const orientation = new Quaternion().setFromAxisAngle(
      new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      rand() * Math.PI * 2,
    );
    const leftToRight = clamp01((pos.x / (halfW || 1) + 1) / 2);

    seeds.push({
      base: pos,
      phase: rand() * Math.PI * 2,
      axis,
      orientation,
      spinSpeed: (0.08 + rand() * 0.16) * (rand() > 0.5 ? 1 : -1),
      scale: 0.42 + rand() * 0.16,
      delay: clamp01(leftToRight * 0.75 + rand() * 0.25),
      vortexRadius: 0.8 + rand() * 1.4,
      vortexHeight: (rand() - 0.5) * 2.2,
      vortexAngle0: Math.atan2(pos.z - WORLD.vortex.z, pos.x - WORLD.vortex.x),
    });
  }
  return seeds;
}

export function createBeanField(count: number, aspect: number, seed = 7): BeanField {
  const rand = mulberry32(seed);
  const seeds = layoutBeans(count, aspect, rand);
  const n = seeds.length;

  const matrices = new Float32Array(n * 16);
  const dissolve = new Float32Array(n);
  const data = new Float32Array(n * BEAN_TEXELS * 4);
  const texture = new DataTexture(data, BEAN_TEXELS, n, RGBAFormat, FloatType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  const runtime: BeanRuntime[] = seeds.map(() => ({
    spin: 0,
    swirl: 0,
    push: new Vector3(),
    spinKick: 0,
    morph: 0,
  }));

  // Objetos reutilizados: cero allocations por frame.
  const pos = new Vector3();
  const idle = new Vector3();
  const vortex = new Vector3();
  const toBean = new Vector3();
  const closest = new Vector3();
  const pushTarget = new Vector3();
  const spinQ = new Quaternion();
  const q = new Quaternion();
  const scl = new Vector3();
  const m = new Matrix4();

  function update(state: SceneState, dt: number, pointerRay: Ray | null): void {
    const t = state.time;
    const g = state.gather;
    const gEase = g * g * (3 - 2 * g);
    const pointerInfluence = 1 - g;

    for (let i = 0; i < n; i++) {
      const s = seeds[i];
      const r = runtime[i];

      // Flotación: tres senos lentos, desfasados. Movimiento natural, no ruido.
      idle.set(
        s.base.x + Math.sin(t * 0.21 + s.phase) * 0.14,
        s.base.y + Math.sin(t * 0.29 + s.phase * 1.3) * 0.2 + Math.sin(t * 0.11 + s.phase) * 0.08,
        s.base.z + Math.cos(t * 0.17 + s.phase * 0.7) * 0.12,
      );

      // Viento: la corriente invisible reúne los granos en un vórtice.
      r.swirl += dt * (0.25 + 1.6 * g) * g;
      if (g < 0.001) r.swirl = damp(r.swirl, 0, 2, dt);
      const angle = s.vortexAngle0 + r.swirl;
      const radius = s.vortexRadius * (1 - 0.35 * state.morph);
      vortex.set(
        WORLD.vortex.x + Math.cos(angle) * radius,
        WORLD.vortex.y + s.vortexHeight,
        WORLD.vortex.z + Math.sin(angle) * radius * 0.7,
      );
      pos.lerpVectors(idle, vortex, gEase);

      // Interacción con el puntero: el grano se aparta del rayo con suavidad.
      pushTarget.set(0, 0, 0);
      if (pointerRay && pointerInfluence > 0.001) {
        toBean.subVectors(pos, pointerRay.origin);
        const along = toBean.dot(pointerRay.direction);
        closest.copy(pointerRay.direction).multiplyScalar(along).add(pointerRay.origin);
        pushTarget.subVectors(pos, closest);
        const d = pushTarget.length();
        const reach = 1.5;
        if (d < reach && d > 1e-4) {
          const f = (1 - d / reach) ** 2 * 0.55 * pointerInfluence;
          pushTarget.multiplyScalar(f / d);
          r.spinKick = Math.max(r.spinKick, f * 2.2);
        } else {
          pushTarget.set(0, 0, 0);
        }
      }
      r.push.x = damp(r.push.x, pushTarget.x, 3.2, dt);
      r.push.y = damp(r.push.y, pushTarget.y, 3.2, dt);
      r.push.z = damp(r.push.z, pushTarget.z, 3.2, dt);
      pos.add(r.push);
      r.spinKick = damp(r.spinKick, 0, 1.4, dt);

      // Giro: se acelera con el viento.
      r.spin += dt * (s.spinSpeed * (1 + 9 * g) + r.spinKick * Math.sign(s.spinSpeed));
      spinQ.setFromAxisAngle(s.axis, r.spin);
      q.copy(s.orientation).multiply(spinQ);

      // Transformación escalonada: cada grano se abre con su propio retardo.
      const morph = clamp01((state.morph - s.delay * 0.45) / 0.55);
      r.morph = morph;
      dissolve[i] = morph;
      const sc = morph >= 0.999 ? 0 : s.scale * (1 - 0.18 * smoothstep(0.2, 1, morph));
      scl.set(sc, sc, sc);

      m.compose(pos, q, scl);
      m.toArray(matrices, i * 16);

      const row = i * BEAN_TEXELS * 4;
      for (let k = 0; k < 16; k++) data[row + k] = matrices[i * 16 + k];
      // La molienda usa la escala completa aunque el grano se esconda.
      if (sc === 0) {
        scl.set(s.scale * 0.82, s.scale * 0.82, s.scale * 0.82);
        m.compose(pos, q, scl);
        m.toArray(data, row);
      }
      data[row + 16] = morph;
      data[row + 17] = s.delay;
    }
    texture.needsUpdate = true;
  }

  return {
    count: n,
    matrices,
    dissolve,
    texture,
    update,
    dispose: () => texture.dispose(),
  };
}
