import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, formatPrice } from "@/i18n/I18nProvider";
import { Package, ShoppingBag, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart";
import { CategoryRevenueChart } from "@/components/admin/CategoryRevenueChart";
import { OrderStatusChart } from "@/components/admin/OrderStatusChart";
import { OrdersHeatmap } from "@/components/admin/OrdersHeatmap";
import { OrdersByTownChart } from "@/components/admin/OrdersByTownChart";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: AdminOverview,
});

const LOW_STOCK_THRESHOLD = 5;

function AdminOverview() {
  const { t, locale } = useI18n();

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [products, orders, customers] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const totalSales = (orders.data ?? []).reduce((s: number, o: any) => s + Number(o.total), 0);
      return {
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        sales: totalSales,
        customers: customers.count ?? 0,
      };
    },
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["adminOrders", "recent"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ["adminLowStock"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, slug, name_en, stock").lte("stock", LOW_STOCK_THRESHOLD).order("stock");
      return data ?? [];
    },
  });

  const statusLabel = (s: string) => (t.admin as any)[`orderStatus_${s}`] ?? s;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: t.admin.totalSales, value: formatPrice(stats?.sales ?? 0, locale) },
          { icon: ShoppingBag, label: t.admin.totalOrders, value: stats?.orders ?? 0 },
          { icon: Package, label: t.admin.totalProducts, value: stats?.products ?? 0 },
          { icon: Users, label: t.admin.totalCustomers, value: stats?.customers ?? 0 },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-sm p-6">
            <s.icon className="w-5 h-5 text-gold" />
            <p className="mt-4 text-xs uppercase tracking-luxury text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <section className="mt-10 bg-card border border-destructive/40 rounded-sm p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-luxury">Low Stock</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStock.map((p: any) => (
              <Link key={p.id} to="/admin/products" className="text-xs px-3 py-1.5 border border-border rounded-sm hover:border-destructive hover:text-destructive transition">
                {p.name_en} — {p.stock === 0 ? t.admin.outOfStock : `${p.stock} left`}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 grid md:grid-cols-2 gap-6">
        <RevenueTrendChart locale={locale} />
        <CategoryRevenueChart locale={locale} />
        <OrderStatusChart statusLabel={statusLabel} />
        <OrdersHeatmap />
      </section>

      <section className="mt-6">
        <OrdersByTownChart locale={locale} />
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl mb-4">{t.admin.orders}</h2>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground py-10">{t.dashboard.noOrders}</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {recentOrders.map((o: any) => (
              <div key={o.id} className="py-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs uppercase tracking-luxury text-muted-foreground mt-1">{statusLabel(o.status)}</p>
                </div>
                <p className="font-mono">{formatPrice(Number(o.total), locale, o.currency)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
