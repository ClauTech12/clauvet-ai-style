import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/translations";

const GOLD = "#b8955b";

function TownTooltip({ active, payload, locale }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-card border border-border px-3 py-2 text-xs rounded-sm">
      <p className="font-medium mb-1">{row.town}</p>
      <p className="text-muted-foreground">Revenue: {formatPrice(row.revenue, locale)}</p>
      <p className="text-muted-foreground">Orders: {row.orders}</p>
    </div>
  );
}

export function OrdersByTownChart({ locale }: { locale: Locale }) {
  const { data: rows = [] } = useQuery({
    queryKey: ["adminOrdersByTown"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("shipping_address, total, status");

      const byTown = new Map<string, { revenue: number; orders: number }>();
      for (const o of data ?? []) {
        if (o.status === "cancelled") continue;
        const town = (o.shipping_address as any)?.town || "Unknown";
        const entry = byTown.get(town) ?? { revenue: 0, orders: 0 };
        entry.revenue += Number(o.total);
        entry.orders += 1;
        byTown.set(town, entry);
      }

      return Array.from(byTown.entries())
        .map(([town, v]) => ({ town, ...v }))
        .sort((a, b) => b.revenue - a.revenue);
    },
  });

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-4">Orders by Town</p>
      <div className="h-64">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground flex items-center justify-center h-full">No orders yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="town" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={50} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <Tooltip content={<TownTooltip locale={locale} />} />
              <Bar dataKey="revenue" fill={GOLD} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
