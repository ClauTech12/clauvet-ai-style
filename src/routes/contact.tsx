import { createFileRoute } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/whatsapp";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact — Clauvèra" }, { name: "description", content: "Reach Clauvèra concierge by WhatsApp or email." }],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-3xl">
      <h1 className="font-display text-5xl md:text-7xl">Contact</h1>
      <p className="mt-6 text-lg text-muted-foreground">Our concierge is at your service.</p>
      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        <a href={whatsappLink("Hi Clauvèra concierge,")} target="_blank" rel="noopener noreferrer" className="bg-card border border-border rounded-sm p-6 hover:border-foreground transition">
          <MessageCircle className="w-5 h-5 text-gold" />
          <p className="mt-3 text-xs uppercase tracking-luxury">WhatsApp</p>
          <p className="mt-1 text-sm text-muted-foreground">Instant reply</p>
        </a>
        <a href="mailto:concierge@clauvera.com" className="bg-card border border-border rounded-sm p-6 hover:border-foreground transition">
          <Mail className="w-5 h-5 text-gold" />
          <p className="mt-3 text-xs uppercase tracking-luxury">Email</p>
          <p className="mt-1 text-sm text-muted-foreground">concierge@clauvera.com</p>
        </a>
        <div className="bg-card border border-border rounded-sm p-6">
          <MapPin className="w-5 h-5 text-gold" />
          <p className="mt-3 text-xs uppercase tracking-luxury">Atelier</p>
          <p className="mt-1 text-sm text-muted-foreground">Paris · Milano · NYC</p>
        </div>
      </div>
    </div>
  );
}
