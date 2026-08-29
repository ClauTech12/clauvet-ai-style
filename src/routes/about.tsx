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
  const { t } = useI18n();
  const p = t.pages.about;
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-3xl">
      <p className="text-xs uppercase tracking-luxury text-gold">{p.eyebrow}</p>
      <h1 className="font-display text-5xl md:text-7xl mt-4">{p.title}</h1>
      <div className="mt-10 space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>{p.p1}</p>
        <p>{p.p2}</p>
      </div>
    </div>
  );
}
