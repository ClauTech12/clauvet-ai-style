import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function OrdersHeatmap() {
  const { data: grid = [] } = useQuery({
    queryKey: ["adminOrdersHeatmap"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("created_at");
      const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
      for (const o of data ?? []) {
        const d = new Date(o.created_at as string);
        counts[d.getDay()][d.getHours()] += 1;
      }
      return counts;
    },
  });

  const max = Math.max(1, ...grid.flat());

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-4">When Customers Order (by day & hour)</p>
      {grid.length === 0 || grid.flat().every(c => c === 0) ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-0.5">
              <div className="w-9 shrink-0" />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="w-4 shrink-0 text-center text-[9px] text-muted-foreground">
                  {h % 6 === 0 ? h : ""}
                </div>
              ))}
            </div>
            {grid.map((row, day) => (
              <div key={day} className="flex gap-0.5 mt-0.5">
                <div className="w-9 shrink-0 text-[10px] text-muted-foreground flex items-center">{DAY_LABELS[day]}</div>
                {row.map((count, hour) => {
                  const intensity = count / max;
                  return (
                    <div
                      key={hour}
                      title={`${DAY_LABELS[day]} ${hour}:00 — ${count} order${count === 1 ? "" : "s"}`}
                      className="w-4 h-4 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: count === 0 ? "var(--border)" : `rgba(184, 149, 91, ${0.15 + intensity * 0.85})`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
