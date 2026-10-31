import { storeConfig } from "@/config/store";
import { StoreLink } from "./StoreLink";

/**
 * Pie completo en tema Negro: marca, navegación, estado de la tienda y
 * firma. Solo enlaces que existen; nada de páginas legales o redes
 * inventadas.
 */
export function SiteFooter() {
  const ready = Boolean(storeConfig.url);
  return (
    <footer className="site-footer theme-negro relative z-10">
      <div className="footer-grid">
        <div className="footer-brand">
          {/* Isotipo crema sobre negro, como indica el manual. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logos/svg/kaze-firma-horizontal-crema.svg" alt="Kaze" width={280} height={64} className="footer-logo" />
          <p className="footer-about">
            Tienda online de café de especialidad. Seleccionamos cafés de distintos tostadores para que los
            disfrutes en casa, a tu ritmo.
          </p>
        </div>

        <nav className="footer-col" aria-label="Tienda">
          <h2 className="footer-heading">Tienda</h2>
          <ul>
            <li>
              <a href="#cafes" className="footer-link">
                Cafés
              </a>
            </li>
            <li>
              <a href="#a-tu-manera" className="footer-link">
                En grano o molido
              </a>
            </li>
            <li>
              {ready ? (
                <StoreLink destination="collection" className="footer-link">
                  Ir a la tienda
                </StoreLink>
              ) : (
                <span className="footer-muted">La tienda online abre pronto</span>
              )}
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Kaze">
          <h2 className="footer-heading">Kaze</h2>
          <ul>
            <li>
              <a href="#ritual" className="footer-link">
                El ritual
              </a>
            </li>
            <li>
              <a href="#kaze" className="footer-link">
                Por qué especialidad
              </a>
            </li>
            <li>
              <a href="#top" className="footer-link">
                Volver arriba
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Kaze</p>
        <p>
          <span lang="ja">風</span> Café de especialidad, a tu ritmo.
        </p>
      </div>
    </footer>
  );
}
