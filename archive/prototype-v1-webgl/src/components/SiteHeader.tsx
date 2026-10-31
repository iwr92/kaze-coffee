/**
 * Encabezado fijo con la firma horizontal original (SVG del manual).
 * El tono se controla con `data-tone` en <html>: "negro" (fondo oscuro,
 * firma crema) o "crema" (fondo crema, firma negra). Lo actualiza la
 * coreografía de scroll; acá solo hay CSS.
 */
export function SiteHeader() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-30">
      <div className="flex items-center justify-between px-4 py-4 md:px-12 md:py-6">
        <a href="#top" className="relative block h-8 w-[140px] md:h-10 md:w-[175px]" aria-label="Kaze, inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/svg/kaze-firma-horizontal-crema.svg"
            alt=""
            width={280}
            height={64}
            className="logo-crema absolute inset-0 h-full w-auto"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/svg/kaze-firma-horizontal-negro.svg"
            alt=""
            width={280}
            height={64}
            className="logo-negro absolute inset-0 h-full w-auto"
          />
        </a>
        <nav aria-label="Principal">
          <a href="#cafes" className="header-link t-label inline-flex min-h-11 items-center px-1">
            Cafés
          </a>
        </nav>
      </div>
    </header>
  );
}
