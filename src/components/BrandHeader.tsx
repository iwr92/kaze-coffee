"use client";

import { useEffect, useRef, useState } from "react";
import { StoreLink } from "./StoreLink";

const NAV = [
  { href: "#cafes", label: "Cafés" },
  { href: "#a-tu-manera", label: "A tu manera" },
  { href: "#ritual", label: "Ritual" },
  { href: "#descubri", label: "Descubrí" },
  { href: "#kaze", label: "KAZE" },
] as const;

/**
 * Encabezado con la firma horizontal original (tinta negra sobre perla).
 * Desktop: navegación con la sección activa marcada. Móvil: menú a pantalla
 * completa con enlaces grandes y la tienda siempre a mano.
 */
export function BrandHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Sección activa: la que ocupa la franja central de la pantalla.
  useEffect(() => {
    const sections = NAV.map((n) => document.querySelector<HTMLElement>(n.href)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const onTop = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null);
    };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, []);

  // Indicador único que se desliza hasta el enlace activo.
  useEffect(() => {
    const nav = navRef.current;
    const bar = indicatorRef.current;
    if (!nav || !bar) return;
    const link = active ? nav.querySelector<HTMLElement>(`a[href="${active}"]`) : null;
    if (!link) {
      bar.style.opacity = "0";
      return;
    }
    bar.style.opacity = "1";
    bar.style.width = `${link.offsetWidth}px`;
    bar.style.transform = `translateX(${link.offsetLeft}px)`;
  }, [active]);

  // Menú móvil: Escape cierra, el foco entra al menú y el fondo no scrollea.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="brand-header fixed inset-x-0 top-0 z-40" data-open={open || undefined}>
      <div className="header-bar">
        <a href="#top" aria-label="Kaze, inicio" className="header-logo" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logos/svg/kaze-firma-horizontal-negro.svg" alt="Kaze" width={280} height={64} />
        </a>

        <nav aria-label="Principal" className="header-nav" ref={navRef}>
          <span className="header-indicator" ref={indicatorRef} aria-hidden />
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="header-link" aria-current={active === n.href ? "true" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <StoreLink className="btn btn-ghost btn-sm">Tienda</StoreLink>
          <button
            ref={toggleRef}
            type="button"
            className="header-menu-toggle"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="header-menu-label">{open ? "Cerrar" : "Menú"}</span>
            <span className="header-menu-icon" aria-hidden />
          </button>
        </div>
      </div>

      <div id="menu-movil" ref={menuRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Menú">
          <ol>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setOpen(false)}>
                  {n.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {/* Cualquier enlace del pie del menú también lo cierra. */}
        <div className="mobile-menu-foot" onClick={() => setOpen(false)}>
          <StoreLink className="btn btn-primary btn-lg">Ir a la tienda</StoreLink>
          <p className="t-caption text-ink-muted">Café de especialidad, a tu ritmo.</p>
        </div>
      </div>
    </header>
  );
}
