"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatPrice,
  formatWeight,
  GRIND_LABELS,
  showcaseItems,
  type Product,
  type ShowcaseItem,
} from "@/commerce/products";
import { storeConfig, storeHref } from "@/config/store";
import { gsap } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";
import { Wind } from "../motion/Wind";

const ITEMS = showcaseItems();
const PENDING = ITEMS.every((item) => item.kind === "pending");

/** Tonos neutros de los espacios de diseño, para que el cambio se perciba. */
const PENDING_TONES = ["#efe6d6", "#e8e5df", "#e9dfcd"];

function itemName(item: ShowcaseItem): string {
  return item.kind === "product" ? item.product.name : "Próximamente";
}

/** Destino real: producto en Tiendanube › tienda › #tienda. Nunca inventado. */
function buyHref(item: ShowcaseItem): string {
  if (item.kind === "product" && item.product.url) return item.product.url;
  return storeHref("collection") ?? storeConfig.fallbackAnchor;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Descubrí tu próximo café — el centro comercial de la página.
 *
 * Un producto protagonista a la vez sobre un campo crema: imagen dominante y
 * ficha con jerarquía clara. Se navega con flechas, la barra de productos,
 * el teclado o deslizando. Al cambiar, la imagen entra con una máscara y la
 * ficha se reemplaza desde sus máscaras.
 */
export function ProductShowcase() {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const motionRef = useRef(true);
  const lastDir = useRef<1 | -1>(1);
  const count = ITEMS.length;
  const item = ITEMS[index];

  // Entrada: el campo crema se abre como un telón con el scroll y el
  // numeral monumental se desliza detrás del producto.
  useReveals(sectionRef, (root) => {
    const field = root.querySelector(".sc-field");
    if (!field) return;
    gsap.fromTo(
      field,
      { clipPath: "inset(18% 7% 0% 7%)" },
      { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: field, start: "top 95%", end: "top 30%", scrub: 0.6 } },
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
          <p className="t-body-lg text-ink-muted">
            Encontrá el café que va con tu forma de disfrutarlo. Cada uno llega con la marca y el empaque de su
            tostador.
          </p>
          {PENDING && (
            <p className="sc-note">
              <span className="sc-note-dot" aria-hidden />
              Estamos preparando la primera selección.
            </p>
          )}
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
          aria-label="Cafés destacados"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="sc-media" data-reveal="mask" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            <div className="sc-layers">
              {ITEMS.map((it, i) => (
                <div
                  key={it.kind === "product" ? it.product.id : `pending-${it.slot}`}
                  className="sc-layer"
                  aria-hidden={i !== index}
                  // Estilo inicial constante: después lo controla GSAP en `go`.
                  style={{ visibility: i === 0 ? "visible" : "hidden", zIndex: i === 0 ? 1 : 0 }}
                >
                  <div className="sc-media-inner">
                    {it.kind === "product" ? <ProductPhoto product={it.product} priority={i === 0} /> : <PendingPhoto slot={it.slot} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sc-info" ref={infoRef}>
            <div className="sc-index" aria-hidden>
              <span className="sc-index-current">{pad(index + 1)}</span>
              <span className="sc-index-total">/ {pad(count)}</span>
            </div>
            <ProductInfo item={item} />
            <div className="sc-buy">
              <a href={buyHref(item)} className="btn btn-primary btn-lg sc-buy-cta" rel={item.kind === "product" && item.product.url ? "noopener" : undefined}>
                {item.kind === "product" ? "Comprar en la tienda" : "Ver la tienda"}
              </a>
              {count > 1 && (
                <div className="sc-arrows">
                  <button type="button" className="sc-arrow" onClick={() => go(index - 1, -1)} aria-label="Café anterior">
                    <Arrow dir={-1} />
                  </button>
                  <button type="button" className="sc-arrow" onClick={() => go(index + 1, 1)} aria-label="Café siguiente">
                    <Arrow dir={1} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {count > 1 && (
          <nav className="sc-rail" aria-label="Todos los cafés destacados">
            <ol>
              {ITEMS.map((it, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="sc-rail-item"
                    aria-current={i === index ? "true" : undefined}
                    aria-label={`Ver café ${i + 1}: ${itemName(it)}`}
                    onClick={() => go(i, i > index ? 1 : -1)}
                  >
                    <span className="sc-rail-thumb" aria-hidden>
                      {it.kind === "product" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.product.image.src} alt="" width={64} height={80} loading="lazy" />
                      ) : (
                        <span style={{ background: PENDING_TONES[it.slot % PENDING_TONES.length] }} />
                      )}
                    </span>
                    <span className="sc-rail-text">
                      <span className="sc-rail-index">{pad(i + 1)}</span>
                      <span className="sc-rail-name">{itemName(it)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {`Café ${index + 1} de ${count}: ${itemName(item)}`}
      </p>
    </section>
  );
}

function ProductInfo({ item }: { item: ShowcaseItem }) {
  const p = item.kind === "product" ? item.product : null;
  const roaster = p ? p.roaster : "Tostador a confirmar";
  const name = p ? p.name : "Próximamente";
  const profile = p ? p.profile : "Origen, proceso y notas de cata, tal como los publica cada tostador.";
  return (
    <div className={`sc-fields ${p ? "" : "is-pending"}`}>
      <div className="sc-reveal">
        <p className="sc-roaster">{roaster}</p>
      </div>
      <div className="sc-reveal">
        <h3 className="sc-name">{name}</h3>
      </div>
      <div className="sc-reveal">
        <p className="sc-profile">{profile}</p>
      </div>
      <dl className="sc-specs">
        <Spec term="Peso" value={p ? formatWeight(p.weightGrams) : "—"} />
        <Spec term="Formato" value={p ? p.grinds.map((g) => GRIND_LABELS[g]).join(", ") : "—"} />
      </dl>
      <div className="sc-price-row">
        <span className="sc-price-label">Precio</span>
        <span className="sc-reveal sc-price">
          <span>{p ? formatPrice(p.priceARS) : "—"}</span>
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

function ProductPhoto({ product, priority }: { product: Product; priority: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image.src}
      alt={product.image.alt}
      width={product.image.width}
      height={product.image.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full object-cover"
    />
  );
}

function PendingPhoto({ slot }: { slot: number }) {
  return (
    <div className="sc-pending-photo" style={{ backgroundColor: PENDING_TONES[slot % PENDING_TONES.length] }}>
      {/* Contorno neutro de una bolsa genérica: marca el lugar y la proporción
          de la foto real del proveedor, sin marca ni etiqueta inventada. */}
      <svg className="sc-pending-bag" viewBox="0 0 200 280" aria-hidden>
        <path d="M44 34 L156 34 L170 262 Q170 270 162 270 L38 270 Q30 270 30 262 Z" />
        <path d="M44 34 L52 14 L148 14 L156 34" />
        <path d="M58 62 L142 62" />
        <circle cx="100" cy="92" r="7" />
      </svg>
      <span className="sc-pending-caption">Foto del producto, tal como la publica su tostador</span>
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
