import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react";
import type { Product, Category } from "@/lib/products";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: AdminProductsPage,
});

type FormState = {
  id?: string;
  name_en: string; name_fr: string; slug: string;
  description_en: string; description_fr: string;
  price: string; compare_at_price: string; currency: string;
  category_id: string; brand: string;
  images: string[]; sizes: string; colors: string; tags: string;
  stock: string; featured: boolean; is_new: boolean;
};

const emptyForm: FormState = {
  name_en: "", name_fr: "", slug: "",
  description_en: "", description_fr: "",
  price: "", compare_at_price: "", currency: "XAF",
  category_id: "", brand: "",
  images: [], sizes: "", colors: "", tags: "",
  stock: "0", featured: false, is_new: false,
};

function AdminProductsPage() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Every time the form opens, put the cursor directly in the Name field —
  // this is the field people kept missing because the form is tall and it's
  // the very first thing at the top, easy to scroll past without noticing.
  useEffect(() => {
    if (formOpen) {
      setNameError(false);
      const t = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [formOpen]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("display_order");
      return (data ?? []) as Category[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["adminProducts"] });

  async function toggleStock(p: Product) {
    const newStock = p.stock > 0 ? 0 : 10;
    await supabase.from("products").update({ stock: newStock }).eq("id", p.id);
    refresh();
  }

  async function quickUpdate(id: string, field: "price" | "stock", value: number) {
    if (field === "price") await supabase.from("products").update({ price: value }).eq("id", id);
    else await supabase.from("products").update({ stock: value }).eq("id", id);
    refresh();
  }

  async function deleteProduct(id: string) {
    if (!confirm(t.admin.confirmDelete)) return;
    await supabase.from("products").delete().eq("id", id);
    refresh();
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name_en: p.name_en, name_fr: p.name_fr, slug: p.slug,
      description_en: p.description_en ?? "", description_fr: p.description_fr ?? "",
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      currency: p.currency, category_id: p.category_id ?? "", brand: p.brand ?? "",
      images: p.images, sizes: p.sizes.join(", "), colors: p.colors.join(", "), tags: p.tags.join(", "),
      stock: String(p.stock), featured: p.featured, is_new: p.is_new,
    });
    setFormOpen(true);
  }

  function openNew() {
    setForm(emptyForm);
    setFormOpen(true);
  }

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${form.slug || "new"}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    setForm(f => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false);
  }

  function removeImage(url: string) {
    setForm(f => ({ ...f, images: f.images.filter(i => i !== url) }));
  }

  async function saveProduct() {
    if (!form.name_en.trim()) {
      setNameError(true);
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      nameInputRef.current?.focus();
      return;
    }
    setNameError(false);
    setSaving(true);
    const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const generatedSlug = slugify(form.slug) || slugify(form.name_en) || `product-${crypto.randomUUID().slice(0, 8)}`;
    const payload = {
      name_en: form.name_en, name_fr: form.name_fr,
      slug: generatedSlug,
      description_en: form.description_en || null, description_fr: form.description_fr || null,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      currency: form.currency, category_id: form.category_id || null, brand: form.brand || null,
      images: form.images,
      sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
      stock: Number(form.stock) || 0, featured: form.featured, is_new: form.is_new,
    };
    if (form.id) {
      await supabase.from("products").update(payload).eq("id", form.id);
    } else {
      await supabase.from("products").insert(payload);
    }
    setSaving(false);
    setFormOpen(false);
    refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">{t.admin.products}</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 h-11 px-5 bg-gradient-luxury text-gold-foreground rounded-sm text-xs uppercase tracking-luxury hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t.admin.addProduct}
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-10">{t.common.loading}</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground py-10">{t.admin.noProducts}</p>
      ) : (
        <div className="border border-border rounded-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-luxury text-muted-foreground">
                <th className="p-3">{t.admin.name}</th>
                <th className="p-3">{t.admin.price}</th>
                <th className="p-3">{t.admin.stock}</th>
                <th className="p-3">{t.admin.status}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] && <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded-sm" />}
                      <div>
                        <p className="font-medium">{p.name_en}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <input
                      type="number" defaultValue={p.price} onBlur={e => quickUpdate(p.id, "price", Number(e.target.value))}
                      className="w-24 h-9 px-2 bg-transparent border border-border rounded-sm font-mono text-sm"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number" defaultValue={p.stock} onBlur={e => quickUpdate(p.id, "stock", Number(e.target.value))}
                      className="w-16 h-9 px-2 bg-transparent border border-border rounded-sm font-mono text-sm"
                    />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStock(p)}
                      className={`text-[11px] uppercase tracking-luxury px-2 py-1 rounded-sm border ${
                        p.stock > 0 ? "border-gold text-gold" : "border-destructive text-destructive"
                      }`}
                    >
                      {p.stock > 0 ? t.admin.inStock : t.admin.outOfStock}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} aria-label={t.admin.editProduct} className="p-2 hover:text-gold transition"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p.id)} aria-label={t.admin.deleteProduct} className="p-2 hover:text-destructive transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-sm p-6 md:p-8 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl">{form.id ? t.admin.editProduct : t.admin.addProduct}</h3>
              <button onClick={() => setFormOpen(false)} aria-label={t.cart.remove}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={`${t.admin.name} *`} value={form.name_en} onChange={v => setForm({ ...form, name_en: v })} inputRef={nameInputRef} error={nameError} />
              <Field label={t.admin.nameFr} value={form.name_fr} onChange={v => setForm({ ...form, name_fr: v })} />
              <Field label={t.admin.slug} value={form.slug} onChange={v => setForm({ ...form, slug: v })} placeholder="auto-generated if empty" />
              <Field label={t.admin.brand} value={form.brand} onChange={v => setForm({ ...form, brand: v })} />
              <Field label={t.admin.price} value={form.price} onChange={v => setForm({ ...form, price: v })} type="number" />
              <Field label={t.admin.comparePrice} value={form.compare_at_price} onChange={v => setForm({ ...form, compare_at_price: v })} type="number" />
              <Field label={t.admin.stock} value={form.stock} onChange={v => setForm({ ...form, stock: v })} type="number" />
              <div>
                <label className="text-xs uppercase tracking-luxury text-muted-foreground">{t.admin.category}</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="mt-1 w-full h-11 px-3 bg-transparent border border-border rounded-sm text-sm">
                  <option value="">—</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-luxury text-muted-foreground block mb-1">Photos</label>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map(url => (
                      <div key={url} className="relative w-20 h-24">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-sm border border-border" />
                        <button
                          type="button" onClick={() => removeImage(url)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 h-24 border border-dashed border-border rounded-sm cursor-pointer text-xs uppercase tracking-luxury text-muted-foreground hover:border-gold hover:text-gold transition">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? t.common.loading : "Upload photos"}
                  <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={e => uploadImages(e.target.files)} />
                </label>
              </div>
              <Field label={t.product.description} value={form.description_en} onChange={v => setForm({ ...form, description_en: v })} full textarea />
              <Field label="Sizes (comma-separated)" value={form.sizes} onChange={v => setForm({ ...form, sizes: v })} />
              <Field label="Colors (comma-separated)" value={form.colors} onChange={v => setForm({ ...form, colors: v })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> {t.admin.featured}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_new} onChange={e => setForm({ ...form, is_new: e.target.checked })} /> {t.admin.isNew}
              </label>
            </div>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button onClick={() => setFormOpen(false)} className="h-11 px-5 border border-border rounded-sm text-xs uppercase tracking-luxury">{t.admin.cancel}</button>
              <button onClick={saveProduct} disabled={saving} className="h-11 px-5 bg-gradient-luxury text-gold-foreground rounded-sm text-xs uppercase tracking-luxury disabled:opacity-50">{t.admin.save}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = "text", full = false, textarea = false, placeholder = "", inputRef, error = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; full?: boolean; textarea?: boolean; placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>; error?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className={`text-xs uppercase tracking-luxury ${error ? "text-destructive" : "text-muted-foreground"}`}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} className="mt-1 w-full px-3 py-2 bg-transparent border border-border rounded-sm text-sm" />
      ) : (
        <input
          ref={inputRef} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`mt-1 w-full h-11 px-3 bg-transparent border rounded-sm text-sm ${error ? "border-destructive" : "border-border"}`}
        />
      )}
      {error && <p className="mt-1 text-xs text-destructive">Required — please fill this in.</p>}
    </div>
  );
}
