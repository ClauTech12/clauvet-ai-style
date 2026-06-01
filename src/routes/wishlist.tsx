import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWishlist } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/I18nProvider";
import { ProductCard } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Clauvèra" }], links: [{ rel: "canonical", href: "/wishlist" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { data: items = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: () => fetchWishlist(user!.id),
    enabled: !!user,
  });

  if (loading) return <div className="container mx-auto px-6 py-20">{t.common.loading}</div>;
  if (!user) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-4xl">{t.wishlist.title}</h1>
        <Link to="/login" className="mt-6 inline-flex bg-primary text-primary-foreground px-8 h-12 items-center rounded-sm text-xs uppercase tracking-luxury">{t.auth.signIn}</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-6xl">{t.wishlist.title}</h1>
      {items.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t.wishlist.empty}</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((i, idx) => <ProductCard key={i.id} product={i.product} index={idx} />)}
        </div>
      )}
    </div>
  );
}
