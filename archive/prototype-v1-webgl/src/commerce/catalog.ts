import { tiendanubeProvider } from "./providers/tiendanube";
import type { CatalogProvider, MoneyARS } from "./types";

/** Punto único de acceso al catálogo. Cambiar de proveedor se hace acá. */
export const catalog: CatalogProvider = tiendanubeProvider;

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatARS(money: MoneyARS): string {
  return ars.format(money.cents / 100);
}
