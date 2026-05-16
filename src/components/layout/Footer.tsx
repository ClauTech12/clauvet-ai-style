import { Link } from "@tanstack/react-router";
import logo from "@/assets/clautech-logo.png";
import { useI18n } from "@/i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="font-display text-3xl tracking-tight">Clauvèra</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t.brand.tagline}
            </p>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-luxury text-muted-foreground mb-4">{t.footer.shop}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" search={{ category: "women" }} className="hover:text-gold transition">{t.nav.women}</Link></li>
              <li><Link to="/shop" search={{ category: "men" }} className="hover:text-gold transition">{t.nav.men}</Link></li>
              <li><Link to="/shop" search={{ category: "shoes" }} className="hover:text-gold transition">{t.nav.shoes}</Link></li>
              <li><Link to="/shop" search={{ category: "accessories" }} className="hover:text-gold transition">{t.nav.accessories}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-luxury text-muted-foreground mb-4">{t.footer.help}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-gold transition">{t.footer.contact}</Link></li>
              <li><Link to="/faq" className="hover:text-gold transition">{t.footer.faq}</Link></li>
              <li><Link to="/shipping" className="hover:text-gold transition">{t.footer.shipping}</Link></li>
              <li><Link to="/returns" className="hover:text-gold transition">{t.footer.returns}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs uppercase tracking-luxury text-muted-foreground mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-gold transition">{t.footer.about}</Link></li>
              <li><Link to="/privacy" className="hover:text-gold transition">{t.footer.privacy}</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition">{t.footer.terms}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Clauvèra. {t.footer.rights}
          </p>
          <div className="flex items-center gap-3 md:justify-end">
            <span className="text-xs uppercase tracking-luxury text-muted-foreground">{t.footer.poweredBy}</span>
            <img src={logo} alt="Clautech" className="h-7 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}
