"use client";

import { useRef } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { storeConfig } from "@/config/store";
import { useReveals } from "../motion/useReveals";
import { StoreLink } from "../StoreLink";

/**
 * Conversión final — KAZE monumental, propuesta de valor y tienda.
 * Es el destino de #tienda: si Tiendanube todavía no está configurada,
 * lo dice con claridad y ofrece seguir explorando.
 */
export function FinalConversion() {
  const ref = useRef<HTMLElement>(null);
  const ready = Boolean(storeConfig.url);
  useReveals(ref);

  return (
    <section ref={ref} id="tienda" aria-labelledby="tienda-title" className="final relative z-10">
      <div className="final-mark" data-reveal="mask">
        {/* Logotipo original del manual, sin deformar, con su área de resguardo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logos/svg/kaze-logotipo-negro.svg" alt="Kaze" width={192} height={48} className="reveal-inner" />
      </div>

      <div className="final-row">
        <h2 id="tienda-title" className="final-title kz-wind" data-reveal="lines" aria-label="Café de especialidad, a tu ritmo.">
          <span className="kz-line" aria-hidden>
            <span className="kz-line-air">
              <span className="kz-line-inner">Café de especialidad,</span>
            </span>
          </span>
          <span className="kz-line kz-voice" aria-hidden>
            <span className="kz-line-air">
              <span className="kz-line-inner">a tu ritmo.</span>
            </span>
          </span>
        </h2>
        <div className="final-actions" data-reveal="fade">
          {ready ? (
            <StoreLink destination="collection" className="btn btn-primary btn-lg">
              Ir a la tienda
            </StoreLink>
          ) : (
            <>
              <a href={COLLECTION_ANCHOR} className="btn btn-primary btn-lg">
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
    </section>
  );
}
