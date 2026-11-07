/** Dominio público de la landing y regla de indexación. */

export const SITE_URL = "https://www.kazecoffee.shop";

export const SITE_TITLE = "KAZE — Café de especialidad, a tu ritmo";

export const SITE_DESCRIPTION =
  "Comprá café de especialidad online: Blend Colombia & Brasil, Perú Cajamarca y Etiopía Tega & Tula, en bolsas de 250 g, en grano o con la molienda que prefieras.";

/** Solo el deploy de producción se indexa; las vistas previas de Vercel no. */
export const SITE_INDEXABLE = process.env.VERCEL_ENV === "production";
