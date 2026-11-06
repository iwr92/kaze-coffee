"use client";

import { useRef } from "react";
import { EditorialImage } from "../editorial/EditorialImage";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";

/** Solo lo que KAZE hace de verdad: selecciona y vende cafés de proveedores reales. */
const POINTS = [
  { title: "Una selección para elegir", text: "Cafés de especialidad de un proveedor real, en su bolsa original." },
  { title: "Perfiles para explorar", text: "Tres variedades con orígenes y notas distintas, para encontrar la tuya." },
  { title: "Tu molienda", text: "Elegís cómo lo preparás, según la disponibilidad de cada café." },
  { title: "Una compra simple", text: "Mirás el café acá y terminás la compra en nuestra tienda." },
  { title: "Guía incluida", text: "KAZE Home Barista te acompaña con tu compra." },
];

/** The Difference (#diferencia): por qué elegir KAZE, sin promesas inventadas. */
export function Difference() {
  const ref = useRef<HTMLElement>(null);
  useReveals(ref);
  return (
    <section ref={ref} id="diferencia" aria-labelledby="df-title" className="difference theme-negro relative z-10">
      <div className="df-grid">
        <div className="df-lead">
          <p className="df-eyebrow">
            Kaze <span lang="ja">風</span> significa viento
          </p>
          <KineticTitle
            id="df-title"
            className="df-title"
            reveal="words"
            lines={[
              { text: "Elegir mejor,", voice: "serif" },
              { text: "sin complicarte.", voice: "italic", indent: 0.4 },
            ]}
          />
          <figure className="df-media" data-reveal="wipe">
            <EditorialImage
              id="corriente-taza"
              alt="Café molido cayendo en una corriente hacia una taza de vidrio."
              sizes="(max-width: 1023px) 100vw, 45vw"
              className="h-full w-full object-cover"
            />
          </figure>
        </div>
        <ol className="df-list">
          {POINTS.map((point, i) => (
            <li key={point.title} className="df-item" data-reveal="fade">
              <span className="df-n" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="df-item-title">{point.title}</h3>
                <p className="df-item-text">{point.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
