import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const STATUS_COLORS: Record<string, string> = {
  pending: "#8a8a8f",
  paid: "#b8955b",
  shipped: "#6b8fb8",
  delivered: "#5a9b6f",
  cancelled: "#a5514a",
};

export function OrderStatusChart({ statusLabel }: { statusLabel: (s: string) => string }) {
  const { data: rows = [] } = useQuery({
    queryKey: ["adminOrderStatusBreakdown"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("status");
      const counts = new Map<string, number>();
      for (const o of data ?? []) {
        counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
      }
      return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
    },
  });

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-4">Order Status</p>
      <div className="h-64">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground flex items-center justify-center h-full">No orders yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {rows.map((r) => (
                  <Cell key={r.status} fill={STATUS_COLORS[r.status] ?? "#8a8a8f"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name: string, entry: any) => [value, statusLabel(entry.payload.status)]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Legend
                formatter={(value: string) => statusLabel(value)}
                wrapperStyle={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
