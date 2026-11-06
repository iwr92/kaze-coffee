import { SALES_ENABLED, STORE_PAGES } from "@/config/store";

const SECTIONS = [
  { href: "#cafes", label: "Cafés" },
  { href: "#a-tu-manera", label: "A tu manera" },
  { href: "#guia", label: "Guía Home Barista" },
  { href: "#ritual", label: "El ritual" },
  { href: "#diferencia", label: "Por qué KAZE" },
  { href: "#preguntas", label: "Preguntas frecuentes" },
];

const STORE_LINKS = [
  { href: STORE_PAGES.shop, label: "Ir a la tienda" },
  { href: STORE_PAGES.shipping, label: "Política de envíos" },
  { href: STORE_PAGES.returns, label: "Cambios y devoluciones" },
  { href: STORE_PAGES.terms, label: "Términos y condiciones" },
  { href: STORE_PAGES.privacy, label: "Política de privacidad" },
  { href: STORE_PAGES.withdrawal, label: "Botón de arrepentimiento" },
];

/** Pie en tema Negro. Las páginas de la tienda se enlazan cuando abre. */
export function SiteFooter() {
  return (
    <footer className="site-footer theme-negro relative z-10">
      <div className="footer-grid">
        <div className="footer-brand">
          {/* Isotipo crema sobre negro, como indica el manual. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logos/svg/kaze-firma-horizontal-crema.svg" alt="Kaze" width={280} height={64} className="footer-logo" />
          <p className="footer-about">
            Tienda online argentina de café de especialidad. Seleccionamos cafés de proveedores reales para que los
            disfrutes en casa, a tu ritmo.
          </p>
        </div>

        <nav className="footer-col" aria-label="Secciones">
          <h2 className="footer-heading">KAZE</h2>
          <ul>
            {SECTIONS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="footer-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Tienda">
          <h2 className="footer-heading">Tienda</h2>
          {SALES_ENABLED ? (
            <ul>
              {STORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer-link" rel="noopener">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="footer-muted">La tienda abre pronto.</p>
          )}
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
