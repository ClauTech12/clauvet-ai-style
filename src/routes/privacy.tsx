import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Clauvèra" }], links: [{ rel: "canonical", href: "/privacy" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl prose dark:prose-invert">
      <h1 className="font-display text-5xl">Privacy</h1>
      <p className="mt-6 text-muted-foreground">Clauvèra collects only the data needed to deliver an exceptional service. We never sell your data. Read more by contacting our concierge.</p>
    </div>
  ),
});
