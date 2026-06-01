import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./products";

export type CartRow = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  quantity: number;
  product: Product;
};

export async function fetchCart(userId: string): Promise<CartRow[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, size, color, quantity, products(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, product: r.products })) as CartRow[];
}

export async function addToCart(userId: string, productId: string, size: string | null, color: string | null) {
  const { error } = await supabase
    .from("cart_items")
    .upsert({ user_id: userId, product_id: productId, size, color, quantity: 1 }, { onConflict: "user_id,product_id,size,color" });
  if (error) throw error;
}

export async function updateCartQty(id: string, quantity: number) {
  if (quantity <= 0) return removeCartItem(id);
  const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
  if (error) throw error;
}

export async function removeCartItem(id: string) {
  const { error } = await supabase.from("cart_items").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchWishlist(userId: string) {
  const { data, error } = await supabase
    .from("wishlists")
    .select("id, product_id, products(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: r.id, product: r.products as Product }));
}

export async function toggleWishlist(userId: string, productId: string) {
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) {
    await supabase.from("wishlists").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("wishlists").insert({ user_id: userId, product_id: productId });
  return true;
}
