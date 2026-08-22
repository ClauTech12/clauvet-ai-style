import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { fetchCart, removeCartItem, updateCartQty, clearCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, formatPrice } from "@/i18n/I18nProvider";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Clauvèra" }], links: [{ rel: "canonical", href: "/cart" }] }),
  component: CartPage,
});

function CartPage() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const towns = ["Buea", "Limbe", "Mamfe", "Kumba", "Douala"];
  const { data: items = [] } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => fetchCart(user!.id),
    enabled: !!user,
  });

  if (loading) return <div className="container mx-auto px-6 py-20">{t.common.loading}</div>;
  if (!user) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-4xl">{t.cart.title}</h1>
        <p className="mt-4 text-muted-foreground">{t.auth.signInTitle}</p>
        <Link to="/login" className="mt-6 inline-flex bg-primary text-primary-foreground px-8 h-12 items-center rounded-sm text-xs uppercase tracking-luxury">{t.auth.signIn}</Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0);

  const update = async (id: string, qty: number) => { await updateCartQty(id, qty); qc.invalidateQueries({ queryKey: ["cart"] }); };
  const remove = async (id: string) => { await removeCartItem(id); qc.invalidateQueries({ queryKey: ["cart"] }); };

  const currency = items[0]?.product?.currency ?? "XAF";

  async function handleCheckout() {
    if (!user || items.length === 0) return;
    if (!fullName.trim() || !phone.trim() || !town) {
      alert(t.cart.deliveryRequired);
      return;
    }
    setPlacing(true);
    try {
      const shippingAddress = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        town,
        address: address.trim(),
        notes: notes.trim(),
      };
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({ user_id: user.id, status: "pending", total: subtotal, currency, shipping_address: shippingAddress })
        .select()
        .single();
      if (orderErr || !order) throw orderErr;

      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: locale === "fr" ? i.product.name_fr : i.product.name_en,
        price: i.product.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      const ref = order.id.slice(0, 8).toUpperCase();
      const waMsg = locale === "fr"
        ? `Bonjour Clauvèra, je souhaite finaliser ma commande #${ref} :\n${items.map(i => `• ${i.product.name_fr} ×${i.quantity}`).join("\n")}\nTotal: ${formatPrice(subtotal, locale, currency)}\n\nLivraison à: ${fullName} (${phone})\nVille: ${town}${address ? `\nAdresse: ${address}` : ""}${notes ? `\nNotes: ${notes}` : ""}`
        : `Hi Clauvèra, I'd like to place order #${ref}:\n${items.map(i => `• ${i.product.name_en} ×${i.quantity}`).join("\n")}\nTotal: ${formatPrice(subtotal, locale, currency)}\n\nDeliver to: ${fullName} (${phone})\nTown: ${town}${address ? `\nAddress: ${address}` : ""}${notes ? `\nNotes: ${notes}` : ""}`;

      await clearCart(user.id);
      setFullName(""); setPhone(""); setTown(""); setAddress(""); setNotes("");
      qc.invalidateQueries({ queryKey: ["cart"] });
      window.open(whatsappLink(waMsg), "_blank", "noopener,noreferrer");
      navigate({ to: "/dashboard" });
    } catch (e) {
      console.error("Checkout failed:", e);
      alert(t.common.error);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-6xl">{t.cart.title}</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{t.cart.empty}</p>
          <Link to="/shop" className="mt-6 inline-flex bg-primary text-primary-foreground px-8 h-12 items-center rounded-sm text-xs uppercase tracking-luxury">
            {t.cart.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10 mt-10">
          <div className="lg:col-span-2 divide-y divide-border">
            {items.map(i => (
              <div key={i.id} className="flex gap-4 py-6">
                <Link to="/product/$slug" params={{ slug: i.product.slug }} className="w-24 md:w-32 aspect-[3/4] bg-muted rounded-sm overflow-hidden flex-shrink-0">
                  <img src={i.product.images[0]} alt="" className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-luxury text-muted-foreground">{i.product.brand}</p>
                      <h3 className="mt-1">{locale === "fr" ? i.product.name_fr : i.product.name_en}</h3>
                      {(i.size || i.color) && (
                        <p className="text-xs text-muted-foreground mt-1">{[i.size, i.color].filter(Boolean).join(" · ")}</p>
                      )}
                    </div>
                    <button onClick={() => remove(i.id)} aria-label={t.cart.remove} className="text-muted-foreground hover:text-destructive transition"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center border border-border rounded-sm">
                      <button onClick={() => update(i.id, i.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:text-gold transition"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center font-mono text-sm">{i.quantity}</span>
                      <button onClick={() => update(i.id, i.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:text-gold transition"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="font-mono font-medium">{formatPrice(Number(i.product.price) * i.quantity, locale, i.product.currency)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="bg-card border border-border rounded-sm p-6 h-fit lg:sticky lg:top-28">
            <div className="flex items-center gap-2 mb-1">
              <span className="altitude-rule h-5" />
              <span className="eyebrow-altitude">{t.cart.orderSummary}</span>
            </div>
            <h2 className="font-display text-2xl">{t.cart.subtotal}</h2>
            <div className="mt-4 flex justify-between text-lg">
              <span>{t.cart.subtotal}</span>
              <span className="font-mono font-medium">{formatPrice(subtotal, locale)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.cart.shipping}</p>

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="text-xs uppercase tracking-luxury text-muted-foreground">{t.cart.deliveryDetails}</p>
              <input
                value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t.cart.fullName}
                className="w-full h-11 px-3 bg-background border border-border rounded-sm text-sm outline-none focus:ring-2 focus:ring-gold"
              />
              <input
                value={phone} onChange={e => setPhone(e.target.value)} placeholder={t.cart.phone}
                className="w-full h-11 px-3 bg-background border border-border rounded-sm text-sm outline-none focus:ring-2 focus:ring-gold"
              />
              <select
                value={town} onChange={e => setTown(e.target.value)}
                className="w-full h-11 px-3 bg-background border border-border rounded-sm text-sm outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">{t.cart.selectTown}</option>
                {towns.map(tw => <option key={tw} value={tw}>{tw}</option>)}
              </select>
              <input
                value={address} onChange={e => setAddress(e.target.value)} placeholder={t.cart.address}
                className="w-full h-11 px-3 bg-background border border-border rounded-sm text-sm outline-none focus:ring-2 focus:ring-gold"
              />
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.cart.deliveryNotes} rows={2}
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>

            <button
              onClick={handleCheckout} disabled={placing}
              className="mt-6 w-full h-14 bg-gradient-luxury text-gold-foreground rounded-sm text-xs uppercase tracking-luxury flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
            >
              {placing && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.cart.checkout}
            </button>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
              {t.cart.trustNote}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
