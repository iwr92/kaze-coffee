"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  DRINKS,
  extraDrinks,
  featuredDrinks,
  TEMP_THEMES,
  TEMPS,
  type Drink,
  type DrinkTemp,
} from "@/commerce/drinks";
import { channelHref, DELIVERY_NOTE, ORDER_CHANNELS, type OrderChannel } from "@/config/channels";
import { gsap, ScrollTrigger } from "../motion/ease";
import { KineticTitle } from "../motion/KineticTitle";

const pad = (n: number) => String(n).padStart(2, "0");
const FEATURED = DRINKS.filter((d) => d.featured);
const tabId = (t: DrinkTemp) => `en-casa-tab-${t}`;

/** Variables de color ambiental que se interpolan al cambiar de temperatura. */
function ambient(t: DrinkTemp) {
  const theme = TEMP_THEMES[t];
  return { "--ec-bg": theme.bg, "--ec-halo": theme.halo, "--ec-accent": theme.accent, "--ec-on-accent": theme.onAccent };
}

/**
 * KAZE EN CASA: bebidas preparadas, calientes y frías.
 *
 * Una campaña dentro de la landing: el perla se abre en borgoña, la bebida
 * protagonista entra con profundidad y el selector HOT / ICED cambia bebida,
 * color ambiental, nombre y gráficos. El estado lo lleva React (también sin JS
 * de animación o con movimiento reducido); GSAP solo coreografía el cambio y
 * al terminar limpia sus estilos, así el CSS vuelve a mandar.
 */
export function KazeEnCasa() {
  const rootRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const motionRef = useRef(false);
  const swapRef = useRef<gsap.core.Timeline | null>(null);
  const [temp, setTemp] = useState<DrinkTemp>("hot");
  const [selected, setSelected] = useState<Record<DrinkTemp, string>>({
    hot: featuredDrinks("hot")[0].id,
    iced: featuredDrinks("iced")[0].id,
  });
  const activeId = selected[temp];
  const active = FEATURED.find((d) => d.id === activeId) ?? FEATURED[0];

  // Entrada, profundidad y salida. Todo dentro de un matchMedia con alcance a
  // la sección: se revierte solo y no toca los ScrollTrigger del resto.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 1024px)",
        fine: "(hover: hover) and (pointer: fine)",
      },
      (context) => {
        const { motion, desktop, fine } = context.conditions as Record<string, boolean>;
        motionRef.current = motion;
        if (!motion) return;

        // 1 · El perla se abre en borgoña: un iris centrado en la bebida.
        // 100 % alcanza para cubrir la sección desde ese centro.
        const at = desktop ? "62% 34%" : "50% 30%";
        gsap.fromTo(
          ".ec-bg",
          { clipPath: `circle(0% at ${at})` },
          {
            clipPath: `circle(100% at ${at})`,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top 92%", end: "top 12%", scrub: 0.6 },
          },
        );

        // 2-3 · Eyebrow y titular por máscaras, cuando el borgoña ya los cubre.
        gsap
          .timeline({ defaults: { ease: "kz" }, scrollTrigger: { trigger: root, start: desktop ? "top 40%" : "top 56%" } })
          .fromTo(".ec-eyebrow .ec-mask-in", { yPercent: 110 }, { yPercent: 0, duration: 0.75 }, 0)
          .fromTo(".ec-title .kt-word", { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.08 }, 0.1)
          .fromTo(".ec-sub", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.55);

        // 4 · La bebida entra con escala y profundidad.
        gsap
          .timeline({ defaults: { ease: "kz" }, scrollTrigger: { trigger: ".ec-visual", start: "top 78%" } })
          .fromTo(".ec-halo", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, 0)
          .fromTo(".ec-word-wrap", { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.3 }, 0.1)
          .fromTo(".ec-product", { scale: 0.74, yPercent: 14, opacity: 0 }, { scale: 1, yPercent: 0, opacity: 1, duration: 1.4 }, 0.15)
          .fromTo(".ec-fx", { opacity: 0 }, { opacity: 1, duration: 1 }, 0.8);

        // 5 · Selector y panel, de forma progresiva.
        gsap
          .timeline({ defaults: { ease: "kz" }, scrollTrigger: { trigger: ".ec-switch", start: "top 88%" } })
          .fromTo(".ec-tab", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 }, 0)
          .fromTo(".ec-pill-inner", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "kzInOut" }, 0.2);
        gsap.utils.toArray<HTMLElement>(".ec-reveal", root).forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.75, ease: "kz", scrollTrigger: { trigger: el, start: "top 92%" } },
          );
        });

        // Profundidad con el scroll: cada plano a su velocidad (reversible).
        const planes: [string, number][] = [
          [".ec-depth-word", 7],
          [".ec-depth-halo", 3],
          [".ec-depth-product", -2.5],
          [".ec-depth-fx", -8],
        ];
        planes.forEach(([selector, amount]) => {
          gsap.fromTo(
            selector,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: "none",
              scrollTrigger: { trigger: ".ec-visual", start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        // Vapor y hielo respiran solo mientras la sección está en pantalla.
        // La bebida flota apenas, a otro ritmo (y en px: no pisa la escala de la entrada).
        const idle = gsap
          .timeline({ paused: true })
          .to(".ec-fx-drift", { y: -12, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0)
          .to(".ec-product", { y: -7, duration: 4.2, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? idle.play() : idle.pause()),
        });

        // Salida: una ola perla sube y entrega la página a la franja siguiente.
        gsap.fromTo(
          ".ec-exit",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: root, start: "bottom bottom", end: "bottom 35%", scrub: 0.6 },
          },
        );

        // Profundidad con el puntero (solo escritorio con mouse).
        if (!(fine && desktop)) return;
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", root).map((el) => ({
          depth: Number(el.dataset.depth) || 0,
          x: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 1, ease: "power3" }),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.depth);
            l.y(ny * l.depth * 0.6);
          });
        };
        const onLeave = () => layers.forEach((l) => (l.x(0), l.y(0)));
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        return () => {
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        };
      },
    );
    return () => {
      swapRef.current?.kill();
      mm.revert();
    };
  }, []);

  /** Cambia de bebida (y de temperatura, si corresponde) con su coreografía. */
  function change(nextTemp: DrinkTemp, nextId: string) {
    const root = rootRef.current;
    if (!root || (nextTemp === temp && nextId === activeId)) return;
    const commit = () => {
      setTemp(nextTemp);
      setSelected((s) => ({ ...s, [nextTemp]: nextId }));
    };
    if (!motionRef.current) return commit();

    // Un cambio nuevo termina el anterior en su estado final: nunca se traba.
    swapRef.current?.progress(1).kill();

    const tempChange = nextTemp !== temp;
    const order = FEATURED.map((d) => d.id);
    const dir = order.indexOf(nextId) >= order.indexOf(activeId) ? 1 : -1;
    const q = (selector: string) => root.querySelector<HTMLElement | SVGElement>(selector);
    const lines = (el: Element | null) => (el ? Array.from(el.querySelectorAll(".ec-line > span")) : []);

    const fromLayer = q(`[data-layer="${activeId}"]`);
    const toLayer = q(`[data-layer="${nextId}"]`);
    const fromCopy = q(`[data-copy="${activeId}"]`);
    const toCopy = q(`[data-copy="${nextId}"]`);
    const leaving: Element[] = [];
    const keep = (...els: (Element | null)[]) => {
      els.forEach((el) => el && leaving.push(el));
    };
    keep(fromLayer, fromCopy);

    const tl = gsap.timeline({ defaults: { ease: "kzInOut" } });
    swapRef.current = tl;

    // Lo que sale sigue visible hasta terminar su salida (React ya lo desactivó).
    gsap.set(leaving, { visibility: "visible" });

    // Bebida: crossfade con escala y deriva en la dirección del cambio.
    tl.to(fromLayer, { opacity: 0, scale: 0.9, xPercent: -6 * dir, yPercent: -4, duration: 0.55 }, 0)
      .fromTo(
        toLayer,
        { opacity: 0, scale: 1.1, xPercent: 8 * dir, yPercent: 6 },
        { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, duration: 1.05, ease: "kz" },
        0.2,
      )
      // Nombre y descripción: salen por arriba, entran desde abajo.
      .to(lines(fromCopy), { yPercent: -110, duration: 0.4, stagger: 0.04 }, 0)
      .fromTo(lines(toCopy), { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "kz", stagger: 0.06 }, 0.3)
      .to(".ec-halo-ring", { rotate: `+=${tempChange ? 90 : 30}`, duration: 1.2, ease: "kz" }, 0);

    if (tempChange) {
      const fromWord = q(`[data-word="${temp}"]`);
      const toWord = q(`[data-word="${nextTemp}"]`);
      const fromPicks = q(`[data-picks="${temp}"]`);
      const toPicks = q(`[data-picks="${nextTemp}"]`);
      const fromFx = q(`[data-fx="${temp}"]`);
      const toFx = q(`[data-fx="${nextTemp}"]`);
      keep(fromWord, fromPicks, fromFx);
      gsap.set(leaving, { visibility: "visible" });

      tl.fromTo(root, ambient(temp), { ...ambient(nextTemp), duration: 0.9 }, 0)
        .to(fromWord, { yPercent: -100, opacity: 0, duration: 0.6 }, 0)
        .fromTo(toWord, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "kz" }, 0.2)
        .to(".ec-halo-disc", { scale: 0.86, duration: 0.4, yoyo: true, repeat: 1, ease: "power2.inOut" }, 0)
        .fromTo(
          ".ec-pill-inner",
          { scaleX: 1, transformOrigin: dir > 0 ? "0% 50%" : "100% 50%" },
          { scaleX: 1.22, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" },
          0,
        )
        .to(fromPicks ? Array.from(fromPicks.children) : [], { opacity: 0, y: -10, duration: 0.3, stagger: 0.03 }, 0)
        .fromTo(
          toPicks ? Array.from(toPicks.children) : [],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: "kz", stagger: 0.06 },
          0.35,
        )
        .to(fromFx ? fromFx.querySelectorAll(".ec-fx-mark") : [], { drawSVG: "100% 100%", duration: 0.5, stagger: 0.04 }, 0)
        .fromTo(
          toFx ? toFx.querySelectorAll(".ec-fx-mark") : [],
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 1.1, ease: "kz", stagger: 0.07 },
          0.35,
        );
    }

    // Al terminar, sin estilos en línea en lo que cambió: manda el CSS.
    const touched: (Element | null)[] = [...leaving, toLayer, toCopy, ...lines(fromCopy), ...lines(toCopy)];
    if (tempChange) {
      touched.push(
        q(`[data-word="${nextTemp}"]`),
        ...Array.from(root.querySelectorAll(".ec-picks > *")),
        ...Array.from(root.querySelectorAll(".ec-fx-mark")),
      );
    }
    tl.eventCallback("onComplete", () => {
      gsap.set(touched.filter(Boolean), { clearProps: "visibility,opacity,transform,strokeDasharray,strokeDashoffset" });
    });

    commit();
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % TEMPS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TEMPS.length) % TEMPS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TEMPS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    tabsRef.current[next]?.focus();
    change(TEMPS[next], selected[TEMPS[next]]);
  }

  const theme = TEMP_THEMES[temp];
  const anyChannel = ORDER_CHANNELS.some((c) => c.enabled);

  return (
    <section ref={rootRef} id="en-casa" aria-labelledby="en-casa-title" className="ec relative z-10" data-temp={temp}>
      <div className="ec-bg" aria-hidden />

      <div className="ec-inner">
        <header className="ec-head">
          <p className="ec-eyebrow">
            <span className="ec-mask">
              <span className="ec-mask-in">
                KAZE <span className="ec-slash">/</span> EN CASA
              </span>
            </span>
          </p>
          <KineticTitle
            id="en-casa-title"
            className="ec-title"
            lines={[
              { text: "TU CAFÉ.", voice: "serif" },
              { text: "TU MOMENTO.", voice: "italic", indent: 0.55 },
            ]}
          />
          <p className="ec-sub">Caliente o frío. Preparado para vos.</p>
        </header>

        <div className="ec-switch" role="tablist" aria-label="Temperatura de la bebida" data-temp={temp}>
          <span className="ec-pill" aria-hidden>
            <span className="ec-pill-inner" />
          </span>
          {TEMPS.map((t, i) => (
            <button
              key={t}
              ref={(el) => {
                tabsRef.current[i] = el;
              }}
              id={tabId(t)}
              type="button"
              role="tab"
              className="ec-tab"
              aria-selected={t === temp}
              aria-controls="en-casa-panel"
              tabIndex={t === temp ? 0 : -1}
              onClick={() => change(t, selected[t])}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <span className="ec-tab-label">{TEMP_THEMES[t].label}</span>
              <span className="ec-tab-caption">{TEMP_THEMES[t].caption}</span>
            </button>
          ))}
        </div>

        <div className="ec-visual">
          <div className="ec-depth ec-depth-word" data-depth="-16" aria-hidden>
            <div className="ec-word-wrap ec-stack">
              {TEMPS.map((t) => (
                <span key={t} className="ec-word" data-swap data-word={t} data-active={t === temp || undefined}>
                  {TEMP_THEMES[t].label}
                </span>
              ))}
            </div>
          </div>

          <div className="ec-depth ec-depth-halo" data-depth="-8" aria-hidden>
            <div className="ec-halo">
              <span className="ec-halo-disc" />
              <svg className="ec-halo-ring" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="98" />
                {Array.from({ length: 48 }, (_, i) => (
                  <line key={i} x1="100" y1="2" x2="100" y2={i % 4 === 0 ? 10 : 6} transform={`rotate(${i * 7.5} 100 100)`} />
                ))}
              </svg>
            </div>
          </div>

          <div className="ec-depth ec-depth-product" data-depth="14">
            <div className="ec-product">
              {FEATURED.map((d) => (
                <figure
                  key={d.id}
                  className={d.image ? "ec-layer ec-layer-photo" : "ec-layer"}
                  data-swap
                  data-layer={d.id}
                  data-active={d.id === activeId || undefined}
                  aria-hidden={d.id !== activeId}
                >
                  {d.image ? (
                    <>
                      {/* Sombra de apoyo bajo la base del vaso. */}
                      <span className="ec-photo-shadow" aria-hidden />
                      <Image
                        src={d.image.src}
                        alt={d.image.alt}
                        fill
                        sizes="(max-width: 1023px) 96vw, 46vw"
                        className="ec-photo"
                      />
                    </>
                  ) : (
                    <PhotoPlaceholder drink={d} />
                  )}
                </figure>
              ))}
            </div>
          </div>

          <div className="ec-depth ec-depth-fx" data-depth="26" aria-hidden>
            <svg className="ec-fx" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid meet">
              <g className="ec-fx-drift">
                <g data-swap data-fx="hot" data-active={temp === "hot" || undefined}>
                  <path className="ec-fx-mark" d="M262 210 C 240 170, 292 140, 268 100 S 250 40, 276 0" />
                  <path className="ec-fx-mark" d="M300 220 C 278 176, 330 146, 306 104 S 288 44, 314 6" />
                  <path className="ec-fx-mark" d="M338 206 C 318 170, 364 144, 344 108 S 330 56, 352 22" />
                </g>
                <g data-swap data-fx="iced" data-active={temp === "iced" || undefined}>
                  <rect className="ec-fx-mark" x="58" y="168" width="54" height="54" rx="10" transform="rotate(-16 85 195)" />
                  <rect className="ec-fx-mark" x="488" y="268" width="44" height="44" rx="9" transform="rotate(12 510 290)" />
                  <rect className="ec-fx-mark" x="96" y="588" width="38" height="38" rx="8" transform="rotate(22 115 607)" />
                  <rect className="ec-fx-mark" x="470" y="560" width="58" height="58" rx="11" transform="rotate(-8 499 589)" />
                  <circle className="ec-fx-mark" cx="150" cy="300" r="4" />
                  <circle className="ec-fx-mark" cx="458" cy="440" r="3" />
                  <circle className="ec-fx-mark" cx="534" cy="200" r="5" />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <div id="en-casa-panel" role="tabpanel" aria-labelledby={tabId(temp)} className="ec-tabpanel">
          <div className="ec-copies ec-stack">
            {FEATURED.map((d) => {
              const index = featuredDrinks(d.temp).indexOf(d) + 1;
              const isActive = d.id === activeId;
              return (
                <div key={d.id} className="ec-copy" data-swap data-copy={d.id} data-active={isActive || undefined} aria-hidden={!isActive}>
                  <p className="ec-kicker">
                    <span className="ec-line">
                      <span>
                        {TEMP_THEMES[d.temp].caption} · {pad(index)}
                      </span>
                    </span>
                  </p>
                  <h3 className="ec-name">
                    <span className="ec-line">
                      <span>{d.name}</span>
                    </span>
                  </h3>
                  <p className="ec-desc">
                    <span className="ec-line">
                      <span>{d.description}</span>
                    </span>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="ec-stack ec-picks-stack ec-reveal">
            {TEMPS.map((t) => {
              const extras = extraDrinks(t);
              return (
                <div
                  key={t}
                  className="ec-picks"
                  data-swap
                  data-picks={t}
                  data-active={t === temp || undefined}
                  inert={t !== temp}
                >
                  <ul className="ec-pick-list" aria-label={`Bebidas ${TEMP_THEMES[t].caption.toLowerCase()}`}>
                    {featuredDrinks(t).map((d, i) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          className="ec-pick"
                          aria-pressed={selected[t] === d.id}
                          onClick={() => change(t, d.id)}
                        >
                          <span className="ec-pick-index">{pad(i + 1)}</span>
                          <span className="ec-pick-name">{d.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {extras.length > 0 && (
                    <p className="ec-extras">
                      <span className="ec-extras-label">También</span> {extras.map((d) => d.name).join(" · ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="ec-order ec-reveal">
          <div className="ec-ctas">
            {ORDER_CHANNELS.map((channel) => (
              <OrderCta key={channel.id} channel={channel} drinkName={active.name} />
            ))}
          </div>
          {!anyChannel && <p className="ec-note">Estamos habilitando los pedidos por PedidosYa y WhatsApp.</p>}
          {DELIVERY_NOTE && <p className="ec-note">{DELIVERY_NOTE}</p>}
        </div>
      </div>

      <svg className="ec-exit" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden>
        <path d="M0 220 V120 C 240 30, 520 190, 820 96 S 1220 20, 1440 110 V220 Z" />
      </svg>
      <span className="sr-only" aria-live="polite">{`Seleccionado: ${active.name}, ${theme.caption.toLowerCase()}.`}</span>
    </section>
  );
}

function OrderCta({ channel, drinkName }: { channel: OrderChannel; drinkName: string }) {
  const href = channelHref(channel.id, drinkName);
  if (!href) {
    // Sin URL configurada: no se afirma que se pueda pedir.
    return (
      <span className={`ec-cta ec-cta-${channel.id} is-off`}>
        <span className="ec-cta-label">{channel.label}</span>
        <span className="ec-cta-state">Canal en preparación</span>
      </span>
    );
  }
  return (
    <a href={href} className={`ec-cta ec-cta-${channel.id}`} target="_blank" rel="noopener noreferrer">
      <span className="ec-cta-label">Pedir por {channel.label}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="ec-cta-arrow">
        <path d="M3 12h17M14 5.5 20.5 12 14 18.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </a>
  );
}

/**
 * Placeholder editorial de la fase 1: marcas de corte, la silueta del
 * recipiente (no una bebida) y el archivo que falta. Se reemplaza solo al
 * cargar `image` en drinks.ts.
 */
function PhotoPlaceholder({ drink }: { drink: Drink }) {
  return (
    <div className="ec-ph">
      <span className="ec-ph-crop" aria-hidden />
      <svg className="ec-ph-vessel" viewBox="0 0 200 260" aria-hidden>
        {drink.temp === "hot" ? (
          <>
            <path d="M40 120 H160 L150 200 C 148 214, 136 222, 122 222 H78 C 64 222, 52 214, 50 200 Z" />
            <path d="M158 138 C 186 136, 190 176, 152 182" />
            <ellipse cx="100" cy="232" rx="80" ry="12" />
          </>
        ) : (
          <>
            <path d="M52 44 H148 L136 236 C 135 244, 128 250, 120 250 H80 C 72 250, 65 244, 64 236 Z" />
            <path d="M118 8 L104 150" />
          </>
        )}
      </svg>
      <span className="ec-ph-tag">Foto pendiente</span>
      <span className="ec-ph-file">{drink.photo}</span>
    </div>
  );
}
