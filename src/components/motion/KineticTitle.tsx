import { Fragment, type CSSProperties, type ElementType } from "react";

export interface TitleLine {
  text: string;
  /** "serif": Shippori 800 (la marca) · "italic": Instrument Sans cursiva (el ritmo). */
  voice?: "serif" | "italic";
  /** Sangría en em, para componer el escalonado. */
  indent?: number;
}

interface KineticTitleProps {
  as?: ElementType;
  id?: string;
  lines: readonly TitleLine[];
  className?: string;
  /** "words": revelado por palabras al entrar en pantalla. Sin él, lo anima el padre. */
  reveal?: "words";
}

/**
 * Titular partido en líneas y palabras, accesible: el lector de pantalla lee
 * el texto completo (aria-label); las piezas visuales son aria-hidden.
 *
 *   .kt-line   una línea (voz e indentación)
 *   .kt-mask   máscara de cada palabra
 *   .kt-word   la palabra que sube desde la máscara
 *
 * Se divide en el servidor (no en el cliente) para que no haya saltos de
 * maquetación ni diferencias de hidratación.
 */
export function KineticTitle({ as: Tag = "h2", id, lines, className = "", reveal }: KineticTitleProps) {
  const label = lines.map((l) => l.text).join(" ");
  return (
    <Tag id={id} className={`kt ${className}`} aria-label={label} data-reveal={reveal}>
      {lines.map((line, li) => (
        <span
          key={li}
          className={`kt-line kt-${line.voice ?? "serif"}`}
          aria-hidden
          style={line.indent ? ({ "--kt-indent": `${line.indent}em` } as CSSProperties) : undefined}
        >
          {line.text.split(" ").map((word, wi, arr) => (
            // El espacio va fuera de la máscara: dentro de un inline-block se colapsa.
            <Fragment key={wi}>
              <span className="kt-mask">
                <span className="kt-word">{word}</span>
              </span>
              {wi < arr.length - 1 ? " " : null}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  );
}
