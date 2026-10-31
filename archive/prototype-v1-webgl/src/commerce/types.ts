/**
 * Modelo comercial de KAZE.
 *
 * KAZE vende cafés de distintos tostadores: cada producto conserva la marca
 * y el packaging de su tostador. Ningún precio, descuento ni stock vive en
 * el código; todo llega desde el proveedor de catálogo (Tiendanube).
 */

/** Montos en centavos de peso argentino, para evitar errores de redondeo. */
export interface MoneyARS {
  currency: "ARS";
  cents: number;
}

export type GrindOption =
  | "grano"
  | "espresso"
  | "moka"
  | "filtro"
  | "prensa-francesa";

export type ProductKind = "cafe" | "accesorio" | "pack";

export interface Roaster {
  id: string;
  name: string;
  city?: string;
  url?: string;
}

export interface CoffeeProfile {
  origin: string;
  region?: string;
  process?: string;
  altitudeMasl?: number;
  /** Notas de cata con sensaciones concretas, como pide el manual. */
  notes: string[];
  roastDate?: string;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  /** Peso en gramos (cafés) o capacidad en ml (accesorios). */
  size?: { value: number; unit: "g" | "ml" };
  grind?: GrindOption;
  price: MoneyARS;
  compareAtPrice?: MoneyARS;
  available: boolean;
  /** Identificador de la variante en Tiendanube. */
  externalId?: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  slug: string;
  kind: ProductKind;
  name: string;
  roaster?: Roaster;
  coffee?: CoffeeProfile;
  description?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  /** Identificador del producto en Tiendanube. */
  externalId?: string;
}

export interface PackBenefit {
  id: string;
  title: string;
  description: string;
  /** Mínimo de unidades para que aplique. */
  minUnits: number;
}

export interface CatalogProvider {
  readonly name: string;
  isConfigured(): boolean;
  listProducts(filter?: { kind?: ProductKind }): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  listPackBenefits(): Promise<PackBenefit[]>;
}
