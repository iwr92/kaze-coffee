import { catalog } from "@/commerce/catalog";

/**
 * Catálogo — Fase 03.
 * Hoy el proveedor no está conectado y devuelve una lista vacía: se muestra
 * un estado vacío claro, sin productos ni precios inventados.
 */
export async function CatalogSection() {
  const products = await catalog.listProducts({ kind: "cafe" });

  return (
    <section
      id="cafes"
      aria-labelledby="cafes-title"
      className="relative z-10 scroll-mt-20 bg-crema px-4 pb-24 pt-24 text-negro md:px-12 md:pb-32 md:pt-32"
    >
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 id="cafes-title" className="t-display">
            Nuestros cafés
          </h2>
          <p className="t-body-lg mt-5 max-w-[38ch] text-ink-muted">
            Cafés de especialidad de distintos tostadores, cada uno con su origen, su proceso y
            su fecha de tueste.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-crema-oscuro p-6 md:col-span-6 md:col-start-7 md:p-12">
            <p className="t-titulo">Estamos armando el catálogo.</p>
            <p className="t-body mt-4 max-w-[46ch] text-ink-muted">
              Muy pronto vas a poder elegir tus cafés acá, en grano o molidos para tu método.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
