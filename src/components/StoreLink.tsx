import type { ReactNode } from "react";
import { STORE_PAGES } from "@/config/store";

interface StoreLinkProps {
  className?: string;
  children: ReactNode;
}

/** Enlace a la tienda WooCommerce. */
export function StoreLink({ className, children }: StoreLinkProps) {
  return (
    <a href={STORE_PAGES.shop} className={className} rel="noopener">
      {children}
    </a>
  );
}
