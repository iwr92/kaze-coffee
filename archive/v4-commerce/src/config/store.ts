/**
 * Configuración central de la tienda (Tiendanube).
 *
 * La URL no está en el código: se define en el entorno.
 *   NEXT_PUBLIC_TIENDANUBE_STORE_URL=https://tu-tienda.mitiendanube.com
 *   NEXT_PUBLIC_TIENDANUBE_COLLECTION_PATH=/productos/   (opcional)
 *
 * Mientras no esté definida, los CTAs llevan a la sección #tienda, que
 * explica que la tienda abre pronto. Nunca se inventa una URL.
 */

function normalizeUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

export const storeConfig = {
  url: normalizeUrl(process.env.NEXT_PUBLIC_TIENDANUBE_STORE_URL),
  collectionPath: process.env.NEXT_PUBLIC_TIENDANUBE_COLLECTION_PATH?.trim() || "",
  /** Ancla de respaldo cuando la tienda todavía no está conectada. */
  fallbackAnchor: "#tienda",
} as const;

export type StoreDestination = "home" | "collection";

/** Devuelve la URL de destino, o null si la tienda no está configurada. */
export function storeHref(destination: StoreDestination = "home"): string | null {
  if (!storeConfig.url) return null;
  if (destination === "collection" && storeConfig.collectionPath) {
    const path = storeConfig.collectionPath.startsWith("/")
      ? storeConfig.collectionPath
      : `/${storeConfig.collectionPath}`;
    return `${storeConfig.url}${path}`;
  }
  return storeConfig.url;
}
