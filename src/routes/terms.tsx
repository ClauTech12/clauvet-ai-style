import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — Clauvèra" }], links: [{ rel: "canonical", href: "/terms" }] }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();
  const p = t.pages.terms;
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">{p.title}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>{p.p1}</p>
        <p>
          {p.p2}{" "}
          <a href="/shipping" className="underline hover:text-gold">→ {p.shippingLink}</a>
        </p>
        <p>
          {p.p3}{" "}
          <a href="/returns" className="underline hover:text-gold">→ {p.returnsLink}</a>
        </p>
        <p>{p.p4}</p>
      </div>
    </div>
  );
}
