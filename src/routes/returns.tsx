import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns — Clauvèra" }], links: [{ rel: "canonical", href: "/returns" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">Returns</h1>
      <p className="mt-6 text-muted-foreground">Free returns within 30 days on unworn items in original packaging. Refunds processed within 7 days.</p>
    </div>
  ),
});
