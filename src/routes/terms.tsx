import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — Clauvèra" }], links: [{ rel: "canonical", href: "/terms" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">Terms</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>By placing an order with Clauvèra, you agree to the following: prices are listed in FCFA (XAF) and are confirmed with you on WhatsApp before your order is finalized. Payment is by Mobile Money or cash on delivery.</p>
        <p>Delivery timeframes given on our <a href="/shipping" className="underline hover:text-gold">Shipping</a> page are estimates, not guarantees, and can be affected by circumstances outside our control.</p>
        <p>Our return policy is described on our <a href="/returns" className="underline hover:text-gold">Returns</a> page. Product images are as accurate as we can make them, but colours may vary slightly depending on your screen.</p>
        <p>Have a question about an order or these terms? Message us on WhatsApp and we'll help.</p>
      </div>
    </div>
  ),
});

