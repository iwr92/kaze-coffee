"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type Material,
  Vector2,
} from "three";
import { WORLD, backgroundRamp, lerp, smoothstep } from "../timeline/choreography";
import { CUP, createCupProfile, innerRadiusAt } from "./geometry/cupProfile";
import { sceneState } from "./sceneState";

interface CupProps {
  transmission: boolean;
}

const NEGRO = new Color("#151311");
const BED = new Color("#3a2416");
const COFFEE = new Color("#1d0e06");
const rgb = { r: 0, g: 0, b: 0 };
const COFFEE_TOP = new Color("#ffffff");

const FULL_LEVEL = 0.78; // fracción de la altura útil interior
const BED_LEVEL = 0.12;
const POUR_TOP = CUP.height + 3.2;

function radialTexture(stops: [number, string][], size = 256): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/**
 * Escena 04 — The Ritual (primera pasada, Fase 01).
 *
 * Taza de vidrio de doble pared torneada, lecho de molienda, chorro de agua
 * caliente y café que sube. El vapor y el movimiento fino de la superficie
 * quedan para la Fase 02.
 */
export function Cup({ transmission }: CupProps) {
  const group = useRef<Group>(null);

  const r = useMemo(() => {
    const profile = createCupProfile();
    const glassGeometry = new LatheGeometry(profile, 96);

    const glass = new MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.03,
      metalness: 0,
      ior: 1.47, // borosilicato
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      specularIntensity: 1,
      envMapIntensity: 1.2,
      depthWrite: false,
      ...(transmission
        ? { transmission: 1, thickness: 0.12, attenuationColor: new Color("#f6efe2"), attenuationDistance: 3 }
        : {}),
    });

    // Líquido: un cilindro con la forma de la pared interior, escalado en Y.
    const usable = CUP.height - CUP.innerFloor - 0.05;
    const liquidProfile: Vector2[] = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const y = CUP.innerFloor + (usable * i) / steps;
      liquidProfile.push(new Vector2(innerRadiusAt(y) - 0.012, (usable * i) / steps));
    }
    liquidProfile.unshift(new Vector2(0.0001, 0));
    const liquidGeometry = new LatheGeometry(liquidProfile, 64);
    liquidGeometry.scale(1, 1 / usable, 1); // altura unitaria
    // Café: opaco (debe verse a través del vidrio transmisivo), con sheen
    // ámbar en los ángulos rasantes, donde el café real se vuelve rojizo.
    const liquid = new MeshPhysicalMaterial({
      color: BED.clone(),
      roughness: 0.85,
      clearcoat: 0,
      sheen: 0,
      sheenColor: new Color("#9a4a1a"),
      sheenRoughness: 0.35,
    });

    // Superficie: crema del café hacia el borde.
    const topTexture = radialTexture([
      [0, "#140a05"],
      [0.62, "#1f1109"],
      [0.86, "#5b3720"],
      [1, "#8a5a36"],
    ]);
    const topGeometry = new CircleGeometry(1, 64);
    topGeometry.rotateX(-Math.PI / 2);
    const top = new MeshPhysicalMaterial({
      color: BED.clone(),
      map: topTexture,
      roughness: 0.6,
      clearcoat: 0,
      clearcoatRoughness: 0.05,
    });

    // Agua caliente: un hilo fino, cae desde fuera de cuadro.
    // No es transmisivo: así se ve también a través del vidrio de la taza.
    const pourGeometry = new CylinderGeometry(0.022, 0.03, 1, 20, 1, true);
    pourGeometry.translate(0, -0.5, 0);
    const pour = new MeshPhysicalMaterial({
      color: "#fbf4e8",
      roughness: 0.04,
      ior: 1.33,
      transparent: true,
      opacity: 0.42,
      envMapIntensity: 1.6,
      depthWrite: false,
    });

    // Superficie crema infinita: mismo color que el fondo, sin tone mapping.
    const surfaceGeometry = new PlaneGeometry(80, 80);
    surfaceGeometry.rotateX(-Math.PI / 2);
    const surface = new MeshBasicMaterial({ color: NEGRO.clone(), toneMapped: false, fog: false });
    const shadowTexture = radialTexture([
      [0, "rgba(21,19,17,0.42)"],
      [0.45, "rgba(21,19,17,0.2)"],
      [1, "rgba(21,19,17,0)"],
    ]);
    const shadowGeometry = new PlaneGeometry(1, 1);
    shadowGeometry.rotateX(-Math.PI / 2);
    const shadow = new MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });

    return {
      glassGeometry,
      glass,
      liquidGeometry,
      liquid,
      topGeometry,
      top,
      topTexture,
      pourGeometry,
      pour,
      surfaceGeometry,
      surface,
      shadowGeometry,
      shadow,
      shadowTexture,
    };
  }, [transmission]);

  useEffect(
    () => () => {
      for (const value of Object.values(r)) (value as Material | { dispose(): void }).dispose();
    },
    [r],
  );

  const liquidRef = useRef<Group>(null);
  const topRef = useRef<Group>(null);
  const pourRef = useRef<Group>(null);

  useFrame(() => {
    const c = sceneState.choreo;
    const g = group.current;
    if (!g) return;

    g.visible = c.cup > 0.001;
    if (!g.visible) return;

    // La taza aparece desde la niebla, con un leve ascenso.
    const reveal = c.cup;
    g.position.set(WORLD.cup.x, WORLD.cup.y - (1 - reveal) * 0.35, WORLD.cup.z);
    // Sin transmisión, el vidrio se aproxima con transparencia y reflejos.
    r.glass.opacity = reveal * (transmission ? 1 : 0.24);

    // Fondo crema: superficie y sombra de contacto.
    backgroundRamp(c.background, rgb);
    r.surface.color.setRGB(rgb.r, rgb.g, rgb.b, SRGBColorSpace);
    r.shadow.opacity = smoothstep(0.3, 1, c.background) * reveal;

    // Nivel: primero el lecho de molienda, luego el agua lo sube.
    const level = BED_LEVEL * c.bed + (FULL_LEVEL - BED_LEVEL) * c.brew;
    const usable = CUP.height - CUP.innerFloor - 0.05;
    const h = Math.max(0.001, level * usable);
    const lq = liquidRef.current;
    const tp = topRef.current;
    if (lq && tp) {
      lq.visible = tp.visible = level > 0.004;
      lq.scale.set(1, h, 1);
      const rad = innerRadiusAt(CUP.innerFloor + h) - 0.012;
      tp.position.y = CUP.innerFloor + h;
      tp.scale.set(rad, 1, rad);
    }
    const brewed = smoothstep(0.05, 0.75, c.brew);
    r.liquid.color.lerpColors(BED, COFFEE, brewed);
    r.liquid.roughness = lerp(0.85, 0.14, brewed);
    r.liquid.clearcoat = brewed;
    r.liquid.sheen = brewed;
    r.top.color.lerpColors(BED, COFFEE_TOP, brewed);
    r.top.roughness = lerp(0.85, 0.25, brewed);
    r.top.clearcoat = brewed;

    // Chorro de agua: la cabeza cae hasta la superficie, luego la cola baja.
    const p = pourRef.current;
    if (p) {
      const surfaceY = CUP.innerFloor + h;
      const head = lerp(POUR_TOP, surfaceY, c.pourHead);
      const tail = lerp(POUR_TOP, surfaceY, c.pourTail);
      const len = Math.max(0, tail - head);
      p.visible = len > 0.01;
      p.position.set(0.12, tail, 0.05);
      p.scale.set(1, len, 1);
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={r.surfaceGeometry} material={r.surface} renderOrder={-1} />
      <mesh
        geometry={r.shadowGeometry}
        material={r.shadow}
        position={[0.25, 0.002, 0.1]}
        scale={[2.6, 1, 2.2]}
      />
      <group ref={liquidRef} position={[0, CUP.innerFloor, 0]}>
        <mesh geometry={r.liquidGeometry} material={r.liquid} />
      </group>
      <group ref={topRef}>
        <mesh geometry={r.topGeometry} material={r.top} />
      </group>
      <group ref={pourRef}>
        <mesh geometry={r.pourGeometry} material={r.pour} />
      </group>
      <mesh geometry={r.glassGeometry} material={r.glass} renderOrder={2} />
    </group>
  );
}
