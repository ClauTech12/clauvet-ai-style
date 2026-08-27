import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/translations";

const DAYS_BACK = 30;
const GOLD = "#b8955b";

function buildDayBuckets() {
  const buckets: { date: string; label: string; total: number }[] = [];
  for (let i = DAYS_BACK - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    buckets.push({ date, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), total: 0 });
  }
  return buckets;
}

export function RevenueTrendChart({ locale }: { locale: Locale }) {
  const { data: points = [] } = useQuery({
    queryKey: ["adminRevenueTrend"],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - DAYS_BACK);
      const { data } = await supabase
        .from("orders")
        .select("created_at, total, status")
        .gte("created_at", since.toISOString())
        .neq("status", "cancelled");

      const buckets = buildDayBuckets();
      const byDate = new Map(buckets.map(b => [b.date, b]));
      for (const o of data ?? []) {
        const date = String(o.created_at).slice(0, 10);
        const bucket = byDate.get(date);
        if (bucket) bucket.total += Number(o.total);
      }
      return buckets;
    },
  });

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-4">Revenue — last 30 days</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={Math.ceil(DAYS_BACK / 8)} />
            <YAxis tick={{ fontSize: 11 }} width={50} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
            <Tooltip
              formatter={(value: number) => [formatPrice(value, locale), "Revenue"]}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
            />
            <Line type="monotone" dataKey="total" stroke={GOLD} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
