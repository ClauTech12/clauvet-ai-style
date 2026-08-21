import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Clauvèra" },
      { name: "description", content: "Clauvèra is a luxury fashion house at 870m above sea level in Buea, Cameroon — curated pieces, styled by real people." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { locale } = useI18n();
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-3xl">
      <p className="text-xs uppercase tracking-luxury text-gold">Clauvèra</p>
      <h1 className="font-display text-5xl md:text-7xl mt-4">
        {locale === "fr" ? "Une maison élevée, enracinée au Cameroun." : "A house elevated, rooted in Cameroon."}
      </h1>
      <div className="mt-10 space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>{locale === "fr"
          ? "Clauvèra est née à Buea, 870m au-dessus du niveau de la mer, avec une idée simple : le luxe ne doit pas venir d'ailleurs pour compter ici."
          : "Clauvèra was born in Buea, 870m above sea level, on a simple idea: luxury doesn't have to come from elsewhere to matter here."}</p>
        <p>{locale === "fr"
          ? "Chaque pièce est sélectionnée par notre équipe, et chaque commande est confirmée directement avec vous — sur WhatsApp, par une vraie personne, à chaque fois."
          : "Every piece is hand-selected by our team, and every order is confirmed directly with you — over WhatsApp, by a real person, every time."}</p>
      </div>
    </div>
  );
}

