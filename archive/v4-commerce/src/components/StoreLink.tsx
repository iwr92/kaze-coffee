import type { ReactNode } from "react";
import { storeConfig, storeHref, type StoreDestination } from "@/config/store";

interface StoreLinkProps {
  destination?: StoreDestination;
  className?: string;
  children: ReactNode;
}

/**
 * Enlace a la tienda Tiendanube. Si la URL no está configurada, lleva a la
 * sección #tienda en lugar de a una dirección inventada.
 */
export function StoreLink({ destination = "home", className, children }: StoreLinkProps) {
  const href = storeHref(destination);
  if (!href) {
    return (
      <a href={storeConfig.fallbackAnchor} className={className} data-store-pending="">
        {children}
      </a>
    );
  }
  return (
    <a href={href} className={className} rel="noopener">
      {children}
    </a>
  );
}
