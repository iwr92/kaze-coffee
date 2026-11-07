import { STORE_PAGES } from "@/config/store";

export interface FaqItem {
  question: string;
  answer: string;
  link?: { href: string; label: string };
}

/** Preguntas frecuentes. Solo condiciones publicadas o confirmadas. */
export const FAQ: FaqItem[] = [
  {
    question: "¿Qué café elegir si estoy empezando?",
    answer:
      "Si buscás una taza equilibrada y de acidez baja, empezá por el Blend Colombia & Brasil, con notas a chocolate y cacao. Si te gustan los perfiles afrutados, probá el Perú Cajamarca. Si querés algo distinto, el Etiopía Tega & Tula trae cítricos, té negro y miel.",
  },
  {
    question: "¿Puedo comprar café molido?",
    answer:
      "El catálogo contempla en grano, espresso, V60 / filtro, prensa francesa y cafetera italiana. Las moliendas disponibles para cada café se eligen y se confirman en la tienda.",
  },
  {
    question: "¿Cuánto trae cada bolsa?",
    answer: "Cada bolsa trae 250 g y llega en el packaging original.",
  },
  {
    question: "¿Cómo recibo mi guía KAZE Home Barista?",
    answer:
      "La guía es digital y viene incluida con tu compra. No es una descarga pública: se entrega a quienes compran, y te indicamos cómo recibirla al confirmar tu pedido.",
  },
  {
    question: "¿Dónde consulto los envíos?",
    answer: "Las opciones, los costos y los plazos de envío figuran en la tienda, antes de pagar.",
    link: { href: STORE_PAGES.shipping, label: "Ver la política de envíos" },
  },
  {
    question: "¿Cómo realizo mi compra?",
    answer:
      "Elegí tu café acá y terminá la compra en nuestra tienda, donde seleccionás la molienda, el envío y el medio de pago.",
    link: { href: STORE_PAGES.shop, label: "Ir a la tienda" },
  },
];
