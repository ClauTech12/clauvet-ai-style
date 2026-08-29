import type { Locale } from "@/i18n/translations";

export const DELIVERY_ZONES = [
  { place: "Buea", hours: 5 },
  { place: "Limbe", hours: 10 },
  { place: "Mamfe", hours: 10 },
  { place: "Kumba", hours: 12 },
  { place: "Douala", hours: 12 },
] as const;

export const DELIVERY_TOWNS = DELIVERY_ZONES.map(z => z.place);

export function formatDeliveryTime(hours: number | undefined, locale: Locale): string {
  if (hours == null) return "";
  if (locale === "fr") return `Sous ${hours} heures`;
  return `Within ${hours} hours`;
}
