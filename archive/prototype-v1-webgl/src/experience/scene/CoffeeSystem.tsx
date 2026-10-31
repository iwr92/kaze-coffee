"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  Ray,
  Vector2,
  Vector3,
} from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import type { QualityProfile } from "../config/quality";
import { store } from "../state/store";
import { createBeanField } from "./beanField";
import { createBeanGeometry } from "./geometry/beanGeometry";
import { createGroundGeometry } from "./geometry/groundGeometry";
import { createBeanMaterial } from "./materials/beanMaterial";
import { createGroundsMaterial, type GroundsUniforms } from "./materials/groundsMaterial";
import { sceneState } from "./sceneState";

interface CoffeeSystemProps {
  quality: QualityProfile;
}

/**
 * Granos y molienda como un solo sistema: los fragmentos de molienda nacen
 * de la superficie de los granos, así que comparten el mismo campo.
 */
export function CoffeeSystem({ quality }: CoffeeSystemProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const beansRef = useRef<InstancedMesh>(null);

  // La composición se arma una vez, con el aspecto inicial del viewport.
  const aspectAtMount = useRef(size.width / Math.max(1, size.height)).current;

  const resources = useMemo(() => {
    const field = createBeanField(quality.beans, aspectAtMount);
    const beanGeometry = createBeanGeometry(quality.beanSegments[0], quality.beanSegments[1]);
    const dissolveAttr = new InstancedBufferAttribute(field.dissolve, 1);
    dissolveAttr.setUsage(DynamicDrawUsage);
    beanGeometry.setAttribute("aDissolve", dissolveAttr);
    const beanMaterial = createBeanMaterial();

    // Molienda: puntos de superficie muestreados sobre la geometría del grano.
    const perBean = quality.fragmentsPerBean;
    const total = field.count * perBean;
    const groundGeometry = createGroundGeometry();
    const aLocal = new Float32Array(total * 3);
    const aLocalN = new Float32Array(total * 3);
    const aSeed = new Float32Array(total * 4);
    const aBean = new Float32Array(total);
    const sampler = new MeshSurfaceSampler(new Mesh(beanGeometry)).build();
    const p = new Vector3();
    const nrm = new Vector3();
    let rnd = 12345;
    const rand = () => {
      rnd = (rnd * 16807) % 2147483647;
      return (rnd - 1) / 2147483646;
    };
    for (let i = 0; i < total; i++) {
      sampler.sample(p, nrm);
      aLocal.set([p.x, p.y, p.z], i * 3);
      aLocalN.set([nrm.x, nrm.y, nrm.z], i * 3);
      aSeed.set([rand(), rand(), rand(), rand()], i * 4);
      aBean[i] = Math.floor(i / perBean);
    }
    groundGeometry.setAttribute("aLocal", new InstancedBufferAttribute(aLocal, 3));
    groundGeometry.setAttribute("aLocalN", new InstancedBufferAttribute(aLocalN, 3));
    groundGeometry.setAttribute("aSeed", new InstancedBufferAttribute(aSeed, 4));
    groundGeometry.setAttribute("aBean", new InstancedBufferAttribute(aBean, 1));

    const uniforms: GroundsUniforms = {
      uBeans: { value: field.texture },
      uBeanCount: { value: field.count },
      uTime: { value: 0 },
      uFlow: { value: 0 },
    };
    const groundsMaterial = createGroundsMaterial(uniforms);

    const grounds = new InstancedMesh(groundGeometry, groundsMaterial, total);
    grounds.frustumCulled = false;
    const identity = new Matrix4();
    const color = new Color();
    const light = new Color("#5c3a22");
    const dark = new Color("#22140b");
    for (let i = 0; i < total; i++) {
      grounds.setMatrixAt(i, identity);
      // El interior del grano molido es más claro que su piel.
      color.lerpColors(dark, light, Math.pow(aSeed[i * 4 + 2], 1.4) * 0.85 + rand() * 0.15);
      grounds.setColorAt(i, color);
    }

    return { field, beanGeometry, beanMaterial, dissolveAttr, grounds, uniforms };
    // Los recursos se crean una sola vez por perfil de calidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  useEffect(() => {
    return () => {
      resources.field.dispose();
      resources.beanGeometry.dispose();
      resources.beanMaterial.dispose();
      resources.grounds.geometry.dispose();
      (resources.grounds.material as { dispose(): void }).dispose();
      resources.grounds.dispose();
    };
  }, [resources]);

  const ray = useMemo(() => new Ray(), []);
  const ndc = useMemo(() => new Vector2(), []);
  const pointerTarget = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const beans = beansRef.current;
    if (!beans) return;
    const { field, dissolveAttr, uniforms } = resources;

    let pointerRay: Ray | null = null;
    if (store.pointerActive) {
      ndc.set(sceneState.pointer.x, sceneState.pointer.y);
      ray.origin.setFromMatrixPosition(camera.matrixWorld);
      pointerTarget.set(ndc.x, ndc.y, 0.5).unproject(camera);
      ray.direction.subVectors(pointerTarget, ray.origin).normalize();
      pointerRay = ray;
    }

    field.update(sceneState.choreo, sceneState.dt, pointerRay);
    (beans.instanceMatrix.array as Float32Array).set(field.matrices);
    beans.instanceMatrix.needsUpdate = true;
    dissolveAttr.needsUpdate = true;
    beans.visible = sceneState.choreo.morph < 0.999;

    uniforms.uTime.value = sceneState.choreo.time;
    uniforms.uFlow.value = sceneState.choreo.flow;
    resources.grounds.visible = sceneState.choreo.morph > 0.0005 && sceneState.choreo.flow < 0.999;
  });

  return (
    <>
      <instancedMesh
        ref={beansRef}
        args={[resources.beanGeometry, resources.beanMaterial, resources.field.count]}
        frustumCulled={false}
      />
      <primitive object={resources.grounds} />
    </>
  );
}
