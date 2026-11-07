import { STORE_PAGES } from "@/config/store";
import type { Product } from "./products";

export interface ProductCta {
  label: string;
  href: string;
}

/** Texto y destino del botón principal de cada café. Nunca inventa una URL. */
export function productCta(product: Product): ProductCta {
  if (!product.productUrl) return { label: "Ir a la tienda", href: STORE_PAGES.shop };
  if (product.grindOptions.length > 0) return { label: "Elegir molienda", href: product.productUrl };
  return { label: "Comprar", href: product.productUrl };
}

/** Estado de venta de cada café: solo afirma lo que respalda WooCommerce. */
export function availabilityText(product: Product): string {
  if (product.available === true) return "Disponible en la tienda";
  if (product.available === false) return product.productUrl ? "Sin stock por ahora" : "Consultá la tienda";
  return "Comprá online en la tienda";
}
