import { createFileRoute } from "@tanstack/react-router";

const faqs = [
  { q: "Are all Clauvèra pieces authentic?", a: "Every item is sourced directly from our suppliers or authorized partners and checked by our team before it's listed." },
  { q: "How long does shipping take?", a: "Buea: within 5 hours. Limbe and Mamfe: within 10 hours. Kumba and Douala: within 12 hours. Delivery fees are confirmed with you on WhatsApp." },
  { q: "What is your return policy?", a: "If an item arrives defective or you received the wrong item, message us on WhatsApp within 48 hours for a free replacement or refund. Outside of that, all sales are final." },
  { q: "How do I pay?", a: "You confirm your order and payment directly with us on WhatsApp — Mobile Money or cash on delivery. A real person replies, every time." },
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
