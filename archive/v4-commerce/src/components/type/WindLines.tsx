import type { WindLine } from "@/cinematic/moments";

type HeadingTag = "h1" | "h2" | "h3" | "p";

interface WindLinesProps {
  as?: HeadingTag;
  /** Texto completo: es lo que leen los lectores de pantalla. */
  label: string;
  lines: readonly WindLine[];
  className?: string;
}

/**
 * Titular monumental compuesto en líneas escalonadas ("diagonal de viento").
 *
 * Estructura por línea, para que cada capa tenga un solo dueño de animación:
 *   .kz-line        desplazamiento por scroll (el viento la arrastra)
 *   .kz-line-air    reacción al puntero (se mece)
 *   .kz-line-inner  entrada (sube desde la máscara)
 */
export function WindLines({ as: Tag = "h2", label, lines, className = "" }: WindLinesProps) {
  return (
    <Tag className={`kz-wind ${className}`} aria-label={label}>
      {lines.map((line, i) => (
        <span
          key={line.text}
          className="kz-line"
          aria-hidden
          style={{ "--kz-indent": `${line.indent}em`, "--kz-i": i } as React.CSSProperties}
        >
          <span className="kz-line-air">
            <span className="kz-line-inner">{line.text}</span>
          </span>
        </span>
      ))}
    </Tag>
  );
}
