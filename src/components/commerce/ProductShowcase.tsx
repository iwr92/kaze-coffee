"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { availabilityText, productCta } from "@/commerce/cta";
import { formatPrice, formatWeight, GRIND_LABELS, type Product } from "@/commerce/products";
import { SALES_ENABLED } from "@/config/store";
import { gsap } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";
import { Wind } from "../motion/Wind";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Descubrí tu próximo café: el centro comercial de la página.
 *
 * Un café protagonista a la vez sobre un campo crema. Se navega con flechas,
 * la barra de productos, el teclado o deslizando; el precio y la acción de
 * compra siempre quedan a la vista.
 */
export function ProductShowcase({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [factsOpen, setFactsOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const motionRef = useRef(true);
  const lastDir = useRef<1 | -1>(1);
  const factsId = useId();
  const count = products.length;
  const product = products[index];
  const cta = productCta(product);

  // Entrada: el campo crema se abre como un telón con el scroll y el
  // numeral monumental se desliza detrás del producto.
  useReveals(sectionRef, (root) => {
    const field = root.querySelector(".sc-field");
    if (!field) return;
    gsap.fromTo(
      field,
      { clipPath: "inset(10% 7% 0% 7%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        // Sin recorte residual, para que la barra fija móvil no quede cortada.
        clearProps: "clipPath",
        scrollTrigger: { trigger: field, start: "top 95%", end: "top 45%", scrub: 0.6 },
      },
    );
    gsap.fromTo(
      ".sc-numeral",
      { xPercent: -12, opacity: 0 },
      { xPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: field, start: "top 85%", end: "top 25%", scrub: 0.6 } },
    );
  });

  useEffect(() => {
    motionRef.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback(
    (next: number, dir: 1 | -1) => {
      if (busyRef.current || count < 2) return;
      const target = ((next % count) + count) % count;
      if (target === index) return;
      const root = sectionRef.current;
      if (!root) return;
      const layers = root.querySelectorAll<HTMLElement>(".sc-layer");
      const incoming = layers[target];
      const outgoing = layers[index];
      // La visibilidad de las capas la maneja solo GSAP (React no la toca).
      if (!motionRef.current) {
        gsap.set(outgoing, { autoAlpha: 0, zIndex: 0 });
        gsap.set(incoming, { autoAlpha: 1, zIndex: 1, clipPath: "none" });
        setIndex(target);
        return;
      }
      busyRef.current = true;
      lastDir.current = dir;
      const lines = infoRef.current?.querySelectorAll<HTMLElement>(".sc-reveal > *") ?? [];
      const tl = gsap.timeline({ onComplete: () => void (busyRef.current = false) });
      gsap.set(incoming, { zIndex: 2, autoAlpha: 1 });
      gsap.set(outgoing, { zIndex: 1 });
      tl.fromTo(
        incoming,
        { clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "kzInOut" },
        0,
      )
        .fromTo(incoming.querySelector(".sc-media-inner"), { scale: 1.08, xPercent: 5 * dir }, { scale: 1, xPercent: 0, duration: 0.8, ease: "kz" }, 0)
        .to(outgoing.querySelector(".sc-media-inner"), { xPercent: -6 * dir, duration: 0.6, ease: "kzInOut" }, 0)
        .set(outgoing, { autoAlpha: 0, zIndex: 0 })
        .set(outgoing.querySelector(".sc-media-inner"), { xPercent: 0 })
        // Ficha: sale hacia arriba, cambia el contenido y entra desde abajo.
        .to(lines, { yPercent: -110, duration: 0.25, ease: "power2.in", stagger: 0.02 }, 0)
        // El numeral sale en la dirección del cambio y entra el siguiente.
        .to(".sc-numeral-digit", { yPercent: -105 * dir, duration: 0.3, ease: "power2.in" }, 0)
        .add(() => setIndex(target), 0.27);
    },
    [count, index],
  );

  // Entrada de la nueva ficha después de que React la renderiza.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!motionRef.current) return;
    const lines = infoRef.current?.querySelectorAll<HTMLElement>(".sc-reveal > *");
    if (lines?.length) gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "kz", stagger: 0.035 });
    gsap.fromTo(".sc-numeral-digit", { yPercent: 105 * lastDir.current }, { yPercent: 0, duration: 0.6, ease: "kz" });
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1, 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1, -1);
    }
  };
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  };

  return (
    <section ref={sectionRef} id="cafes" aria-labelledby="cafes-title" className="showcase relative z-10">
      <header className="sc-head">
        <KineticTitle
          id="cafes-title"
          className="sc-title"
          reveal="words"
          lines={[
            { text: "Descubrí tu", voice: "serif" },
            { text: "próximo café.", voice: "italic", indent: 0.8 },
          ]}
        />
        <div className="sc-intro" data-reveal="fade">
          <p className="t-body-lg text-ink-muted">Tres formas de encontrar tu momento perfecto.</p>
        </div>
      </header>

      <div className="sc-field">
        <Wind variant="section" className="sc-wind" />
        <div className="sc-numeral" aria-hidden>
          <span className="sc-numeral-mask">
            <span className="sc-numeral-digit">{pad(index + 1)}</span>
          </span>
        </div>
        <div
          className="sc-stage"
          role="group"
          aria-roledescription="carrusel"
          aria-label="Cafés de KAZE"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <figure className="sc-figure">
            <div className="sc-media" data-reveal="mask" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              <div className="sc-layers">
                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className="sc-layer"
                    aria-hidden={i !== index}
                    // Estilo inicial constante: después lo controla GSAP en `go`.
                    style={{ visibility: i === 0 ? "visible" : "hidden", zIndex: i === 0 ? 1 : 0 }}
                  >
                    <div className="sc-media-inner">
                      <Image
                        src={p.images[0].src}
                        alt={p.images[0].alt}
                        fill
                        sizes="(max-width: 1023px) 100vw, 42vw"
                        priority={i === 0}
                        className="sc-photo"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <figcaption className="sc-caption">Imagen ilustrativa del packaging de {product.supplier}.</figcaption>
          </figure>

          <div className="sc-info" ref={infoRef}>
            <div className="sc-index" aria-hidden>
              <span className="sc-index-current">{pad(index + 1)}</span>
              <span className="sc-index-total">/ {pad(count)}</span>
            </div>
            <ProductInfo product={product} />

            <div className="sc-buy">
              {cta.href ? (
                <a href={cta.href} className="btn btn-primary btn-lg sc-buy-cta" rel="noopener">
                  {cta.label}
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-lg sc-buy-cta"
                  aria-expanded={factsOpen}
                  aria-controls={factsId}
                  onClick={() => setFactsOpen((open) => !open)}
                >
                  {factsOpen ? "Ocultar ficha" : cta.label}
                </button>
              )}
              <div className="sc-arrows">
                <button type="button" className="sc-arrow" onClick={() => go(index - 1, -1)} aria-label="Café anterior">
                  <Arrow dir={-1} />
                </button>
                <button type="button" className="sc-arrow" onClick={() => go(index + 1, 1)} aria-label="Café siguiente">
                  <Arrow dir={1} />
                </button>
              </div>
            </div>

            {SALES_ENABLED && (
              <button
                type="button"
                className="link-line sc-facts-toggle"
                aria-expanded={factsOpen}
                aria-controls={factsId}
                onClick={() => setFactsOpen((open) => !open)}
              >
                {factsOpen ? "Ocultar ficha" : "Ver ficha"}
              </button>
            )}
            <div id={factsId} className="sc-facts" data-open={factsOpen || undefined} inert={!factsOpen}>
              <div className="sc-facts-inner">
                <dl className="sc-facts-list">
                  {product.facts.map((fact) => (
                    <div key={fact.label} className="sc-fact">
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="sc-facts-source">Según la ficha de {product.supplier}.</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="sc-rail" aria-label="Todos los cafés">
          <ol>
            {products.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="sc-rail-item"
                  aria-current={i === index ? "true" : undefined}
                  aria-label={`Ver ${p.name}`}
                  onClick={() => go(i, i > index ? 1 : -1)}
                >
                  <span className="sc-rail-thumb" aria-hidden>
                    <Image src={p.images[0].src} alt="" width={96} height={120} sizes="48px" />
                  </span>
                  <span className="sc-rail-text">
                    <span className="sc-rail-index">{pad(i + 1)}</span>
                    <span className="sc-rail-name">{p.name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Móvil: precio y acción siempre a mano mientras se explora el catálogo. */}
        <div className="sc-sticky">
          <div className="sc-sticky-text">
            <span className="sc-sticky-name">{product.name}</span>
            <span className="sc-sticky-price">{formatPrice(product.price)}</span>
          </div>
          {cta.href ? (
            <a href={cta.href} className="btn btn-primary sc-sticky-cta" rel="noopener">
              {cta.label}
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-primary sc-sticky-cta"
              aria-expanded={factsOpen}
              aria-controls={factsId}
              onClick={() => {
                setFactsOpen(true);
                infoRef.current?.scrollIntoView({ block: "start" });
              }}
            >
              {cta.label}
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Café ${index + 1} de ${count}: ${product.name}`}
      </p>
    </section>
  );
}

function ProductInfo({ product }: { product: Product }) {
  const grinds = product.grindOptions.map((grind) => GRIND_LABELS[grind]).join(", ");
  return (
    <div className="sc-fields">
      <div className="sc-reveal">
        <p className="sc-roaster">
          {product.supplier} · {product.origin}
        </p>
      </div>
      <div className="sc-reveal">
        <h3 className="sc-name">{product.name}</h3>
      </div>
      <div className="sc-reveal">
        <p className="sc-profile">{product.description}</p>
      </div>
      <div className="sc-reveal">
        <p className="sc-notes">
          <span className="sc-notes-label">Notas</span> {product.tastingNotes.join(" · ")}
        </p>
      </div>
      <dl className="sc-specs">
        <Spec term="Peso" value={formatWeight(product.weightGrams)} />
        <Spec
          term={SALES_ENABLED ? "Moliendas con stock" : "Moliendas"}
          value={grinds || "Se confirman en la tienda"}
        />
        {product.recommendedMethods.length > 0 && <Spec term="Recomendado para" value={product.recommendedMethods.join(", ")} />}
      </dl>
      <div className="sc-price-row">
        <div>
          <span className="sc-price-label">Precio</span>
          <p className="sc-status">
            <span className="sc-note-dot" aria-hidden />
            {availabilityText(product)}
          </p>
        </div>
        <span className="sc-reveal sc-price">
          <span>{formatPrice(product.price)}</span>
        </span>
      </div>
    </div>
  );
}

function Spec({ term, value }: { term: string; value: string }) {
  return (
    <div className="sc-spec">
      <dt>{term}</dt>
      <dd className="sc-reveal">
        <span>{value}</span>
      </dd>
    </div>
  );
}

function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M3 12h17M14 5.5 20.5 12 14 18.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
