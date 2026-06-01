import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping — Clauvèra" }], links: [{ rel: "canonical", href: "/shipping" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">Shipping</h1>
      <p className="mt-6 text-muted-foreground">Complimentary express delivery worldwide on orders above €500. Standard delivery 2–5 business days.</p>
    </div>
  ),
});
