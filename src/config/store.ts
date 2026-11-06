/**
 * Configuración central de la tienda (WordPress + WooCommerce).
 *
 * El checkout vive solo en WooCommerce. Las páginas de STORE_PAGES figuran en
 * el sitemap de la tienda (verificado el 2026-11-06).
 */

export const STORE_URL = "https://tienda.kazecoffee.shop";

export const STORE_PAGES = {
  shop: `${STORE_URL}/tienda/`,
  shipping: `${STORE_URL}/politica-de-envios/`,
  terms: `${STORE_URL}/terminos-y-condiciones/`,
  returns: `${STORE_URL}/reembolso_devoluciones/`,
  withdrawal: `${STORE_URL}/boton-de-arrepentimiento/`,
  privacy: `${STORE_URL}/privacy-policy/`,
  contact: `${STORE_URL}/contacto/`,
} as const;

/**
 * Interruptor de ventas. Cualquier valor distinto de "true" las deja apagadas.
 * Se activa cuando el stock esté recibido y WooCommerce habilitado.
 *
 *   false: se muestran productos y precios, sin afirmar disponibilidad.
 *   true:  CTAs a WooCommerce y disponibilidad leída de la tienda.
 */
export const SALES_ENABLED = process.env.NEXT_PUBLIC_KAZE_SALES_ENABLED === "true";

/** Ancla del estado de apertura mientras las ventas están apagadas. */
export const STORE_STATUS_ANCHOR = "#tienda";
