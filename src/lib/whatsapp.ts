// Configure your WhatsApp number here (international format, no +, e.g. "33612345678")
// TODO: replace with the brand's real WhatsApp number.
export const WHATSAPP_NUMBER = "33600000000";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
