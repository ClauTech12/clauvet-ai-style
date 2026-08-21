import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useI18n, formatPrice } from "@/i18n/I18nProvider";
import type { Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { t, locale } = useI18n();
  const name = locale === "fr" ? product.name_fr : product.name_en;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
          <img
            src={product.images[0]}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {product.is_new && (
            <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-luxury bg-primary text-primary-foreground px-2 py-1 rounded-sm">
              {t.product.newBadge}
            </span>
          )}
          <button
            aria-label={t.product.addToWishlist}
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-gold-foreground"
          >
            <Heart className="w-4 h-4" />
          </button>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
        <div className="mt-3 px-1">
          {product.brand && (
            <p className="font-mono text-[10px] uppercase tracking-luxury text-muted-foreground">{product.brand}</p>
          )}
          <h3 className="mt-1 text-sm font-medium truncate group-hover:text-gold transition-colors">{name}</h3>
          <p className="mt-1 font-mono text-sm text-foreground/80">{formatPrice(product.price, locale, product.currency)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
