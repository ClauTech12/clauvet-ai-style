import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Clauvèra" },
      { name: "description", content: "Clauvèra blends luxury fashion with AI to redefine how the world dresses." },
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
        {locale === "fr" ? "Une maison propulsée par l'intelligence." : "A house powered by intelligence."}
      </h1>
      <div className="mt-10 space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>{locale === "fr"
          ? "Clauvèra réunit le savoir-faire du luxe et l'intelligence artificielle pour composer une garde-robe taillée pour vous."
          : "Clauvèra unites luxury craftsmanship with artificial intelligence to compose a wardrobe tailored for you."}</p>
        <p>{locale === "fr"
          ? "De la haute couture aux essentiels modernes, chaque pièce est sélectionnée par notre styliste IA et les artisans de notre atelier."
          : "From couture to modern essentials, each piece is selected by our AI stylist and the artisans of our atelier."}</p>
      </div>
    </div>
  );
}
