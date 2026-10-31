/**
 * Catálogo de KAZE.
 *
 * KAZE vende café de tostadores externos: cada producto conserva la marca y
 * el packaging de su proveedor. Nunca se inventan productos, bolsas con
 * marca KAZE, nombres, precios, pesos ni orígenes.
 *
 * Para cargar un producto real:
 *  1. Foto real del producto en public/products/<id>.webp (4:5, ver docs/v4).
 *  2. Agregar el objeto a PRODUCTS con los datos confirmados por el proveedor.
 *  3. `url`: la página del producto en Tiendanube. Sin ella, el botón lleva
 *     a la tienda general (si está configurada) o a #tienda.
 *
 * Más adelante PRODUCTS puede llenarse desde la API de Tiendanube sin cambiar
 * los componentes: solo tienen que recibir objetos `Product`.
 */

/** Opciones de molienda que un producto puede declarar. */
export type GrindId = "grano" | "espresso" | "moka" | "filtro" | "prensa";

export const GRIND_LABELS: Record<GrindId, string> = {
  grano: "En grano",
  espresso: "Molido para espresso",
  moka: "Molido para moka",
  filtro: "Molido para filtro",
  prensa: "Molido para prensa francesa",
};

/**
 * Familias de sabor para "Descubrí tu café". Un producto declara las suyas
 * según las notas que publica su tostador; la sección solo muestra cafés que
 * las declaren (nunca las infiere).
 */
export type TasteFamily = "frutal" | "achocolatado" | "floral" | "dulce";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  /** Nombre comercial del café, tal como lo publica el proveedor. */
  name: string;
  /** Marca del tostador o proveedor. */
  roaster: string;
  image: ProductImage;
  /** Variedad o perfil de taza (por ejemplo, origen y notas). */
  profile: string;
  /** Familias de sabor declaradas a partir de las notas del tostador. */
  tasteFamilies?: TasteFamily[];
  weightGrams: number;
  /** Moliendas disponibles para este producto. */
  grinds: GrindId[];
  /** Precio en pesos argentinos, sin decimales. */
  priceARS: number;
  /** URL del producto en Tiendanube. */
  url?: string;
}

/** Productos reales. Vacío hasta contar con fotos y datos confirmados. */
export const PRODUCTS: Product[] = [];

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function formatPrice(value: number): string {
  return ars.format(value);
}

export function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString("es-AR")} kg` : `${grams} g`;
}

/**
 * Elementos que muestra el showcase. Sin productos reales, muestra espacios
 * pendientes claramente rotulados para revisar el diseño. Nunca mezcla
 * productos reales con pendientes.
 */
export type ShowcaseItem = { kind: "product"; product: Product } | { kind: "pending"; slot: number };

export const PENDING_SLOTS = 3;

export function showcaseItems(products: readonly Product[] = PRODUCTS): ShowcaseItem[] {
  if (products.length > 0) return products.map((product) => ({ kind: "product", product }));
  return Array.from({ length: PENDING_SLOTS }, (_, slot) => ({ kind: "pending", slot }));
}
