import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminRole } from "@/hooks/use-admin-role";
import { useI18n } from "@/i18n/I18nProvider";
import { AdminNav } from "@/components/admin/AdminNav";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

// Shared shell for every /admin/* page: does the staff auth check ONCE here
// (rather than duplicated in every child page), renders the heading + nav
// once, then lets the matched child route render into <Outlet />.
function AdminLayout() {
  const { t } = useI18n();
  const { user, loading, isStaff, isSuperAdmin } = useAdminRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
    if (!loading && user && !isStaff) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, isStaff, navigate]);

  if (loading || !isStaff) return <div className="container mx-auto px-6 py-20">{t.common.loading}</div>;

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-6xl">{t.admin.title}</h1>
      <AdminNav isSuperAdmin={isSuperAdmin} />
      <Outlet />
    </div>
  );
}
