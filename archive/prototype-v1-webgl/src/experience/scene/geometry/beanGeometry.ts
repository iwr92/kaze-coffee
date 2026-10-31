import { BufferGeometry, Float32BufferAttribute } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Grano de café tostado, procedural.
 *
 * Forma: un óvalo de ~1 unidad de largo (eje Y) con la cara frontal (+Z)
 * casi plana y el dorso abombado, como un grano real. Sobre la cara plana
 * corre el surco central en forma de S suave, con labios levemente elevados
 * y piel plateada (chaff) clara en el fondo.
 *
 * La malla se parametriza como esfera con polos en los extremos del grano y
 * los meridianos concentrados hacia el frente, de modo que el surco queda
 * bien resuelto sin subir la cantidad total de triángulos.
 */

const HALF_LENGTH = 0.5;
const HALF_WIDTH = 0.36;
const FRONT_DEPTH = 0.15;
const BACK_DEPTH = 0.27;

const CREASE_DEPTH = 0.085;
const CREASE_WIDTH = 0.032;
const LIP_HEIGHT = 0.014;
const LIP_OFFSET = 0.062;

function smooth(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/** Línea central del surco: una S suave a lo largo del grano. */
function creaseCenter(y: number): number {
  return 0.045 * Math.sin((y / HALF_LENGTH) * 2.5) - 0.012;
}

export function createBeanGeometry(around: number, along: number): BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= along; j++) {
    const theta = (Math.PI * j) / along;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let i = 0; i <= around; i++) {
      // φ = 0 apunta al frente (+Z). Se concentran meridianos cerca del frente.
      const s = (2 * i) / around - 1;
      const phi = Math.PI * Math.sign(s) * Math.pow(Math.abs(s), 1.55);
      const ux = sinT * Math.sin(phi);
      const uz = sinT * Math.cos(phi);
      const uy = cosT;

      const y = uy * HALF_LENGTH;
      // Un extremo apenas más ancho: los granos no son simétricos.
      let x = ux * HALF_WIDTH * (1 + 0.07 * uy);
      let z: number;
      if (uz >= 0) {
        // Cara frontal: meseta plana que redondea hacia el borde.
        z = FRONT_DEPTH * Math.pow(uz, 0.38);
      } else {
        z = -BACK_DEPTH * Math.pow(-uz, 0.78);
      }

      // Surco y labios, solo en la cara frontal.
      const front = smooth(0.25, 0.7, uz);
      const alongFade = 1 - smooth(0.62, 0.96, Math.abs(uy));
      const d = x - creaseCenter(y);
      const groove = Math.exp(-((d / CREASE_WIDTH) ** 2));
      const lip = Math.exp(-(((Math.abs(d) - LIP_OFFSET) / 0.034) ** 2));
      const w = front * alongFade;
      z += (LIP_HEIGHT * lip - CREASE_DEPTH * groove) * w;
      // Los labios se cierran levemente sobre el surco.
      x -= Math.sign(d) * 0.006 * groove * w;

      positions.push(x, y, z);

      // Color de vértice (multiplica el color base del material):
      // fondo del surco con piel plateada clara, bordes del surco en sombra.
      const chaff = Math.exp(-((d / (CREASE_WIDTH * 0.45)) ** 2)) * w;
      const shade = Math.exp(-(((Math.abs(d) - CREASE_WIDTH * 1.2) / 0.02) ** 2)) * w;
      const base = 1 - 0.32 * shade;
      colors.push(
        base + chaff * 1.9,
        base + chaff * 1.75,
        base + chaff * 1.55,
      );
    }
  }

  const row = around + 1;
  for (let j = 0; j < along; j++) {
    for (let i = 0; i < around; i++) {
      const a = j * row + i;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      if (j !== 0) indices.push(a, b, d);
      if (j !== along - 1) indices.push(b, c, d);
    }
  }

  let geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  // Une la costura del dorso y los polos para que las normales sean continuas.
  geometry = mergeVertices(geometry, 1e-5);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
