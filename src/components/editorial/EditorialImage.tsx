/**
 * Fotografías editoriales generadas por scripts/editorial/build-editorial.mjs
 * desde los keyframes originales (detalle real, sin ampliar).
 */

const IMAGES = {
  "granos-macro": { widths: [1200, 700], aspect: 1200 / 900 },
  "ruptura-macro": { widths: [1200, 700], aspect: 1200 / 900 },
  "corriente-vertical": { widths: [1300, 760], aspect: 1300 / 1536 },
  "corriente-taza": { widths: [2400, 1200], aspect: 2752 / 1536 },
  "ritual-amplio": { widths: [2400, 1400], aspect: 2752 / 1536 },
  "ritual-vertical": { widths: [1200, 720], aspect: 1200 / 1536 },
} as const;

export type EditorialImageId = keyof typeof IMAGES;

interface EditorialImageProps {
  id: EditorialImageId;
  alt: string;
  /** Atributo `sizes`: qué ancho ocupa la imagen en cada pantalla. */
  sizes: string;
  className?: string;
  priority?: boolean;
}

export function EditorialImage({ id, alt, sizes, className = "", priority = false }: EditorialImageProps) {
  const { widths, aspect } = IMAGES[id];
  const srcSet = (ext: string) => widths.map((w) => `/editorial/${id}-${w}.${ext} ${w}w`).join(", ");
  const largest = widths[0];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <img
        src={`/editorial/${id}-${largest}.webp`}
        srcSet={srcSet("webp")}
        sizes={sizes}
        alt={alt}
        width={largest}
        height={Math.round(largest / aspect)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
