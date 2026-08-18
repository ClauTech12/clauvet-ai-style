// Configure your WhatsApp number here (international format, no +, e.g. "33612345678")
export const WHATSAPP_NUMBER = "237650556715";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
