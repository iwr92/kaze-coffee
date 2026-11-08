/**
 * Canales de pedido de KAZE EN CASA (bebidas preparadas).
 *
 * Las bebidas no se venden en WooCommerce: se piden por PedidosYa o WhatsApp.
 * Ningún enlace se escribe a mano en los componentes: todo sale de acá, y cada
 * valor viene de una variable de entorno (ver .env.example). Sin valor, el
 * canal se muestra como "en preparación" y la landing no afirma que se pueda
 * pedir por él.
 */

export type ChannelId = "pedidosya" | "whatsapp";

export interface OrderChannel {
  id: ChannelId;
  label: string;
  /** `false`: canal todavía no habilitado (sin URL o número configurado). */
  enabled: boolean;
}

/** Solo una URL https de PedidosYa (pedidosya.com o pedidosya.com.ar). */
function pedidosYaUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    const valid = url.protocol === "https:" && /(^|\.)pedidosya\.com(\.ar)?$/.test(host);
    return valid ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Número en formato internacional, solo dígitos (ej.: 5491122334455). */
function whatsAppNumber(value: string | undefined): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

export const PEDIDOSYA_URL = pedidosYaUrl(process.env.NEXT_PUBLIC_KAZE_PEDIDOSYA_URL);
export const WHATSAPP_NUMBER = whatsAppNumber(process.env.NEXT_PUBLIC_KAZE_WHATSAPP_NUMBER);

/** Nota breve de zona de entrega. Solo se muestra si está confirmada y cargada. */
export const DELIVERY_NOTE = process.env.NEXT_PUBLIC_KAZE_DELIVERY_NOTE?.trim() || null;

export const ORDER_CHANNELS: OrderChannel[] = [
  { id: "pedidosya", label: "PedidosYa", enabled: PEDIDOSYA_URL !== null },
  { id: "whatsapp", label: "WhatsApp", enabled: WHATSAPP_NUMBER !== null },
];

/** Enlace de cada canal. WhatsApp abre el chat con un mensaje inicial editable. */
export function channelHref(id: ChannelId, drinkName?: string): string | null {
  if (id === "pedidosya") return PEDIDOSYA_URL;
  if (!WHATSAPP_NUMBER) return null;
  const text = drinkName ? `Hola KAZE, quiero pedir un ${drinkName}.` : "Hola KAZE, quiero hacer un pedido.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
