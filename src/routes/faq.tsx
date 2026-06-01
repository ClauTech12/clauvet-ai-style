import { createFileRoute } from "@tanstack/react-router";

const faqs = [
  { q: "Are all Clauvèra pieces authentic?", a: "Every item is sourced directly from the maison or authorized partners and authenticated by our atelier team." },
  { q: "How long does shipping take?", a: "Most orders are dispatched within 24h. Worldwide express delivery in 2–5 business days." },
  { q: "What is your return policy?", a: "Free returns within 30 days on unworn items in original packaging." },
  { q: "How does the AI stylist work?", a: "Tell it the occasion, mood, or piece you love — it curates a complete look from our catalogue in seconds." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [{ title: "FAQ — Clauvèra" }],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }),
    }],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl md:text-7xl">FAQ</h1>
      <div className="mt-12 divide-y divide-border border-y border-border">
        {faqs.map((f, i) => (
          <details key={i} className="py-6 group">
            <summary className="cursor-pointer font-display text-xl">{f.q}</summary>
            <p className="mt-3 text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
