import type { ReactNode } from "react";
import { SALES_ENABLED, STORE_PAGES, STORE_STATUS_ANCHOR } from "@/config/store";

interface StoreLinkProps {
  className?: string;
  children: ReactNode;
}

/**
 * Enlace a la tienda WooCommerce. Con ventas apagadas lleva al estado de
 * apertura dentro de la landing.
 */
export function StoreLink({ className, children }: StoreLinkProps) {
  return SALES_ENABLED ? (
    <a href={STORE_PAGES.shop} className={className} rel="noopener">
      {children}
    </a>
  ) : (
    <a href={STORE_STATUS_ANCHOR} className={className}>
      {children}
    </a>
  );
}
