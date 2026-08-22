export const DELIVERY_ZONES = [
  { place: "Buea", time: "Within 5 hours" },
  { place: "Limbe", time: "Within 10 hours" },
  { place: "Mamfe", time: "Within 10 hours" },
  { place: "Kumba", time: "Within 12 hours" },
  { place: "Douala", time: "Within 12 hours" },
] as const;

export const DELIVERY_TOWNS = DELIVERY_ZONES.map(z => z.place);
