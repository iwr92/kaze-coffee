import { PRODUCTS, type GrindId } from "@/commerce/products";

/**
 * Opciones de molienda confirmadas y su fuente. Solo se ofrece lo que está
 * confirmado; el resto se muestra como pendiente.
 *
 * - "grano": brand/MANUAL-DE-MARCA.md, línea 1: "tienda online de café de
 *   especialidad en grano y prensas francesas".
 * - Molido: sin confirmación todavía. Se habilita en cuanto un producto real
 *   del catálogo lo declare en `grinds`, o agregándolo acá con su fuente.
 */
const CONFIRMED_BY_BRAND: GrindId[] = ["grano"];

export interface GrindAvailability {
  confirmed: GrindId[];
  groundConfirmed: boolean;
}

export function grindAvailability(): GrindAvailability {
  const confirmed = new Set<GrindId>(CONFIRMED_BY_BRAND);
  for (const p of PRODUCTS) for (const g of p.grinds) confirmed.add(g);
  const list = [...confirmed];
  return { confirmed: list, groundConfirmed: list.some((g) => g !== "grano") };
}
