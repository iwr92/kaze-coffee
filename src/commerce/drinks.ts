/**
 * KAZE EN CASA: bebidas preparadas, calientes y frías.
 *
 * Única fuente de datos de la sección. Para agregar una bebida, sumá un objeto
 * a DRINKS; para que sea protagonista del selector, `featured: true`.
 *
 * Reglas (ver docs/kaze-en-casa/README.md):
 *  - Sin precios, tamaños, ingredientes ni promociones hasta tenerlos confirmados.
 *  - `description` es texto de campaña que solo se apoya en el nombre de la
 *    bebida. Reemplazarlo cuando estén las recetas reales.
 *  - Fotos: archivos locales en public/drinks/. Mientras `image` sea `null`,
 *    la sección muestra un placeholder identificado como "Foto pendiente".
 *  - Todas las fotos comparten encuadre: lienzo 1080 × 1350 con alfa y la base
 *    del vaso al 87,5 % de la altura (HOT al 62 % de alto, ICED al 70 %), para
 *    que el crossfade no salte. Proceso en docs/kaze-en-casa/README.md.
 */

export type DrinkTemp = "hot" | "iced";

export interface DrinkImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Drink {
  id: string;
  name: string;
  temp: DrinkTemp;
  /** Protagonista del selector (hasta tres por temperatura). */
  featured: boolean;
  description: string;
  /** Archivo esperado en public/drinks/ (referencia para la fase de fotos). */
  photo: string;
  /** `null`: foto pendiente, se muestra el placeholder. */
  image: DrinkImage | null;
}

export interface TempTheme {
  /** Texto del selector y de la palabra monumental. */
  label: string;
  /** Lectura en castellano para el selector y lectores de pantalla. */
  caption: string;
  /** Paleta ambiental (solo colores de la sección). */
  bg: string;
  halo: string;
  accent: string;
  onAccent: string;
}

/** Paleta exclusiva de KAZE EN CASA. */
export const EC_COLORS = {
  borgona: "#481C24",
  espresso: "#6D3828",
  caramelo: "#D68B48",
  crema: "#FFF0DC",
  blanco: "#FFF9F3",
} as const;

export const TEMP_THEMES: Record<DrinkTemp, TempTheme> = {
  hot: {
    label: "Hot",
    caption: "Calientes",
    bg: EC_COLORS.borgona,
    halo: EC_COLORS.espresso,
    accent: EC_COLORS.caramelo,
    onAccent: EC_COLORS.borgona,
  },
  iced: {
    label: "Iced",
    caption: "Frías",
    bg: EC_COLORS.espresso,
    halo: EC_COLORS.borgona,
    accent: EC_COLORS.crema,
    onAccent: EC_COLORS.espresso,
  },
};

export const TEMPS: DrinkTemp[] = ["hot", "iced"];

export const DRINKS: Drink[] = [
  // ——— HOT: protagonistas ———
  {
    id: "cappuccino",
    name: "Cappuccino",
    temp: "hot",
    featured: true,
    description: "El clásico de cafetería, preparado para vos.",
    photo: "/drinks/cappuccino.webp",
    image: {
      src: "/drinks/cappuccino.webp",
      alt: "Cappuccino de KAZE en vaso de papel blanco, con espuma de leche sobre la crema.",
      width: 1080,
      height: 1350,
    },
  },
  {
    id: "vanilla-latte",
    name: "Vanilla Latte",
    temp: "hot",
    featured: true,
    description: "Café y vainilla, en una taza para frenar un rato.",
    photo: "/drinks/vanilla-latte.webp",
    image: {
      src: "/drinks/vanilla-latte.webp",
      alt: "Vanilla Latte de KAZE en vaso de papel blanco.",
      width: 1080,
      height: 1350,
    },
  },
  {
    id: "hot-mocha",
    name: "Hot Mocha",
    temp: "hot",
    featured: true,
    description: "Café y chocolate, servido caliente.",
    photo: "/drinks/hot-mocha.webp",
    image: {
      src: "/drinks/hot-mocha.webp",
      alt: "Hot Mocha de KAZE en vaso de papel blanco, con hilos de chocolate sobre la superficie.",
      width: 1080,
      height: 1350,
    },
  },
  // ——— HOT: también en el menú ———
  { id: "espresso", name: "Espresso", temp: "hot", featured: false, description: "", photo: "/drinks/espresso.webp", image: null },
  // Americano y Latte tienen foto lista; hoy "También" se muestra solo como texto.
  {
    id: "americano",
    name: "Americano",
    temp: "hot",
    featured: false,
    description: "",
    photo: "/drinks/americano.webp",
    image: { src: "/drinks/americano.webp", alt: "Americano de KAZE en vaso de papel blanco.", width: 1080, height: 1350 },
  },
  {
    id: "latte",
    name: "Latte",
    temp: "hot",
    featured: false,
    description: "",
    photo: "/drinks/latte.webp",
    image: { src: "/drinks/latte.webp", alt: "Latte de KAZE en vaso de papel blanco.", width: 1080, height: 1350 },
  },
  // ——— ICED ———
  {
    id: "iced-latte",
    name: "Iced Latte",
    temp: "iced",
    featured: true,
    description: "Tu latte de siempre, servido frío.",
    photo: "/drinks/iced-latte.webp",
    image: {
      src: "/drinks/iced-latte.webp",
      alt: "Iced Latte de KAZE en vaso transparente con tapa y hielo.",
      width: 1080,
      height: 1350,
    },
  },
  {
    id: "iced-vanilla-latte",
    name: "Iced Vanilla Latte",
    temp: "iced",
    featured: true,
    description: "Vainilla y café, en su versión fría.",
    photo: "/drinks/iced-vanilla-latte.webp",
    // Recorte con alfa (original en media-src/drinks/). El vaso ocupa ~54 % × 80 % del lienzo.
    image: {
      src: "/drinks/iced-vanilla-latte.webp",
      alt: "Iced Vanilla Latte de KAZE en vaso transparente con hielo y sorbete negro.",
      width: 1080,
      height: 1350,
    },
  },
  {
    id: "iced-mocha",
    name: "Iced Mocha",
    temp: "iced",
    featured: true,
    description: "Café y chocolate, servido frío.",
    photo: "/drinks/iced-mocha.webp",
    image: {
      src: "/drinks/iced-mocha.webp",
      alt: "Iced Mocha de KAZE en vaso transparente con tapa, hielo y salsa de chocolate.",
      width: 1080,
      height: 1350,
    },
  },
];

export const featuredDrinks = (temp: DrinkTemp) => DRINKS.filter((d) => d.temp === temp && d.featured);
export const extraDrinks = (temp: DrinkTemp) => DRINKS.filter((d) => d.temp === temp && !d.featured);
