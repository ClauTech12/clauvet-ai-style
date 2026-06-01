import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — Clauvèra" }], links: [{ rel: "canonical", href: "/terms" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">Terms</h1>
      <p className="mt-6 text-muted-foreground">By using Clauvèra you agree to our standard luxury commerce terms. Full text available on request.</p>
    </div>
  ),
});
