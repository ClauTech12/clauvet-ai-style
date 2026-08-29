import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Clauvèra" }], links: [{ rel: "canonical", href: "/privacy" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();
  const p = t.pages.privacy;
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl prose dark:prose-invert">
      <h1 className="font-display text-5xl">{p.title}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>{p.p1}</p>
        <p>{p.p2}</p>
        <p>{p.p3}</p>
      </div>
    </div>
  );
}
