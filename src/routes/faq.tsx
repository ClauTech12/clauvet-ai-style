import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";
import { translations } from "@/i18n/translations";

const enFaq = translations.en.pages.faq;
const structuredFaqs = [
  { q: enFaq.q1, a: enFaq.a1 },
  { q: enFaq.q2, a: enFaq.a2 },
  { q: enFaq.q3, a: enFaq.a3 },
  { q: enFaq.q4, a: enFaq.a4 },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [{ title: "FAQ — Clauvèra" }],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: structuredFaqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }),
    }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useI18n();
  const p = t.pages.faq;
  const faqs = [
    { q: p.q1, a: p.a1 },
    { q: p.q2, a: p.a2 },
    { q: p.q3, a: p.a3 },
    { q: p.q4, a: p.a4 },
  ];
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">{p.title}</h1>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {faqs.map((item, i) => (
          <div key={i} className="py-6">
            <p className="font-medium">{item.q}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
