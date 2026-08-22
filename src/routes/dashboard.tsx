import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAdminRole } from "@/hooks/use-admin-role";
import { useI18n, formatPrice } from "@/i18n/I18nProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { generateReceiptPdf } from "@/lib/receipt";
import { LogOut, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clauvèra" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const { isStaff: isAdmin } = useAdminRole();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !user) navigate({ to: "/login", replace: true }); }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!user) return null;

  const logout = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  async function downloadReceipt(order: any) {
    setDownloadingId(order.id);
    try {
      const { data: orderItems } = await supabase.from("order_items").select("*").eq("order_id", order.id);
      generateReceiptPdf(order, orderItems ?? [], locale);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-luxury text-muted-foreground">{t.dashboard.welcome}</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2">{profile?.full_name ?? user.email}</h1>
        </div>
        <button onClick={logout} className="text-xs uppercase tracking-luxury flex items-center gap-2 hover:text-gold transition">
          <LogOut className="w-4 h-4" /> {t.nav.logout}
        </button>
      </header>

      <div className="mt-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl mb-4">{t.dashboard.orders}</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground py-10">{t.dashboard.noOrders}</p>
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {orders.map((o: any) => (
                <div key={o.id} className="py-5 flex items-center justify-between text-sm gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">#{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-luxury mt-1">{o.status}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p>{formatPrice(Number(o.total), locale, o.currency)}</p>
                    <button
                      onClick={() => downloadReceipt(o)}
                      disabled={downloadingId === o.id}
                      className="flex items-center gap-1.5 text-xs uppercase tracking-luxury border border-border px-3 h-9 rounded-sm hover:border-gold hover:text-gold transition disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.dashboard.downloadReceipt}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-card border border-border rounded-sm p-6 h-fit">
          <h2 className="font-display text-2xl">{t.dashboard.preferences}</h2>
          <div className="mt-6 space-y-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-2">{t.dashboard.language}</p>
              <div className="flex gap-2">
                <button onClick={() => setLocale("en")} className={`h-10 px-4 border rounded-sm text-xs uppercase tracking-luxury ${locale === "en" ? "border-gold text-gold" : "border-border"}`}>EN</button>
                <button onClick={() => setLocale("fr")} className={`h-10 px-4 border rounded-sm text-xs uppercase tracking-luxury ${locale === "fr" ? "border-gold text-gold" : "border-border"}`}>FR</button>
                <button onClick={() => setLocale("pcm")} className={`h-10 px-4 border rounded-sm text-xs uppercase tracking-luxury ${locale === "pcm" ? "border-gold text-gold" : "border-border"}`}>PCM</button>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-2">{t.dashboard.theme}</p>
              <div className="flex gap-2">
                <button onClick={() => setTheme("light")} className={`h-10 px-4 border rounded-sm text-xs uppercase tracking-luxury ${theme === "light" ? "border-gold text-gold" : "border-border"}`}>Light</button>
                <button onClick={() => setTheme("dark")} className={`h-10 px-4 border rounded-sm text-xs uppercase tracking-luxury ${theme === "dark" ? "border-gold text-gold" : "border-border"}`}>Dark</button>
              </div>
            </div>
            {isAdmin && (
              <Link to="/admin" className="block mt-6 text-center bg-gradient-luxury text-gold-foreground h-11 leading-[2.75rem] rounded-sm text-xs uppercase tracking-luxury">
                {t.nav.admin}
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
