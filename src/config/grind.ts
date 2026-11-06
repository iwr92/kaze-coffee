import type { GrindId } from "@/commerce/products";

export interface GrindGuide {
  id: GrindId;
  /** Textura según la tabla de la guía KAZE Home Barista. */
  texture: string;
  similarTo: string;
  use: string;
  /** Tamaño de partícula (0: grano entero) y cantidad en la ilustración. */
  particle: { radius: number; count: number };
}

/**
 * Opciones de molienda del catálogo. Texturas: guía KAZE Home Barista, p. 4.
 * Usos: ficha de WooCommerce. No indican disponibilidad de una bolsa concreta.
 */
export const GRIND_GUIDE: GrindGuide[] = [
  {
    id: "grano",
    texture: "Entero",
    similarTo: "Sin moler",
    use: "Para moler en casa, justo antes de preparar.",
    particle: { radius: 0, count: 0 },
  },
  {
    id: "espresso",
    texture: "Fina",
    similarTo: "Como sal muy fina",
    use: "Para máquinas de espresso.",
    particle: { radius: 0.24, count: 520 },
  },
  {
    id: "filtro",
    texture: "Media",
    similarTo: "Como arena o azúcar",
    use: "Para V60, Chemex o cafeteras de goteo.",
    particle: { radius: 0.5, count: 340 },
  },
  {
    id: "prensa",
    texture: "Gruesa",
    similarTo: "Como sal gruesa",
    use: "Para prensa francesa e infusiones largas.",
    particle: { radius: 0.85, count: 200 },
  },
  {
    id: "moka",
    texture: "Media-fina",
    similarTo: "Como sal fina",
    use: "Para cafetera italiana.",
    particle: { radius: 0.34, count: 440 },
  },
];
