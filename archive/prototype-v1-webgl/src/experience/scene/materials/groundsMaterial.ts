import { MeshStandardMaterial, type DataTexture, type IUniform } from "three";
import { WORLD } from "../../timeline/choreography";
import { BEAN_TEXELS } from "../beanField";
import { KZ_DISSOLVE_FREQ, noiseGLSL } from "../shaders/noise";

export interface GroundsUniforms {
  [key: string]: IUniform;
  uBeans: IUniform<DataTexture>;
  uBeanCount: IUniform<number>;
  uTime: IUniform<number>;
  uFlow: IUniform<number>;
}

const f = (v: number) => v.toFixed(4);

/**
 * Molienda en GPU.
 *
 * Cada fragmento conoce su grano (aBean) y un punto de su superficie
 * (aLocal, aLocalN). Lee la matriz del grano desde la DataTexture, nace
 * cuando la disolución del grano pasa por ese punto, sale despedido unos
 * milímetros y luego entra en la corriente de viento que baja hasta la taza.
 * Su posición depende solo de (progreso, tiempo): avanza y retrocede igual.
 */
export function createGroundsMaterial(uniforms: GroundsUniforms): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.82,
    metalness: 0,
    flatShading: true,
  });

  // Termina sobre el lecho de molienda, dentro de la taza.
  const cupMouthY = WORLD.cup.y + 0.62;

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
uniform sampler2D uBeans;
uniform float uBeanCount;
uniform float uTime;
uniform float uFlow;
attribute vec3 aLocal;
attribute vec3 aLocalN;
attribute vec4 aSeed;
attribute float aBean;
${noiseGLSL}

vec4 kzTexel(float column) {
  return texture2D(uBeans, vec2((column + 0.5) / ${f(BEAN_TEXELS)}, (aBean + 0.5) / uBeanCount));
}

mat3 kzRotation(vec3 axis, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat3(
    oc * axis.x * axis.x + c,          oc * axis.x * axis.y + axis.z * s, oc * axis.z * axis.x - axis.y * s,
    oc * axis.x * axis.y - axis.z * s, oc * axis.y * axis.y + c,          oc * axis.y * axis.z + axis.x * s,
    oc * axis.z * axis.x + axis.y * s, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.z + c
  );
}

// Corriente de viento: nace en el vórtice y desciende en espiral hasta la taza.
vec3 kzStream(float u, vec4 seed) {
  float y = mix(${f(WORLD.vortex.y + 0.4)}, ${f(cupMouthY)}, pow(u, 1.08));
  float open = 1.0 - smoothstep(0.0, 0.92, u);
  float a = u * 6.3 + 0.8;
  vec3 c = vec3(
    sin(a) * 2.1 * open + sin(u * 3.14159) * 1.3 * (1.0 - u),
    y,
    cos(a) * 1.3 * open
  );
  float radius = mix(1.25, 0.2, smoothstep(0.0, 0.85, u)) * (0.25 + 0.75 * seed.z);
  // Al llegar, se abre sobre el lecho en lugar de apilarse.
  radius += smoothstep(0.86, 1.0, u) * 0.32 * seed.z;
  float phi = seed.w * 6.28318 + uTime * (0.45 + 1.4 * u) + u * 9.0;
  c += vec3(cos(phi) * radius, (seed.x - 0.5) * 0.6 * (1.0 - u), sin(phi) * radius);
  c += 0.07 * (1.0 - u) * vec3(
    sin(uTime * 1.3 + seed.y * 40.0),
    sin(uTime * 1.1 + seed.z * 37.0),
    cos(uTime * 1.7 + seed.x * 29.0)
  );
  return c;
}`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `mat4 kzB = mat4(kzTexel(0.0), kzTexel(1.0), kzTexel(2.0), kzTexel(3.0));
vec4 kzMeta = kzTexel(4.0);
float kzMorph = kzMeta.x;

// Nacimiento: el mismo ruido que disuelve el grano.
float kzN = kzNoise01(aLocal * ${KZ_DISSOLVE_FREQ});
float kzThr = kzDissolveThreshold(kzMorph);
float kzE = smoothstep(0.0, 0.1, kzThr - kzN) * step(0.0005, kzMorph);

vec3 kzStart = (kzB * vec4(aLocal, 1.0)).xyz;
vec3 kzNormal = normalize(mat3(kzB) * aLocalN);

// Estallido suave hacia afuera, empujado por el viento.
vec3 kzBurst = kzStart
  + kzNormal * (0.1 + aSeed.w * 0.32) * kzE
  + vec3(0.3, -0.06, 0.05) * kzE * aSeed.z
  + vec3(
      sin(uTime * 0.7 + aSeed.x * 30.0),
      cos(uTime * 0.5 + aSeed.y * 20.0),
      sin(uTime * 0.6 + aSeed.z * 25.0)
    ) * 0.05 * kzE;

// Avance por la corriente. Solo fluye lo que ya nació.
float kzU = clamp(uFlow * 1.75 - aSeed.y * 0.72, 0.0, 1.0) * kzE;
float kzW = smoothstep(0.0, 0.32, kzU);
vec3 kzCenter = mix(kzBurst, kzStream(kzU, aSeed), kzW);

// Se asienta dentro de la taza.
float kzSink = smoothstep(0.84, 1.0, kzU);
float kzSize = kzE * (1.0 - kzSink) * mix(0.02, 0.048, aSeed.z * aSeed.z) * (1.0 - 0.25 * kzW);

vec3 kzAxis = normalize(vec3(aSeed.y - 0.5, aSeed.z - 0.5, aSeed.w - 0.5) + vec3(0.001));
float kzAngle = aSeed.x * 6.28318 + uTime * (0.4 + 2.2 * kzW) * (0.4 + aSeed.w);
mat3 kzR = kzRotation(kzAxis, kzAngle);

vec3 objectNormal = kzR * normal;
#ifdef USE_TANGENT
  vec3 objectTangent = vec3(tangent.xyz);
#endif`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = kzCenter + kzR * (position * kzSize);`,
      );
  };
  material.customProgramCacheKey = () => "kaze-grounds";
  return material;
}
