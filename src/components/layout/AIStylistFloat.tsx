import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

type Msg = { role: "user" | "assistant"; text: string };

export function AIStylistFloat() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        locale === "fr"
          ? "Bonjour, je suis votre styliste IA Clauvèra. Décrivez l'occasion ou le look que vous recherchez."
          : "Hello, I'm your Clauvèra AI stylist. Tell me about the occasion or look you have in mind.",
    },
  ]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            locale === "fr"
              ? "Excellent choix. Je sélectionne quelques pièces qui complèteront ce style — bientôt disponible dans cette conversation."
              : "Lovely choice. I'm curating pieces that will complete this look — full recommendations coming soon to this chat.",
        },
      ]);
    }, 600);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 md:bottom-6 right-20 md:right-24 z-30 flex items-center gap-2 px-4 h-14 rounded-full bg-gradient-luxury text-gold-foreground shadow-gold font-sans text-sm uppercase tracking-luxury"
        aria-label="AI Stylist"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">{locale === "fr" ? "Styliste IA" : "AI Stylist"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center md:justify-end"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-md md:m-6 h-[80vh] md:h-[600px] bg-card rounded-t-2xl md:rounded-2xl shadow-luxury flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-luxury text-gold-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <div>
                    <div className="font-display text-lg leading-tight">Clauvèra Stylist</div>
                    <div className="text-[11px] uppercase tracking-luxury opacity-80">
                      {locale === "fr" ? "Propulsé par l'IA" : "Powered by AI"}
                    </div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "text-right" : ""}>
                    {m.role === "user" ? (
                      <span className="inline-block max-w-[80%] px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-sm">
                        {m.text}
                      </span>
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground/90">{m.text}</p>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="p-4 border-t border-border flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={locale === "fr" ? "Posez votre question..." : "Ask the stylist..."}
                  className="flex-1 bg-muted rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                />
                <button type="submit" className="w-11 h-11 rounded-full bg-gradient-luxury text-gold-foreground flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
