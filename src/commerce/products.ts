/**
 * Catálogo de KAZE: la única fuente de datos comerciales de la landing.
 *
 * Fuentes (verificadas el 2026-11-06, ver docs/lanzamiento/README.md):
 *  - Datos de cada café: fichas oficiales de tienda.bell-coffee.com.
 *  - Precio, enlaces y moliendas: WooCommerce (tienda.kazecoffee.shop),
 *    verificados el 2026-11-07. Son el respaldo si la API no responde.
 *
 * Este archivo se publica: nunca agregar costos, márgenes ni cantidades
 * compradas. El stock real se gestiona solo en WooCommerce.
 *
 * `resolveCatalog` (woocommerce.ts) reemplaza `productUrl`,
 * `price`, `grindOptions` y `available` por el estado real de la tienda.
 */

export type GrindId = "grano" | "espresso" | "filtro" | "prensa" | "moka";

export const GRIND_LABELS: Record<GrindId, string> = {
  grano: "En grano",
  espresso: "Espresso",
  filtro: "V60 / filtro",
  prensa: "Prensa francesa",
  moka: "Cafetera italiana",
};

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductFact {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Tostador o proveedor: el café llega en su bolsa original. */
  supplier: string;
  origin: string;
  weightGrams: number;
  /** Precio de venta, en la moneda indicada y sin decimales. */
  price: number;
  currency: "ARS";
  description: string;
  /** Solo notas publicadas en la ficha del proveedor. */
  tastingNotes: string[];
  /** Solo métodos que la ficha recomienda de forma explícita. */
  recommendedMethods: string[];
  /** Solo moliendas confirmadas por WooCommerce para este café. */
  grindOptions: GrindId[];
  images: ProductImage[];
  /** URL pública verificada del producto. `null` si todavía no está publicado. */
  productUrl: string | null;
  /** Stock según WooCommerce. `null`: no confirmado (nunca se asume). */
  available: boolean | null;
  /** Ficha técnica, tal como figura en la ficha del proveedor. */
  facts: ProductFact[];
  /** Palabras que debe contener el nombre en WooCommerce para reconocerlo. */
  wooNameTokens: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "blend-colombia-brasil",
    slug: "blend-colombia-brasil",
    name: "Blend Colombia & Brasil",
    supplier: '',
    origin: "Colombia y Brasil",
    weightGrams: 250,
    price: 22900,
    currency: "ARS",
    description:
      "Cuatro granos, dos de Colombia y dos de Brasil, pensados para una taza equilibrada, con cuerpo y muy buena crema.",
    tastingNotes: ["Castaña", "Chocolate", "Cacao", "Frutos rojos"],
    recommendedMethods: ["Espresso"],
    grindOptions: ["grano", "espresso", "filtro", "prensa", "moka"],
    images: [
      {
        src: "/products/blend-colombia-brasil.webp",
        alt: "Bolsa negra de Coffee, Blend Colombia / Brasil, con etiqueta ilustrada con una planta de café.",
        width: 1686,
        height: 2528,
      },
    ],
    productUrl: "https://tienda.kazecoffee.shop/producto/blend-colombia-brasil/",
    available: null,
    facts: [
      { label: "Origen", value: "Colombia y Brasil" },
      { label: "Altitud", value: "900 a 1.800 msnm" },
      { label: "Variedades", value: "Santos, caturra, típica, colombia y moka" },
      { label: "Proceso", value: "Lavado y secado al sol" },
      { label: "Intensidad", value: "Media / alta" },
      { label: "Acidez", value: "Baja" },
      { label: "Cuerpo", value: "Cremoso" },
    ],
    wooNameTokens: ["blend", "colombia", "brasil"],
  },
  {
    id: "peru-cajamarca",
    slug: "peru-cajamarca",
    name: "Perú Cajamarca",
    supplier: '',
    origin: "Perú, Valle de Cajamarca",
    weightGrams: 250,
    price: 22900,
    currency: "ARS",
    description:
      "Arábica lavado del Valle de Cajamarca, de fincas entre 1.200 y 2.400 msnm. Una taza equilibrada, aromática y con carácter.",
    tastingNotes: ["Afrutado", "Frutos secos"],
    recommendedMethods: [],
    grindOptions: ["grano", "espresso", "filtro", "moka"],
    images: [
      {
        src: "/products/peru-cajamarca.webp",
        alt: "Bolsa negra, Perú, con etiqueta ilustrada con dos mariposas.",
        width: 640,
        height: 960,
      },
    ],
    productUrl: "https://tienda.kazecoffee.shop/producto/peru-cajamarca/",
    available: null,
    facts: [
      { label: "Región", value: "Valle de Cajamarca" },
      { label: "Altitud", value: "1.200 a 2.400 msnm" },
      { label: "Variedades", value: "Caturra, típica, pache y catimor" },
      { label: "Proceso", value: "Lavado" },
      { label: "Puntaje", value: "80 SCA" },
      { label: "Intensidad", value: "Alta" },
      { label: "Acidez", value: "Media" },
      { label: "Cuerpo", value: "Medio" },
    ],
    wooNameTokens: ["peru", "cajamarca"],
  },
  {
    id: "etiopia-tega-tula",
    slug: "etiopia-tega-tula",
    name: "Etiopía Tega & Tula",
    supplier: '',
    origin: "Etiopía, bosques de Kaffa",
    weightGrams: 250,
    price: 26900,
    currency: "ARS",
    description:
      "De la finca Tega & Tula, en los bosques silvestres de Kaffa. Variedad heirloom y proceso natural.",
    tastingNotes: ["Cítricos", "Té negro", "Miel"],
    recommendedMethods: [],
    grindOptions: ["grano", "espresso", "filtro", "prensa", "moka"],
    images: [
      {
        src: "/products/etiopia-tega-tula.webp",
        alt: "Bolsa negra, Etiopía, con etiqueta ilustrada con una jirafa.",
        width: 1792,
        height: 2400,
      },
    ],
    productUrl: "https://tienda.kazecoffee.shop/producto/etiopia-tega-tula/",
    available: null,
    facts: [
      { label: "Región", value: "Shonora, bosques silvestres de Kaffa" },
      { label: "Finca", value: "Tega & Tula" },
      { label: "Variedad", value: "Heirloom" },
      { label: "Proceso", value: "Natural" },
      { label: "Puntaje", value: "81,5 SCA" },
      { label: "Intensidad", value: "Media" },
      { label: "Acidez", value: "Baja" },
      { label: "Dulzor", value: "Medio" },
    ],
    wooNameTokens: ["etiopia", "tega", "tula"],
  },
];

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function formatPrice(value: number): string {
  return ars.format(value);
}

export function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString("es-AR")} kg` : `${grams} g`;
}
