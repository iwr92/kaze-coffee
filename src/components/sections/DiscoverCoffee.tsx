"use client";

import { useEffect, useRef, useState } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { formatPrice, PRODUCTS, type TasteFamily } from "@/commerce/products";
import { EditorialImage } from "../editorial/EditorialImage";
import { gsap } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";

interface Family {
  id: TasteFamily;
  name: string;
  /** Vocabulario general de cata, no notas de un producto en particular. */
  notes: string;
  /** Encuadre de la fotografía para esta familia: [x %, y %, escala]. */
  focus: [number, number, number];
}

const FAMILIES: Family[] = [
  // Encuadres suaves (la escala cubre el desplazamiento: nunca se ve el borde).
  { id: "frutal", name: "Frutal", notes: "Cítricos, frutos rojos y fruta de carozo. Taza viva y jugosa.", focus: [-3, -2, 1.08] },
  { id: "achocolatado", name: "Achocolatado", notes: "Cacao, nuez y caramelo. Cuerpo redondo y amable.", focus: [2, 2, 1.06] },
  { id: "floral", name: "Floral", notes: "Jazmín, bergamota y té. Taza ligera y perfumada.", focus: [-4, -3, 1.12] },
  { id: "dulce", name: "Dulce", notes: "Panela, miel y azúcar mascabo. Dulzor largo y suave.", focus: [3, 3, 1.1] },
];

/**
 * Descubrí tu café — elegir por sabor, sin cuestionarios.
 * Se elige una familia de sabor y aparecen los cafés del catálogo real que
 * la declaran. Sin productos publicados, lo dice y ofrece ver la colección.
 */
export function DiscoverCoffee() {
  const ref = useRef<HTMLElement>(null);
  const [familyId, setFamilyId] = useState<TasteFamily>("frutal");
  const family = FAMILIES.find((f) => f.id === familyId)!;
  const matches = PRODUCTS.filter((p) => p.tasteFamilies?.includes(familyId));

  useReveals(ref);

  // Al cambiar de familia la cámara se mueve sobre la fotografía y las notas
  // se reemplazan desde su máscara.
  const first = useRef(true);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [x, y, scale] = family.focus;
    const img = root.querySelector(".dc-media-inner");
    if (first.current || reduce) {
      gsap.set(img, { xPercent: x, yPercent: y, scale });
      first.current = false;
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: "kzInOut" } });
    tl.to(img, { xPercent: x, yPercent: y, scale, duration: 0.9 }, 0).fromTo(
      root.querySelectorAll(".dc-swap"),
      { yPercent: 110 },
      { yPercent: 0, duration: 0.55, ease: "kz", stagger: 0.05 },
      0.1,
    );
    return () => {
      tl.kill();
    };
  }, [family]);

  return (
    <section ref={ref} id="descubri" aria-labelledby="dc-title" className="discover relative z-10">
      <div className="dc-grid">
        <div className="dc-copy">
          <KineticTitle
            id="dc-title"
            className="dc-title"
            reveal="words"
            lines={[
              { text: "Descubrí", voice: "serif" },
              { text: "tu café.", voice: "italic", indent: 0.5 },
            ]}
          />
          <p className="dc-intro" data-reveal="fade">
            Empezá por lo que te gusta sentir en la taza. Te mostramos los cafés que lo tienen.
          </p>

          <div className="dc-families" role="radiogroup" aria-label="Familias de sabor" data-reveal="fade">
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={f.id === familyId}
                className="dc-family"
                onClick={() => setFamilyId(f.id)}
              >
                <span className="dc-family-name">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dc-stage">
          <figure className="dc-media" data-reveal="wipe">
            <div className="dc-media-inner">
              <EditorialImage
                id="corriente-taza"
                alt="Café molido cayendo en una corriente hacia una taza de vidrio."
                sizes="(max-width: 1023px) 100vw, 55vw"
                className="h-full w-full object-cover"
              />
            </div>
          </figure>

          <div className="dc-result" aria-live="polite">
            <div className="dc-mask">
              <p className="dc-swap dc-result-name">{family.name}</p>
            </div>
            <div className="dc-mask">
              <p className="dc-swap dc-result-notes">{family.notes}</p>
            </div>

            {matches.length > 0 ? (
              <ul className="dc-matches">
                {matches.map((p) => (
                  <li key={p.id}>
                    <a href={p.url ?? COLLECTION_ANCHOR} className="dc-match">
                      <span className="dc-match-roaster">{p.roaster}</span>
                      <span className="dc-match-name">{p.name}</span>
                      <span className="dc-match-price">{formatPrice(p.priceARS)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dc-empty">
                <p>
                  <span className="sc-note-dot" aria-hidden />
                  Todavía no hay cafés publicados con este perfil.
                </p>
                <a href={COLLECTION_ANCHOR} className="link-line">
                  Ver la colección
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
