import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, ShoppingBag, Truck, Shield, RotateCcw } from "lucide-react";
import { fetchProduct, fetchProducts } from "@/lib/products";
import { addToCart, toggleWishlist } from "@/lib/cart";
import { useI18n, formatPrice } from "@/i18n/I18nProvider";
import { useAuth } from "@/hooks/use-auth";
import { whatsappLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/shop/ProductCard";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const prettyName = params.slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return {
      meta: [
        { title: `${prettyName} — Clauvèra` },
        { property: "og:title", content: `${prettyName} — Clauvèra` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [imageIdx, setImageIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  const { data: product, isLoading } = useQuery({ queryKey: ["product", slug], queryFn: () => fetchProduct(slug) });
  const { data: related = [] } = useQuery({ queryKey: ["products", "related", product?.category_id], queryFn: () => fetchProducts({ limit: 4 }), enabled: !!product });

  if (isLoading) return <div className="container mx-auto px-6 py-20">{t.common.loading}</div>;
  if (!product) return <div className="container mx-auto px-6 py-20">Not found</div>;

  const name = locale === "fr" ? product.name_fr : product.name_en;
  const description = locale === "fr" ? product.description_fr : product.description_en;

  const handleAdd = async () => {
    if (product.sizes.length > 0 && !size) { toast.error(t.product.selectSize); return; }
    if (!user) { navigate({ to: "/login" }); return; }
    try {
      await addToCart(user.id, product.id, size, color);
      toast.success(t.product.addToCart);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleWishlist = async () => {
    if (!user) { navigate({ to: "/login" }); return; }
    const res = await toggleWishlist(user.id, product.id);
    setSaved(res);
  };

  const waMsg = locale === "fr"
    ? `Bonjour Clauvèra, je souhaite commander : ${name} (${formatPrice(product.price, locale, product.currency)})`
    : `Hi Clauvèra, I'd like to order: ${name} (${formatPrice(product.price, locale, product.currency)})`;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <nav className="text-xs uppercase tracking-luxury text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Clauvèra</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-foreground">{t.nav.shop}</Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 md:gap-16">
        <div>
          <motion.div
            key={imageIdx}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="aspect-[3/4] bg-muted rounded-sm overflow-hidden"
          >
            <img src={product.images[imageIdx]} alt={name} className="w-full h-full object-cover" />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((src, i) => (
                <button key={i} onClick={() => setImageIdx(i)} className={`aspect-square rounded-sm overflow-hidden border-2 ${i === imageIdx ? "border-gold" : "border-transparent"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-28 md:self-start">
          {product.brand && <p className="text-xs uppercase tracking-luxury text-muted-foreground">{product.brand}</p>}
          <h1 className="font-display text-3xl md:text-5xl mt-2">{name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-medium">{formatPrice(product.price, locale, product.currency)}</span>
            {product.compare_at_price && (
              <span className="font-mono text-base text-muted-foreground line-through">{formatPrice(product.compare_at_price, locale, product.currency)}</span>
            )}
          </div>

          {description && <p className="mt-6 text-muted-foreground leading-relaxed">{description}</p>}

          {product.sizes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-luxury">{t.product.size}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`min-w-[3rem] h-11 px-4 border rounded-sm text-sm transition ${size === s ? "border-gold bg-gold text-gold-foreground" : "border-border hover:border-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-luxury mb-3">{t.product.color}</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`h-11 px-4 border rounded-sm text-sm transition ${color === c ? "border-gold text-gold" : "border-border hover:border-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-[1fr_auto] gap-2">
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="bg-primary text-primary-foreground h-14 rounded-sm text-xs uppercase tracking-luxury flex items-center justify-center gap-2 hover:bg-gradient-luxury hover:text-gold-foreground transition disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" /> {product.stock === 0 ? t.product.sold : t.product.addToCart}
            </button>
            <button onClick={handleWishlist} className="w-14 h-14 border border-border rounded-sm hover:border-foreground transition flex items-center justify-center" aria-label={t.product.addToWishlist}>
              <Heart className={`w-5 h-5 ${saved ? "fill-current text-gold" : ""}`} />
            </button>
          </div>

          <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer"
            className="mt-3 w-full h-14 rounded-sm border border-border text-xs uppercase tracking-luxury flex items-center justify-center gap-2 hover:border-foreground transition"
            style={{ color: "#25D366" }}>
            <MessageCircle className="w-4 h-4" /> {t.product.orderWhatsapp}
          </a>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center text-[11px] uppercase tracking-luxury text-muted-foreground border-t border-border pt-8">
            <div><Truck className="w-5 h-5 mx-auto mb-2" />{t.product.worldwide}</div>
            <div><Shield className="w-5 h-5 mx-auto mb-2" />{t.product.authentic}</div>
            <div><RotateCcw className="w-5 h-5 mx-auto mb-2" />{t.product.returns}</div>
          </div>
        </div>
      </div>

      {related.filter(r => r.id !== product.id).length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl md:text-4xl mb-8">{t.product.relatedTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.filter(r => r.id !== product.id).slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
