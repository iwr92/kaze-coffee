import { MOMENTS, type Moment, type MomentPlacement } from "@/cinematic/moments";
import { WindLines } from "../type/WindLines";

const PLACEMENT: Record<MomentPlacement, string> = {
  bottom: "md:justify-end md:pb-24",
  center: "md:justify-center",
};

const SCALE: Record<Moment["scale"], string> = {
  hero: "kz-hero-title",
  caption: "kz-hero-caption",
  close: "kz-hero-close",
};

/**
 * Mensajes del hero sobre la secuencia. Su entrada, salida y deriva las anima
 * la misma línea de tiempo que mueve los cuadros (CinematicScrollExperience).
 * Desktop: columna izquierda, sin invadir el sujeto del video.
 * Móvil: el texto arriba, la imagen abajo.
 */
export function EditorialOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {MOMENTS.map((moment, i) => (
        <MomentBlock key={moment.id} moment={moment} first={i === 0} />
      ))}
    </div>
  );
}

function MomentBlock({ moment, first }: { moment: Moment; first: boolean }) {
  return (
    <section
      data-moment={moment.id}
      aria-label={moment.label}
      className={`moment absolute inset-0 flex flex-col justify-start px-5 pt-24 md:px-12 ${PLACEMENT[moment.placement]} ${
        moment.enter ? "moment-hidden" : ""
      }`}
    >
      <div className="moment-copy">
        <p className="moment-label t-label text-ink-muted">
          <span className="moment-rule" aria-hidden />
          {moment.label}
        </p>
        <WindLines
          as={first ? "h1" : "h2"}
          label={moment.title}
          lines={moment.lines}
          className={`moment-title mt-4 text-ink md:mt-5 ${SCALE[moment.scale]}`}
        />
        {(moment.body || moment.cta) && (
          <div className="moment-foot mt-6 flex flex-col items-start gap-5 md:mt-8 md:flex-row md:items-center md:gap-8">
            {moment.cta && (
              <a href={moment.cta.href} className="btn btn-primary pointer-events-auto">
                {moment.cta.label}
              </a>
            )}
            {moment.body && <p className="moment-body t-body-lg max-w-[30ch] text-ink-muted">{moment.body}</p>}
          </div>
        )}
        {first && (
          <p className="scroll-cue t-caption text-ink-muted" aria-hidden>
            <span className="scroll-cue-line" />
            Deslizá para ver el grano convertirse en café
          </p>
        )}
      </div>
    </section>
  );
}
