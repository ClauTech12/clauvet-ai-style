import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const { t } = useI18n();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <h2 className="font-display text-2xl mb-6">{t.admin.customers}</h2>

      {isLoading ? (
        <p className="text-muted-foreground py-10">{t.common.loading}</p>
      ) : customers.length === 0 ? (
        <p className="text-muted-foreground py-10">{t.admin.noCustomers}</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {customers.map((c: any) => (
            <div key={c.id} className="py-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{c.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.email || "—"}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{c.phone || "—"}</p>
                <p className="mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
