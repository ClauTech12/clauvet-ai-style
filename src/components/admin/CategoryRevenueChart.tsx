import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/translations";

const GOLD = "#b8955b";

export function CategoryRevenueChart({ locale }: { locale: Locale }) {
  const { data: rows = [] } = useQuery({
    queryKey: ["adminCategoryRevenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("quantity, price, orders!inner(status), products(category_id, categories(name_en))");

      const totals = new Map<string, number>();
      for (const item of (data ?? []) as any[]) {
        if (item.orders?.status === "cancelled") continue;
        const categoryName = item.products?.categories?.name_en ?? "Uncategorized";
        const revenue = Number(item.price) * item.quantity;
        totals.set(categoryName, (totals.get(categoryName) ?? 0) + revenue);
      }

      return Array.from(totals.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);
    },
  });

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-4">Revenue by Category</p>
      <div className="h-64">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground flex items-center justify-center h-full">No sales yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={50} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <Tooltip
                formatter={(value: number) => [formatPrice(value, locale), "Revenue"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Bar dataKey="total" fill={GOLD} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
