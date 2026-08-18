import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const nav = [
    { to: "/shop", label: t.nav.shop, search: undefined },
    { to: "/shop", label: t.nav.women, search: { category: "women" } },
    { to: "/shop", label: t.nav.men, search: { category: "men" } },
    { to: "/shop", label: t.nav.shoes, search: { category: "shoes" } },
    { to: "/shop", label: t.nav.newArrivals, search: { sort: "newest" } },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    setOpen(false);
    navigate({ to: "/shop", search: { q } });
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2 md:gap-8 flex-1">
              <button onClick={() => setOpen(true)} className="md:hidden p-2 -ml-2" aria-label="Menu">
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/" className="font-display text-2xl md:text-3xl tracking-tight">
                Clauvèra
              </Link>
              <nav className="hidden md:flex items-center gap-7 ml-6">
                {nav.map((item, i) => (
                  <Link key={i} to={item.to} search={item.search as never} className="text-sm uppercase tracking-luxury hover:text-gold transition">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={() => setSearchOpen((v) => !v)} className="p-2 hover:text-gold transition" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center text-xs uppercase tracking-luxury">
                <button onClick={() => setLocale("en")} className={locale === "en" ? "text-gold" : "text-muted-foreground hover:text-foreground"}>EN</button>
                <span className="mx-2 text-muted-foreground">/</span>
                <button onClick={() => setLocale("fr")} className={locale === "fr" ? "text-gold" : "text-muted-foreground hover:text-foreground"}>FR</button>
                <span className="mx-2 text-muted-foreground">/</span>
                <button onClick={() => setLocale("pcm")} className={locale === "pcm" ? "text-gold" : "text-muted-foreground hover:text-foreground"}>PCM</button>
              </div>
              <button onClick={toggle} className="p-2 hover:text-gold transition" aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to={user ? "/dashboard" : "/login"} className="p-2 hover:text-gold transition" aria-label={t.nav.account}>
                <User className="w-5 h-5" />
              </Link>
              <Link to="/wishlist" className="p-2 hover:text-gold transition" aria-label={t.nav.wishlist}>
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="p-2 hover:text-gold transition" aria-label={t.nav.cart}>
                <ShoppingBag className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.form
                onSubmit={submitSearch}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t.nav.search}
                  className="w-full bg-transparent py-5 outline-none text-lg font-display"
                />
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl">Clauvèra</span>
                <button onClick={() => setOpen(false)} className="p-2" aria-label="Close">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="mt-12 flex flex-col gap-6">
                {nav.map((item, i) => (
                  <Link key={i} to={item.to} search={item.search as never} onClick={() => setOpen(false)} className="font-display text-3xl">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-12 flex items-center gap-4 text-sm uppercase tracking-luxury">
                <button onClick={() => setLocale("en")} className={locale === "en" ? "text-gold" : ""}>EN</button>
                <span>/</span>
                <button onClick={() => setLocale("fr")} className={locale === "fr" ? "text-gold" : ""}>FR</button>
                <span>/</span>
                <button onClick={() => setLocale("pcm")} className={locale === "pcm" ? "text-gold" : ""}>PCM</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileBottomBar() {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass-strong border-t border-border">
      <div className="grid grid-cols-4">
        <Link to="/" className="flex flex-col items-center py-3 text-xs">
          <span className="font-display text-lg leading-none">C</span>
          <span className="mt-1 text-[10px] uppercase tracking-luxury text-muted-foreground">Home</span>
        </Link>
        <Link to="/shop" className="flex flex-col items-center py-3 text-xs">
          <Search className="w-5 h-5" />
          <span className="mt-1 text-[10px] uppercase tracking-luxury text-muted-foreground">{t.nav.shop}</span>
        </Link>
        <Link to="/wishlist" className="flex flex-col items-center py-3 text-xs">
          <Heart className="w-5 h-5" />
          <span className="mt-1 text-[10px] uppercase tracking-luxury text-muted-foreground">{t.nav.wishlist}</span>
        </Link>
        <Link to={user ? "/dashboard" : "/login"} className="flex flex-col items-center py-3 text-xs">
          <User className="w-5 h-5" />
          <span className="mt-1 text-[10px] uppercase tracking-luxury text-muted-foreground">{t.nav.account}</span>
        </Link>
      </div>
    </nav>
  );
}
