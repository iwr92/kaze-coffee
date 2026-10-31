import type { CatalogProvider } from "../types";

/**
 * Proveedor Tiendanube — PENDIENTE.
 *
 * Todavía no hay credenciales ni tienda conectada. Cuando existan:
 *  - TIENDANUBE_STORE_ID y TIENDANUBE_ACCESS_TOKEN en el entorno del servidor.
 *  - Mapear productos/variantes de la API de Tiendanube a `Product`.
 *  - El carrito y el checkout se delegan en Tiendanube.
 *
 * Mientras no esté configurado devuelve listas vacías: la interfaz muestra
 * un estado vacío honesto en lugar de productos inventados.
 */
export const tiendanubeProvider: CatalogProvider = {
  name: "tiendanube",
  isConfigured() {
    return Boolean(process.env.TIENDANUBE_STORE_ID && process.env.TIENDANUBE_ACCESS_TOKEN);
  },
  async listProducts() {
    return [];
  },
  async getProduct() {
    return null;
  },
  async listPackBenefits() {
    return [];
  },
};
