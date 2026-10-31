"use client";

import { useRef } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { storeConfig } from "@/config/store";
import { gsap } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";
import { Wind } from "../motion/Wind";
import { StoreLink } from "../StoreLink";

/** Promesa del manual de marca: sin certificaciones ni atributos inventados. */
const VALUES = [
  { title: "Origen trazable", text: "Cada café indica de dónde viene y quién lo tostó." },
  { title: "Pequeños lotes", text: "Tostado en lotes chicos, para cuidar cada perfil." },
  { title: "Enviado fresco", text: "Llega a tu casa con el aroma de un tueste reciente." },
];

/**
 * The Final Statement (#kaze, #tienda) — el cierre de marca y la compra.
 * Transición: una ola perla con borde de viento se retira con el scroll y
 * descubre el negro; las ráfagas crema se dibujan y el logotipo oficial se
 * revela de izquierda a derecha.
 */
export function FinalConversion() {
  const ref = useRef<HTMLElement>(null);
  const ready = Boolean(storeConfig.url);

  useReveals(ref, (root) => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // La ola se ve entera al entrar y se retira mientras el cierre sube.
      scrollTrigger: { trigger: root, start: "top bottom", end: "top 20%", scrub: 0.6 },
    });
    tl.fromTo(".final-wave", { scaleY: 1 }, { scaleY: 0, transformOrigin: "50% 0%" }, 0).fromTo(
      ".final-mark",
      { clipPath: "inset(0% 100% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)" },
      0.35,
    );
  });

  return (
    <section ref={ref} id="kaze" aria-labelledby="kaze-title" className="final theme-negro relative z-10">
      <span id="tienda" className="final-anchor" aria-hidden />
      <svg className="final-wave" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0 H1440 V120 C 1180 210, 900 60, 640 150 S 220 210, 0 130 Z" />
      </svg>
      <Wind variant="closing" tone="crema" className="final-wind" />

      <div className="final-inner">
        <p className="final-eyebrow">
          Kaze <span lang="ja">風</span> significa viento
        </p>
        <div className="final-mark">
          {/* Logotipo original del manual (versión crema sobre negro), sin deformar. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logos/svg/kaze-logotipo-crema.svg" alt="Kaze" width={192} height={48} />
        </div>

        <div className="final-row">
          <KineticTitle
            id="kaze-title"
            className="final-title"
            reveal="words"
            lines={[
              { text: "Café de especialidad,", voice: "serif" },
              { text: "a tu ritmo.", voice: "italic", indent: 0.5 },
            ]}
          />
          <div className="final-actions" data-reveal="fade">
            {ready ? (
              <StoreLink destination="collection" className="btn btn-light btn-lg">
                Ir a la tienda
              </StoreLink>
            ) : (
              <>
                <a href={COLLECTION_ANCHOR} className="btn btn-light btn-lg">
                  Explorar cafés
                </a>
                <p className="final-status">
                  <span className="sc-note-dot" aria-hidden />
                  La tienda online abre pronto.
                </p>
              </>
            )}
          </div>
        </div>

        <ul className="final-values">
          {VALUES.map((v) => (
            <li key={v.title} className="final-value" data-reveal="fade">
              <h3 className="final-value-title">{v.title}</h3>
              <p className="final-value-text">{v.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
