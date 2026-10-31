import { storeConfig } from "@/config/store";
import { StoreLink } from "./StoreLink";

/**
 * Pie con el estado de la tienda y el logotipo original a escala monumental
 * (SVG del manual, sin deformar, con su área de resguardo).
 *
 * Es también el destino de #tienda: mientras Tiendanube no esté configurada,
 * los botones de compra llevan acá y el pie lo dice con claridad.
 */
export function SiteFooter() {
  const ready = Boolean(storeConfig.url);
  return (
    <footer id="tienda" className="site-footer relative z-10 bg-pearl" aria-labelledby="tienda-title">
      <div className="site-footer-store">
        <h2 id="tienda-title" className="site-footer-title text-ink">
          Café de especialidad, a tu ritmo.
        </h2>
        <div className="site-footer-store-cta">
          {ready ? (
            <StoreLink destination="collection" className="btn btn-primary">
              Ir a la tienda
            </StoreLink>
          ) : (
            <p className="t-body text-ink-muted">
              <span className="sc-tag">Tienda</span>
              La tienda online abre pronto.
            </p>
          )}
        </div>
      </div>

      <div className="site-footer-row">
        <nav aria-label="Pie" className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <a href="#cafes" className="nav-link t-label">
            Cafés
          </a>
          <a href="#a-tu-manera" className="nav-link t-label">
            A tu manera
          </a>
          <a href="#top" className="nav-link t-label">
            Volver arriba
          </a>
        </nav>
        <p className="t-caption text-ink-muted">
          <span lang="ja">風</span> Kaze significa viento.
        </p>
      </div>

      <div className="site-footer-mark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logos/svg/kaze-logotipo-negro.svg"
          alt="Kaze"
          width={192}
          height={48}
          className="block h-auto w-full"
        />
      </div>
    </footer>
  );
}
