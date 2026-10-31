import { StoreLink } from "./StoreLink";

/**
 * Encabezado con la firma horizontal original (tinta negra sobre perla, como
 * pide el manual) y navegación mínima hacia la oferta.
 */
export function BrandHeader() {
  return (
    <header className="brand-header fixed inset-x-0 top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 md:px-12 md:py-6">
        <a href="#top" aria-label="Kaze, inicio" className="block py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logos/svg/kaze-firma-horizontal-negro.svg"
            alt="Kaze"
            width={280}
            height={64}
            className="h-7 w-auto md:h-10"
          />
        </a>
        <nav aria-label="Principal" className="flex items-center gap-5 md:gap-9">
          <a href="#cafes" className="nav-link t-label">
            Cafés
          </a>
          {/* .nav-link fija su display; el contenedor decide si se muestra. */}
          <span className="hidden md:block">
            <a href="#a-tu-manera" className="nav-link t-label">
              A tu manera
            </a>
          </span>
          <StoreLink className="btn btn-ghost btn-sm">Tienda</StoreLink>
        </nav>
      </div>
    </header>
  );
}
