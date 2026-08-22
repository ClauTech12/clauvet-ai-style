import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, formatPrice } from "@/i18n/I18nProvider";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrdersPage,
});

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

function AdminOrdersPage() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: items = {} } = useQuery({
    queryKey: ["adminOrderItems", expanded],
    queryFn: async () => {
      if (!expanded) return {};
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", expanded);
      if (error) console.error("Failed to fetch order items:", error);
      return { [expanded]: data ?? [] };
    },
    enabled: !!expanded,
  });

  async function updateStatus(orderId: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    qc.invalidateQueries({ queryKey: ["adminOrders"] });
  }

  async function downloadReceipt(order: any) {
    const { generateReceiptPdf } = await import("@/lib/receipt");
    await generateReceiptPdf(order, items[order.id] ?? [], locale);
  }

  const statusLabel = (s: string) => (t.admin as any)[`orderStatus_${s}`] ?? s;
  const statusColor = (s: string) =>
    s === "delivered" ? "text-gold border-gold" :
    s === "cancelled" ? "text-destructive border-destructive" :
    "text-muted-foreground border-border";

  return (
    <>
      <h2 className="font-display text-2xl mb-6">{t.admin.orders}</h2>

      {isLoading ? (
        <p className="text-muted-foreground py-10">{t.common.loading}</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground py-10">{t.dashboard.noOrders}</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {orders.map((o: any) => (
            <div key={o.id}>
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="w-full py-4 flex items-center justify-between text-sm text-left"
              >
                <div className="flex items-center gap-4">
                  {expanded === o.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <div>
                    <p className="font-medium">#{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[11px] uppercase tracking-luxury px-2 py-1 rounded-sm border ${statusColor(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>
                  <span className="font-mono">{formatPrice(Number(o.total), locale, o.currency)}</span>
                </div>
              </button>
              {expanded === o.id && (
                <div className="pb-4 pl-8">
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-2">{t.admin.customerDelivery}</p>
                    {o.shipping_address?.full_name || o.shipping_address?.phone || o.shipping_address?.town ? (
                      <div className="text-sm space-y-0.5">
                        {o.shipping_address?.full_name && <p>{o.shipping_address.full_name}</p>}
                        {o.shipping_address?.phone && <p className="text-muted-foreground">{o.shipping_address.phone}</p>}
                        {o.shipping_address?.town && (
                          <p className="text-muted-foreground">
                            {o.shipping_address.town}
                            {o.shipping_address.address && ` — ${o.shipping_address.address}`}
                          </p>
                        )}
                        {o.shipping_address?.notes && <p className="text-muted-foreground italic">"{o.shipping_address.notes}"</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.admin.noAddress}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-xs uppercase tracking-luxury text-muted-foreground mr-2">{t.admin.updateStatus}:</span>
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(o.id, s)}
                        className={`text-[11px] uppercase tracking-luxury px-2 py-1 rounded-sm border transition ${
                          o.status === s ? "border-gold text-gold" : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {(items[o.id] ?? []).map((it: any) => (
                      <div key={it.id} className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{it.product_name} {it.size && `· ${it.size}`} {it.color && `· ${it.color}`} × {it.quantity}</span>
                        <span className="font-mono">{formatPrice(Number(it.price) * it.quantity, locale, o.currency)}</span>
                      </div>
                    ))}
                  </div>
                  {o.notes && <p className="mt-3 text-sm text-muted-foreground">{o.notes}</p>}
                  <button
                    onClick={() => downloadReceipt(o)}
                    className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-luxury border border-border px-4 h-10 rounded-sm hover:border-gold hover:text-gold transition"
                  >
                    <Download className="w-3.5 h-3.5" /> {t.admin.downloadReceipt}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
