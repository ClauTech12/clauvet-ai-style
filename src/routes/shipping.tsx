import { createFileRoute } from "@tanstack/react-router";

const zones = [
  { place: "Buea", time: "Within 5 hours" },
  { place: "Limbe", time: "Within 10 hours" },
  { place: "Mamfe", time: "Within 10 hours" },
  { place: "Kumba", time: "Within 12 hours" },
  { place: "Douala", time: "Within 12 hours" },
];

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping — Clauvèra" }], links: [{ rel: "canonical", href: "/shipping" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">Shipping</h1>
      <p className="mt-6 text-muted-foreground">
        We deliver from Buea across the Southwest and to Douala. Once your order is confirmed on WhatsApp, here's roughly how long delivery takes:
      </p>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {zones.map((z) => (
          <div key={z.place} className="flex items-center justify-between py-4">
            <span className="font-display text-lg">{z.place}</span>
            <span className="text-sm text-muted-foreground">{z.time}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Delivery fees depend on your location and are confirmed with you on WhatsApp before your order is finalized. Don't see your town listed? Message us and we'll let you know if we can reach you.
      </p>
    </div>
  ),
});

