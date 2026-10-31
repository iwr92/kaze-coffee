"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

const ITEMS = showcaseItems();
const PENDING = ITEMS.every((item) => item.kind === "pending");

/** Tonos neutros de los espacios pendientes, para que el cambio se perciba. */
const PENDING_TONES = ["var(--color-crema)", "var(--color-ivory)", "#ece4d6"];

function itemName(item: ShowcaseItem): string {
  return item.kind === "product" ? item.product.name : `Producto ${item.slot + 1} pendiente`;
}

/** Destino real de compra: producto en Tiendanube › tienda › #tienda. */
function buyHref(item: ShowcaseItem): string {
  if (item.kind === "product" && item.product.url) return item.product.url;
  return storeHref("collection") ?? storeConfig.fallbackAnchor;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Descubrí tu próximo café — el producto como protagonista.
 *
 * Una imagen grande y la ficha comercial a su lado. Se navega con botones,
 * la lista de productos, las flechas del teclado o deslizando en móvil.
 * Al cambiar, la nueva imagen entra con una máscara en la dirección del
 * viento y los textos se reemplazan desde sus máscaras.
 */
export function ProductShowcase() {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const motionRef = useRef(true);
  const count = ITEMS.length;
  const item = ITEMS[index];

  useEffect(() => {
    motionRef.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback(
    (next: number, dir: 1 | -1) => {
      if (busyRef.current || next === index || count < 2) return;
      const root = sectionRef.current;
      const target = ((next % count) + count) % count;
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
      const lines = infoRef.current?.querySelectorAll<HTMLElement>(".sc-reveal > *") ?? [];

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          busyRef.current = false;
        },
      });
      // Imagen: la nueva entra como una ráfaga, la anterior se aleja.
      gsap.set(incoming, { zIndex: 2, autoAlpha: 1 });
      gsap.set(outgoing, { zIndex: 1 });
      tl.fromTo(
        incoming,
        { clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1 },
        0,
      )
        .fromTo(incoming.querySelector(".sc-media-inner"), { scale: 1.12, xPercent: 6 * dir }, { scale: 1, xPercent: 0, duration: 1.2, ease: "power3.out" }, 0)
        .to(outgoing.querySelector(".sc-media-inner"), { xPercent: -8 * dir, duration: 1 }, 0)
        .set(outgoing, { autoAlpha: 0, zIndex: 0 })
        .set(outgoing.querySelector(".sc-media-inner"), { xPercent: 0 });
      // Textos: salen hacia arriba, se cambia el contenido y entran desde abajo.
      tl.to(lines, { yPercent: -110, duration: 0.35, ease: "power2.in", stagger: 0.03 }, 0).add(() => setIndex(target), 0.38);
    },
    [count, index],
  );

  // Entrada del nuevo contenido después de que React lo renderiza.
  useEffect(() => {
    if (!motionRef.current) return;
    const lines = infoRef.current?.querySelectorAll<HTMLElement>(".sc-reveal > *");
    if (!lines?.length) return;
    gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 });
  }, [index]);

  // Revelado de la sección y parallax sutil de la imagen.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".sc-title .kz-line-inner",
        { yPercent: 112 },
        { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.08, scrollTrigger: { trigger: ".sc-head", start: "top 82%" } },
      );
      gsap.fromTo(
        ".sc-sub, .sc-status",
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.08, scrollTrigger: { trigger: ".sc-head", start: "top 78%" } },
      );
      gsap.fromTo(
        ".sc-media",
        { clipPath: "inset(14% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".sc-media", start: "top 92%", end: "top 45%", scrub: 0.6 } },
      );
      gsap.fromTo(
        ".sc-media .sc-layers",
        { yPercent: -3 },
        { yPercent: 3, ease: "none", scrollTrigger: { trigger: ".sc-media", start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
    return () => mm.revert();
  }, []);

  // Teclado y deslizamiento táctil sobre el escenario.
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
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  };

  return (
    <section ref={sectionRef} id="cafes" aria-labelledby="cafes-title" className="showcase relative z-10 bg-pearl">
      <header className="sc-head">
        <div className="sc-head-title">
          <p className="t-label text-ink-muted">La colección</p>
          <h2 id="cafes-title" className="sc-title kz-wind mt-4 text-ink" aria-label="Descubrí tu próximo café.">
            <span className="kz-line" aria-hidden>
              <span className="kz-line-air">
                <span className="kz-line-inner">Descubrí tu</span>
              </span>
            </span>
            <span className="kz-line" aria-hidden style={{ "--kz-indent": "0.6em" } as React.CSSProperties}>
              <span className="kz-line-air">
                <span className="kz-line-inner">próximo café.</span>
              </span>
            </span>
          </h2>
        </div>
        <div className="sc-head-side">
          <p className="sc-sub t-body-lg text-ink-muted">Encontrá el café que va con tu forma de disfrutarlo.</p>
          {PENDING && (
            <p className="sc-status t-caption" role="note">
              <span className="sc-tag">Vista de diseño</span>
              Los productos se publican con sus fotos, nombres y precios reales cuando estén confirmados.
            </p>
          )}
        </div>
      </header>

      <div
        className="sc-stage"
        role="group"
        aria-roledescription="carrusel"
        aria-label="Cafés destacados"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="sc-media" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
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
          <p className="sc-counter t-caption text-ink-muted" aria-hidden>
            <span className="text-ink">{pad(index + 1)}</span> / {pad(count)}
          </p>
          <ProductInfo item={item} />
          <div className="sc-actions">
            <a href={buyHref(item)} className="btn btn-primary" rel={item.kind === "product" && item.product.url ? "noopener" : undefined}>
              Comprar en la tienda
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
                  onClick={() => go(i, i > index ? 1 : -1)}
                >
                  <span className="sc-rail-index">{pad(i + 1)}</span>
                  <span className="sc-rail-name">{itemName(it)}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <p className="sr-only" aria-live="polite">
        {`Café ${index + 1} de ${count}: ${itemName(item)}`}
      </p>
    </section>
  );
}

function ProductInfo({ item }: { item: ShowcaseItem }) {
  if (item.kind === "pending") {
    return (
      <div className="sc-fields sc-fields-pending">
        <div className="sc-reveal">
          <p className="t-label">
            <span className="sc-tag">Pendiente de carga</span>
          </p>
        </div>
        <div className="sc-reveal">
          <p className="t-label text-ink-muted">Marca del tostador</p>
        </div>
        <div className="sc-reveal">
          <h3 className="sc-name">Nombre del café</h3>
        </div>
        <div className="sc-reveal">
          <p className="sc-profile">Variedad o perfil de taza</p>
        </div>
        <dl className="sc-specs">
          <Spec term="Peso" value="—" />
          <Spec term="Molienda" value="—" />
          <Spec term="Precio" value="—" price />
        </dl>
      </div>
    );
  }
  const p = item.product;
  return (
    <div className="sc-fields">
      <div className="sc-reveal">
        <p className="t-label text-ink-muted">{p.roaster}</p>
      </div>
      <div className="sc-reveal">
        <h3 className="sc-name">{p.name}</h3>
      </div>
      <div className="sc-reveal">
        <p className="sc-profile">{p.profile}</p>
      </div>
      <dl className="sc-specs">
        <Spec term="Peso" value={formatWeight(p.weightGrams)} />
        <Spec term="Molienda" value={p.grinds.map((g) => GRIND_LABELS[g]).join(", ")} />
        <Spec term="Precio" value={formatPrice(p.priceARS)} price />
      </dl>
    </div>
  );
}

function Spec({ term, value, price = false }: { term: string; value: string; price?: boolean }) {
  return (
    <div className="sc-spec">
      <dt className="t-label text-ink-muted">{term}</dt>
      <dd className={`sc-reveal ${price ? "sc-price" : ""}`}>
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
    <div className="sc-pending-photo" style={{ background: PENDING_TONES[slot % PENDING_TONES.length] }}>
      <div className="sc-pending-frame">
        <p className="t-label text-ink-muted">Fotografía del producto</p>
        <p className="t-caption mt-2 text-ink-muted">Pendiente · foto real del proveedor · 4:5</p>
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M3 11h15M12.5 5.5 18 11l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
