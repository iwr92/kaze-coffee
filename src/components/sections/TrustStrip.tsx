"use client";

import { useRef } from "react";
import { gsap } from "../motion/ease";
import { useReveals } from "../motion/useReveals";

/** Solo beneficios confirmados. Envío, cuotas y descuentos se ven en la tienda. */
const BENEFITS = [
  { text: "Café de especialidad", icon: "M12 3c5 0 8 3.6 8 9s-3 9-8 9-8-3.6-8-9 3-9 8-9Zm3 2.5c-4.5 3-1.500 8.500-6 13" },
  { text: "Bolsas de 250 g", icon: "M6 7 7 3h10l1 4 1 14H5L6 7Zm0 0h12M10 11h4" },
  { text: "Moliendas según disponibilidad", icon: "M3 8c4-3 6 3 10 0s5-2 8-1M3 13c4-3 6 3 10 0s5-2 8-1M3 18c4-3 6 3 10 0s5-2 8-1" },
  { text: "Guía digital incluida", icon: "M6 3h9l4 4v14H6V3Zm9 0v4h4M9 12h7M9 16h7" },
  { text: "Compra segura a través de WooCommerce", icon: "M6 11h12v10H6V11Zm3 0V7a3 3 0 0 1 6 0v4M12 15v2" },
];

/** Franja de beneficios reales: los iconos se dibujan al entrar en pantalla. */
export function TrustStrip() {
  const ref = useRef<HTMLElement>(null);
  useReveals(ref, (root) => {
    gsap.fromTo(
      root.querySelectorAll(".trust-icon path"),
      { drawSVG: "0% 0%" },
      { drawSVG: "0% 100%", duration: 1.1, ease: "kzInOut", stagger: 0.09, scrollTrigger: { trigger: root, start: "top 88%" } },
    );
  });

  return (
    <section ref={ref} className="trust relative z-10" aria-label="Beneficios de comprar en KAZE">
      <ul className="trust-list">
        {BENEFITS.map((benefit) => (
          <li key={benefit.text} className="trust-item" data-reveal="fade">
            <svg className="trust-icon" viewBox="0 0 24 24" aria-hidden>
              <path d={benefit.icon} />
            </svg>
            <span>{benefit.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
