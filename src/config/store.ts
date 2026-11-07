/**
 * Configuración central de la tienda (WordPress + WooCommerce).
 *
 * El checkout vive solo en WooCommerce. Las páginas de STORE_PAGES figuran en
 * el sitemap de la tienda (verificadas el 2026-11-07).
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
