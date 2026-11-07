import { STORE_URL } from "@/config/store";
import { PRODUCTS, type GrindId, type Product } from "./products";

/**
 * Lectura del estado real de WooCommerce.
 *
 * Usa la API pública de la tienda, de solo lectura. No hay carrito, checkout
 * ni inventario en Next.js: las URL, el precio, las moliendas y el stock salen
 * de la tienda.
 */

const API = `${STORE_URL}/wp-json/wc/store/v1`;
const REVALIDATE_SECONDS = 300;

const WOO_GRINDS: Record<string, GrindId> = {
  "grano-entero": "grano",
  espresso: "espresso",
  filtro: "filtro",
  "prensa-francesa": "prensa",
  moka: "moka",
};

interface WooVariationRef {
  id: number;
  attributes: { name: string; value: string }[];
}

interface WooProduct {
  id: number;
  name: string;
  permalink: string;
  prices: { price: string; currency_code: string };
  is_purchasable: boolean;
  is_in_stock: boolean;
  variations: WooVariationRef[];
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`WooCommerce respondió ${res.status} en ${path}`);
  return res.json() as Promise<T>;
}

/** Sin acentos, entidades ni signos, para comparar nombres. */
function normalizeName(value: string): string {
  return value
    .replace(/&[a-z#0-9]+;/gi, " ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function matchWooProduct(product: Product, list: WooProduct[]): WooProduct | undefined {
  return list.find((woo) => {
    const name = normalizeName(woo.name);
    return product.wooNameTokens.every((token) => name.includes(token));
  });
}

/** Moliendas con stock real: consulta cada variante del producto. */
async function grindsInStock(woo: WooProduct): Promise<GrindId[]> {
  const results = await Promise.all(
    woo.variations.map(async (variation) => {
      const grind = WOO_GRINDS[variation.attributes[0]?.value ?? ""];
      if (!grind) return null;
      const state = await getJson<WooProduct>(`/products/${variation.id}`);
      return state.is_purchasable && state.is_in_stock ? grind : null;
    }),
  );
  return results.filter((grind): grind is GrindId => grind !== null);
}

function isStoreUrl(value: string): boolean {
  return value.startsWith(`${STORE_URL}/`);
}

async function withWooState(product: Product, list: WooProduct[]): Promise<Product> {
  const woo = matchWooProduct(product, list);
  // Sin publicar en la tienda: sin enlace propio, sin moliendas y sin stock.
  if (!woo) return { ...product, productUrl: null, grindOptions: [], available: false };

  const price = Number(woo.prices.price);
  return {
    ...product,
    productUrl: isStoreUrl(woo.permalink) ? woo.permalink : null,
    price: woo.prices.currency_code === "ARS" && price > 0 ? price : product.price,
    grindOptions: await grindsInStock(woo).catch(() => []),
    available: woo.is_purchasable && woo.is_in_stock,
  };
}

/**
 * Catálogo para la landing. Si la tienda no responde se conservan los datos
 * verificados y `available` queda en `null`: no se afirma nada sobre el stock.
 */
export async function resolveCatalog(): Promise<Product[]> {
  try {
    const list = await getJson<WooProduct[]>("/products?per_page=100");
    return await Promise.all(PRODUCTS.map((product) => withWooState(product, list)));
  } catch (error) {
    console.error("No se pudo leer el estado de WooCommerce:", error);
    return PRODUCTS;
  }
}
