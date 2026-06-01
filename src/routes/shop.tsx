import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { fetchCategories, fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { useI18n } from "@/i18n/I18nProvider";
import { Skeleton } from "@/components/ui/skeleton";

const search = z.object({
  category: z.string().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop — Clauvèra" },
      { name: "description", content: "Shop curated luxury fashion at Clauvèra: ready-to-wear, shoes, accessories and couture." },
      { property: "og:title", content: "Shop — Clauvèra" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { t, locale } = useI18n();
  const params = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts({ categorySlug: params.category, sort: params.sort, q: params.q }),
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs uppercase tracking-luxury text-muted-foreground">{t.nav.shop}</p>
          <h1 className="font-display text-4xl md:text-6xl mt-2">
            {params.category
              ? (locale === "fr"
                  ? categories.find(c => c.slug === params.category)?.name_fr
                  : categories.find(c => c.slug === params.category)?.name_en) ?? t.shop.title
              : t.shop.title}
          </h1>
          {params.q && <p className="mt-2 text-muted-foreground">"{params.q}"</p>}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <select
            value={params.category ?? ""}
            onChange={(e) => navigate({ search: { ...params, category: e.target.value || undefined } })}
            className="bg-transparent border border-border rounded-sm px-3 h-10 uppercase tracking-luxury"
          >
            <option value="">{t.shop.allCategories}</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{locale === "fr" ? c.name_fr : c.name_en}</option>)}
          </select>
          <select
            value={params.sort ?? "newest"}
            onChange={(e) => navigate({ search: { ...params, sort: e.target.value as never } })}
            className="bg-transparent border border-border rounded-sm px-3 h-10 uppercase tracking-luxury"
          >
            <option value="newest">{t.shop.newest}</option>
            <option value="price-asc">{t.shop.priceLow}</option>
            <option value="price-desc">{t.shop.priceHigh}</option>
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
        </div>
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t.shop.noResults}</p>
      ) : (
        <>
          <p className="text-xs uppercase tracking-luxury text-muted-foreground mb-5">{products.length} {t.shop.results}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </>
      )}
    </div>
  );
}
