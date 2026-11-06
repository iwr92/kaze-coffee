"use client";

import { useId, useRef, useState } from "react";
import { FAQ } from "@/commerce/faq";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";

/** Preguntas frecuentes: una abierta a la vez, se abren con una transición de altura. */
export function Faq() {
  const ref = useRef<HTMLElement>(null);
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);
  useReveals(ref);

  return (
    <section ref={ref} id="preguntas" aria-labelledby="faq-title" className="faq relative z-10">
      <div className="faq-grid">
        <KineticTitle
          id="faq-title"
          className="faq-title"
          reveal="words"
          lines={[
            { text: "Antes de", voice: "serif" },
            { text: "elegir.", voice: "italic", indent: 0.5 },
          ]}
        />
        <ul className="faq-list">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${uid}-${i}`;
            return (
              <li key={item.question} className="faq-item" data-open={isOpen || undefined} data-reveal="fade">
                <h3 className="faq-q">
                  <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : i)}>
                    <span>{item.question}</span>
                    <span className="faq-sign" aria-hidden />
                  </button>
                </h3>
                <div id={panelId} className="faq-panel" inert={!isOpen}>
                  <div className="faq-panel-inner">
                    <p>{item.answer}</p>
                    {item.link && (
                      <a href={item.link.href} className="link-line" rel="noopener">
                        {item.link.label}
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
