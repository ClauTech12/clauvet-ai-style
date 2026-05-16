import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  description_en: string | null;
  description_fr: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  category_id: string | null;
  brand: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  is_new: boolean;
  tags: string[];
};

export type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  image_url: string | null;
};

export async function fetchProducts(opts?: { categorySlug?: string; sort?: string; q?: string; limit?: number; featured?: boolean }) {
  let q = supabase.from("products").select("*, categories(slug)");
  if (opts?.featured) q = q.eq("featured", true);
  if (opts?.q) q = q.or(`name_en.ilike.%${opts.q}%,name_fr.ilike.%${opts.q}%,brand.ilike.%${opts.q}%`);
  if (opts?.sort === "price-asc") q = q.order("price", { ascending: true });
  else if (opts?.sort === "price-desc") q = q.order("price", { ascending: false });
  else q = q.order("created_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []) as unknown as (Product & { categories: { slug: string } | null })[];
  if (opts?.categorySlug) rows = rows.filter((r) => r.categories?.slug === opts.categorySlug);
  return rows as Product[];
}

export async function fetchProduct(slug: string) {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}
