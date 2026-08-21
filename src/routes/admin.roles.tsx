import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/use-admin-role";
import { useI18n } from "@/i18n/I18nProvider";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({ meta: [{ title: "Roles & Staff — Admin — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: AdminRolesPage,
});

const ROLES = ["customer", "admin", "super_admin"] as const;

function AdminRolesPage() {
  const { t } = useI18n();
  const { user, loading, isSuperAdmin } = useAdminRole();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // The layout already confirmed the user is at least staff (admin or
  // super_admin) before rendering this page. This page needs the STRICTER
  // check: staff-but-not-super-admin must still be turned away, since role
  // assignment is the one thing a regular admin must never touch.
  // Important: only redirect once loading has actually finished — isSuperAdmin
  // is transiently false while the role query is still in flight, and firing
  // on that would incorrectly bounce a real Super Admin before their role loads.
  useEffect(() => {
    if (!loading && !isSuperAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, isSuperAdmin, navigate]);

  const { data: staff = [] } = useQuery({
    queryKey: ["staffList"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id, role, profiles(full_name, email)")
        .in("role", ["admin", "super_admin"]);
      return data ?? [];
    },
    enabled: isSuperAdmin,
  });

  async function runSearch() {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("profiles").select("id, full_name, email").ilike("email", `%${search.trim()}%`).limit(10);
    setResults(data ?? []);
    setSearching(false);
  }

  async function setRole(userId: string, role: string) {
    const validRole = role as "admin" | "super_admin" | "customer";
    await supabase.from("user_roles").delete().eq("user_id", userId).in("role", ["admin", "super_admin"]);
    if (validRole !== "customer") {
      await supabase.from("user_roles").insert({ user_id: userId, role: validRole });
    }
    qc.invalidateQueries({ queryKey: ["staffList"] });
    setResults([]);
    setSearch("");
  }

  if (loading || !isSuperAdmin) return null; // still loading, or redirecting

  return (
    <>
      <h2 className="font-display text-2xl mb-2">{t.admin.roles}</h2>
      <p className="text-sm text-muted-foreground mb-8">{t.admin.superAdminOnly}</p>

      <div className="mb-10">
        <label className="text-xs uppercase tracking-luxury text-muted-foreground">{t.admin.userEmail}</label>
        <div className="mt-1 flex gap-2 max-w-md">
          <input
            value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()}
            placeholder="name@example.com"
            className="flex-1 h-11 px-3 bg-transparent border border-border rounded-sm text-sm"
          />
          <button onClick={runSearch} disabled={searching} className="h-11 px-4 border border-border rounded-sm hover:border-gold hover:text-gold transition"><Search className="w-4 h-4" /></button>
        </div>
        {results.length > 0 && (
          <div className="mt-3 border border-border rounded-sm divide-y divide-border max-w-md">
            {results.map(r => (
              <div key={r.id} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <p>{r.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </div>
                <select onChange={e => setRole(r.id, e.target.value)} defaultValue="" className="h-9 px-2 bg-transparent border border-border rounded-sm text-xs">
                  <option value="" disabled>{t.admin.assignRole}</option>
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 className="font-display text-xl mb-4">{t.admin.staff}</h3>
      <div className="divide-y divide-border border-y border-border max-w-2xl">
        {staff.map((s: any) => (
          <div key={s.user_id} className="py-3 flex items-center justify-between text-sm">
            <div>
              <p>{s.profiles?.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] uppercase tracking-luxury px-2 py-1 rounded-sm border ${s.role === "super_admin" ? "border-gold text-gold" : "border-border text-muted-foreground"}`}>
                {s.role}
              </span>
              {s.user_id !== user?.id && (
                <select onChange={e => setRole(s.user_id, e.target.value)} defaultValue="" className="h-9 px-2 bg-transparent border border-border rounded-sm text-xs">
                  <option value="" disabled>{t.admin.assignRole}</option>
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
