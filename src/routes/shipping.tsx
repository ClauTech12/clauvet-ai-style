import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";
import { DELIVERY_ZONES, formatDeliveryTime } from "@/lib/delivery";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping — Clauvèra" }], links: [{ rel: "canonical", href: "/shipping" }] }),
  component: ShippingPage,
});

function ShippingPage() {
  const { t, locale } = useI18n();
  return (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">{t.pages.shipping.title}</h1>
      <p className="mt-6 text-muted-foreground">{t.pages.shipping.intro}</p>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {DELIVERY_ZONES.map((z) => (
          <div key={z.place} className="flex items-center justify-between py-4">
            <span className="font-display text-lg">{z.place}</span>
            <span className="text-sm text-muted-foreground">{formatDeliveryTime(z.hours, locale)}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{t.pages.shipping.outro}</p>
    </div>
  );
}
