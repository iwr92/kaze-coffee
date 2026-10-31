export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-linea bg-crema px-4 py-12 text-negro md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/svg/kaze-isotipo-negro.svg" alt="Kaze" width={32} height={32} />
          <span className="font-display text-xl" lang="ja" aria-hidden>
            風
          </span>
        </div>
        <p className="t-caption text-ink-muted">Café de especialidad, a tu ritmo.</p>
      </div>
    </footer>
  );
}
