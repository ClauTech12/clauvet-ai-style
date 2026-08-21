import { Link, useLocation } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

export function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { t } = useI18n();
  const location = useLocation();

  const links = [
    { to: "/admin", label: t.admin.overview, exact: true },
    { to: "/admin/products", label: t.admin.products },
    { to: "/admin/orders", label: t.admin.orders },
    { to: "/admin/customers", label: t.admin.customers },
  ];
  if (isSuperAdmin) links.push({ to: "/admin/roles", label: t.admin.roles });

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border mb-10 -mx-1">
      {links.map(l => {
        const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
        return (
          <Link
            key={l.to}
            to={l.to}
            className={`px-4 py-3 text-xs uppercase tracking-luxury border-b-2 transition ${
              active ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
