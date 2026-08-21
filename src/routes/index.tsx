import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { fetchCategories, fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clauvèra — Elevated Fashion, Rooted in Cameroon" },
      { name: "description", content: "Clauvèra is a luxury fashion house at 870m above sea level in Buea — discover curated couture, runway pieces and timeless essentials, delivered across Cameroon." },
      { property: "og:title", content: "Clauvèra — Elevated Fashion, Rooted in Cameroon" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, locale } = useI18n();
  const { data: featured = [] } = useQuery({ queryKey: ["products", "featured"], queryFn: () => fetchProducts({ featured: true, limit: 8 }) });
  const { data: newArrivals = [] } = useQuery({ queryKey: ["products", "new"], queryFn: () => fetchProducts({ sort: "newest", limit: 4 }) });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        </div>
        <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-20 md:pb-28 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <span className="altitude-rule h-8" />
            <span className="eyebrow-altitude">{t.home.heroEyebrow}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1, ease: [0.16,1,0.3,1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mt-4 max-w-4xl text-balance"
          >
            {t.home.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-xl text-base md:text-lg opacity-90"
          >
            {t.home.heroSub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link to="/shop" className="group inline-flex items-center gap-2 bg-white text-black px-8 h-14 rounded-sm text-xs uppercase tracking-luxury hover:bg-gold transition">
              {t.home.heroCta} <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl md:text-5xl">{t.home.categories}</h2>
          <Link to="/shop" className="text-xs uppercase tracking-luxury hover:text-gold transition hidden md:inline-flex items-center gap-1">
            {t.home.viewAll} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            >
              <Link to="/shop" search={{ category: c.slug }} className="group block relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                {c.image_url && (
                  <img src={c.image_url} alt={locale === "fr" ? c.name_fr : c.name_en} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display text-2xl">{locale === "fr" ? c.name_fr : c.name_en}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending / Featured */}
      <section className="bg-gradient-hero py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-luxury text-gold mb-3">{t.home.trendingSub}</p>
              <h2 className="font-display text-3xl md:text-5xl">{t.home.trending}</h2>
            </div>
            <Link to="/shop" className="text-xs uppercase tracking-luxury hover:text-gold transition hidden md:inline-flex items-center gap-1">
              {t.home.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* Shop the Look */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="text-xs uppercase tracking-luxury text-gold">{t.brand.tagline}</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1] mt-4 text-balance">{t.home.shopTheLook}</h2>
            <p className="mt-6 text-muted-foreground max-w-md">{t.home.shopTheLookSub}</p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 h-13 py-4 rounded-sm text-xs uppercase tracking-luxury">
                {t.nav.shop}
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-3"
          >
            {newArrivals.slice(0, 4).map((p, i) => (
              <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className={`relative aspect-[3/4] overflow-hidden rounded-sm ${i % 2 === 1 ? "translate-y-8" : ""}`}>
                <img src={p.images[0]} alt={p.name_en} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <Sparkles className="w-6 h-6 mx-auto text-gold" />
          <h2 className="font-display text-4xl md:text-5xl mt-6">{t.home.newsletter}</h2>
          <p className="mt-4 opacity-80">{t.home.newsletterSub}</p>
          <form
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => { e.preventDefault(); }}
          >
            <input
              type="email"
              required
              placeholder={t.home.emailPlaceholder}
              className="flex-1 bg-transparent border border-primary-foreground/30 rounded-sm px-4 h-12 text-sm outline-none focus:border-gold"
            />
            <button type="submit" className="bg-gradient-luxury text-gold-foreground px-6 h-12 rounded-sm text-xs uppercase tracking-luxury">
              {t.home.subscribe}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
