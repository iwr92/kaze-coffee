"use client";

import Image from "next/image";
import { useRef } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { gsap } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";
import { useReveals } from "../motion/useReveals";
import { Wind } from "../motion/Wind";

/** Contenido real del PDF (12 páginas, A5). */
const CONTENTS = ["Molienda", "Proporciones", "Métodos de preparación", "Consejos"];

const PAGE_WIDTH = 560;
const PAGE_HEIGHT = 793;

/**
 * KAZE Home Barista: el único regalo confirmado. La portada y dos páginas son
 * imágenes del documento real; el PDF no se publica en la landing: se entrega
 * a quienes compran, desde WooCommerce.
 */
export function HomeBarista() {
  const ref = useRef<HTMLElement>(null);

  useReveals(ref, (root) => {
    const mock = root.querySelector(".hb-mock");
    if (!mock) return;
    // Las páginas se abren en abanico detrás de la portada, atadas al scroll.
    const st = { trigger: mock, start: "top 80%", end: "center 50%", scrub: 0.7 };
    gsap.fromTo(".hb-page-a", { rotate: 0, xPercent: 0 }, { rotate: -7, xPercent: -21, ease: "none", scrollTrigger: st });
    gsap.fromTo(".hb-page-b", { rotate: 0, xPercent: 0 }, { rotate: 6, xPercent: 23, ease: "none", scrollTrigger: st });
    gsap.fromTo(
      ".hb-cover",
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "kzInOut", scrollTrigger: { trigger: mock, start: "top 82%" } },
    );
    if (window.matchMedia("(pointer: fine)").matches) {
      const cover = mock.querySelector<HTMLElement>(".hb-cover")!;
      const rotateY = gsap.quickTo(cover, "rotateY", { duration: 0.7, ease: "kz" });
      const rotateX = gsap.quickTo(cover, "rotateX", { duration: 0.7, ease: "kz" });
      const onMove = (e: Event) => {
        const { clientX, clientY } = e as PointerEvent;
        const r = mock.getBoundingClientRect();
        rotateY((((clientX - r.left) / r.width) * 2 - 1) * 5);
        rotateX((((clientY - r.top) / r.height) * 2 - 1) * -4);
      };
      const onLeave = () => {
        rotateY(0);
        rotateX(0);
      };
      mock.addEventListener("pointermove", onMove);
      mock.addEventListener("pointerleave", onLeave);
      return () => {
        mock.removeEventListener("pointermove", onMove);
        mock.removeEventListener("pointerleave", onLeave);
      };
    }
  });

  return (
    <section ref={ref} id="guia" aria-labelledby="hb-title" className="barista relative z-10">
      <Wind variant="section" className="hb-wind" />
      <div className="hb-grid">
        <div className="hb-copy">
          <p className="hb-eyebrow" data-reveal="fade">
            KAZE Home Barista
          </p>
          <KineticTitle
            id="hb-title"
            className="hb-title"
            reveal="words"
            lines={[
              { text: "Tu café viene", voice: "serif" },
              { text: "con algo más.", voice: "italic", indent: 0.4 },
            ]}
          />
          <p className="hb-lead" data-reveal="fade">
            Con tu compra, recibís KAZE Home Barista, una guía digital para preparar y disfrutar mejor cada taza.
          </p>
          <ul className="hb-contents">
            {CONTENTS.map((item) => (
              <li key={item} data-reveal="fade">
                {item}
              </li>
            ))}
          </ul>
          <p className="hb-format" data-reveal="fade">
            Guía digital · 12 páginas · Formato A5
          </p>
          <a href={COLLECTION_ANCHOR} className="btn btn-primary btn-lg" data-reveal="fade">
            Explorar cafés
          </a>
        </div>

        <div className="hb-mock">
          <div className="hb-page hb-page-a">
            <Image
              src="/guide/home-barista-molienda.webp"
              alt=""
              width={PAGE_WIDTH}
              height={PAGE_HEIGHT}
              sizes="(max-width: 1023px) 52vw, 24vw"
              loading="lazy"
            />
          </div>
          <div className="hb-page hb-page-b">
            <Image
              src="/guide/home-barista-v60.webp"
              alt=""
              width={PAGE_WIDTH}
              height={PAGE_HEIGHT}
              sizes="(max-width: 1023px) 52vw, 24vw"
              loading="lazy"
            />
          </div>
          <div className="hb-page hb-cover">
            <Image
              src="/guide/home-barista-portada.webp"
              alt="Portada de la guía KAZE Home Barista: una taza de café vista desde arriba sobre fondo negro."
              width={960}
              height={1360}
              sizes="(max-width: 1023px) 62vw, 30vw"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
