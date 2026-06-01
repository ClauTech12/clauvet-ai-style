import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, formatPrice } from "@/i18n/I18nProvider";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
    if (!roleLoading && user && isAdmin === false) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, isAdmin, roleLoading, navigate]);

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);
      const totalSales = (orders.data ?? []).reduce((s: number, o: any) => s + Number(o.total), 0);
      return {
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        sales: totalSales,
      };
    },
    enabled: !!isAdmin,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
    enabled: !!isAdmin,
  });

  if (!isAdmin) return <div className="container mx-auto px-6 py-20">{t.common.loading}</div>;

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-6xl">{t.admin.title}</h1>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: t.admin.totalSales, value: formatPrice(stats?.sales ?? 0, locale) },
          { icon: ShoppingBag, label: t.admin.totalOrders, value: stats?.orders ?? 0 },
          { icon: Package, label: t.admin.totalProducts, value: stats?.products ?? 0 },
          { icon: Users, label: t.admin.totalCustomers, value: "—" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-sm p-6">
            <s.icon className="w-5 h-5 text-gold" />
            <p className="mt-4 text-xs uppercase tracking-luxury text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

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
                  <p className="text-xs uppercase tracking-luxury text-muted-foreground mt-1">{o.status}</p>
                </div>
                <p>{formatPrice(Number(o.total), locale, o.currency)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
