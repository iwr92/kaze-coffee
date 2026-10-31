import { Color, DoubleSide, MeshPhysicalMaterial } from "three";
import { KZ_DISSOLVE_FREQ, noiseGLSL } from "../shaders/noise";

/**
 * Café tostado: superficie de rugosidad media con un clearcoat leve
 * (los aceites del tueste), moteado sutil en espacio de objeto y una
 * disolución por ruido que abre el grano en molienda.
 */
export function createBeanMaterial(): MeshPhysicalMaterial {
  const material = new MeshPhysicalMaterial({
    color: new Color("#3b2214"),
    roughness: 0.52,
    metalness: 0,
    clearcoat: 0.32,
    clearcoatRoughness: 0.38,
    sheen: 0.25,
    sheenRoughness: 0.6,
    sheenColor: new Color("#8a5a36"),
    vertexColors: true,
    side: DoubleSide,
  });

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute float aDissolve;
varying float vKzDissolve;
varying vec3 vKzObj;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vKzObj = position;
vKzDissolve = aDissolve;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying float vKzDissolve;
varying vec3 vKzObj;
${noiseGLSL}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float kzN = kzNoise01(vKzObj * ${KZ_DISSOLVE_FREQ});
float kzThr = kzDissolveThreshold(vKzDissolve);
if (vKzDissolve > 0.0005 && kzN < kzThr) discard;
// Moteado del tueste: variación fina y otra más amplia.
float kzMottle = kzNoise01(vKzObj * 23.0) * 0.6 + kzNoise01(vKzObj * 5.0) * 0.4;
diffuseColor.rgb *= 0.8 + 0.4 * kzMottle;
// Borde de la grieta: el interior del grano es más claro que su piel.
float kzEdge = (1.0 - smoothstep(0.0, 0.05, kzN - kzThr)) * step(0.0005, vKzDissolve);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.32, 0.19, 0.1), kzEdge);
// Cara interna del grano abierto, en sombra.
if (!gl_FrontFacing) diffuseColor.rgb *= 0.45;`,
      );
  };
  material.customProgramCacheKey = () => "kaze-bean";
  return material;
}
