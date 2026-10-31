import { BufferGeometry, IcosahedronGeometry } from "three";

/**
 * Fragmento de café molido: un poliedro irregular y aplanado.
 * Las caras se sombrean planas para que cada partícula lea como una
 * esquirla con volumen, no como un disco.
 */
export function createGroundGeometry(): BufferGeometry {
  const geometry = new IcosahedronGeometry(1, 0);
  const position = geometry.getAttribute("position");

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    // Hash por posición: los vértices compartidos se desplazan igual, sin grietas.
    const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    const jitter = 0.72 + 0.5 * (h - Math.floor(h));
    position.setXYZ(i, x * jitter, y * jitter * 0.72, z * jitter * 0.5);
  }

  geometry.computeVertexNormals();
  return geometry;
}
