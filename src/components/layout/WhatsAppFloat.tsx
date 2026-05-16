import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { useI18n } from "@/i18n/I18nProvider";

export function WhatsAppFloat() {
  const { locale } = useI18n();
  const msg = locale === "fr"
    ? "Bonjour Clauvèra, j'aimerais des conseils sur un produit."
    : "Hi Clauvèra, I'd like help with a product.";
  return (
    <motion.a
      href={whatsappLink(msg)}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-luxury"
      style={{ backgroundColor: "#25D366" }}
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-6 h-6" fill="currentColor" />
    </motion.a>
  );
}
