"use client";

import { useRef } from "react";
import { EditorialImage } from "../editorial/EditorialImage";
import { useReveals } from "../motion/useReveals";

/**
 * Valores tomados de la promesa del manual de marca ("granos de origen
 * trazable, tostados en pequeños lotes y enviados frescos") y de su forma de
 * describir el café. Sin certificaciones ni atributos de productos concretos.
 */
const VALUES = [
  { title: "Origen trazable", text: "Cada café indica de dónde viene y quién lo tostó." },
  { title: "Tostado en pequeños lotes", text: "Lotes chicos, para que cada perfil se cuide de cerca." },
  { title: "Enviado fresco", text: "Llega a tu casa con el aroma de un tueste reciente." },
];

/** The Difference — por qué café de especialidad, en tema Negro (alto contraste). */
export function Difference() {
  const ref = useRef<HTMLElement>(null);
  useReveals(ref);

  return (
    <section ref={ref} id="kaze" aria-labelledby="kaze-title" className="difference theme-negro relative z-10">
      <div className="diff-grid">
        <div className="diff-copy">
          <p className="diff-eyebrow t-label">
            Kaze <span lang="ja">風</span> significa viento
          </p>
          <h2 id="kaze-title" className="diff-title kz-wind" data-reveal="lines" aria-label="Lo que cambia en tu taza.">
            <span className="kz-line" aria-hidden>
              <span className="kz-line-air">
                <span className="kz-line-inner">Lo que cambia</span>
              </span>
            </span>
            <span className="kz-line kz-voice" aria-hidden>
              <span className="kz-line-air">
                <span className="kz-line-inner">en tu taza.</span>
              </span>
            </span>
          </h2>
          <p className="diff-lead" data-reveal="fade">
            Seleccionamos cafés de especialidad de distintos tostadores. Los describimos con sensaciones concretas
            (chocolate amargo, mandarina, panela) y no con superlativos.
          </p>
        </div>

        <div className="diff-side">
          <figure className="diff-media" data-reveal="mask">
            <EditorialImage
              id="ruptura-macro"
              alt="Granos de café tostado abriéndose en molienda, en macro."
              sizes="(max-width: 767px) 100vw, 45vw"
              className="h-full w-full object-cover"
            />
          </figure>
          <ul className="diff-values">
            {VALUES.map((v) => (
              <li key={v.title} className="diff-value" data-reveal="fade">
                <h3 className="diff-value-title">{v.title}</h3>
                <p className="diff-value-text">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
