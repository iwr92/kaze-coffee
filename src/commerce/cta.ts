import { SALES_ENABLED, STORE_PAGES } from "@/config/store";
import type { Product } from "./products";

export interface ProductCta {
  label: string;
  /** `null`: con ventas desactivadas, el botón abre la ficha en la página. */
  href: string | null;
}

/** Texto y destino del botón principal de cada café. Nunca inventa una URL. */
export function productCta(product: Product): ProductCta {
  if (!SALES_ENABLED) return { label: "Ver café", href: null };
  if (!product.productUrl) return { label: "Explorar todos los cafés", href: STORE_PAGES.shop };
  if (product.grindOptions.length > 0) return { label: "Elegir molienda", href: product.productUrl };
  return { label: "Comprar en la tienda", href: product.productUrl };
}

/** Estado de venta de cada café: solo afirma lo que respalda WooCommerce. */
export function availabilityText(product: Product): string {
  if (!SALES_ENABLED) return "La tienda abre pronto";
  if (product.available === true) return "Disponible en la tienda";
  if (product.available === false) return product.productUrl ? "Sin stock por ahora" : "Todavía no está en la tienda";
  return "Consultá la disponibilidad en la tienda";
}
