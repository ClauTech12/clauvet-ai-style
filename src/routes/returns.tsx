import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns — Clauvèra" }], links: [{ rel: "canonical", href: "/returns" }] }),
  component: ReturnsPage,
});

function ReturnsPage() {
  const { t } = useI18n();
  const p = t.pages.returns;
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">{p.title}</h1>
      <p className="mt-6 text-muted-foreground">{p.p1}</p>
      <p className="mt-4 text-muted-foreground">{p.p2}</p>
      <p className="mt-4 text-sm text-muted-foreground">{p.p3}</p>
    </div>
  );
}
