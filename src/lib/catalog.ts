import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { starterProducts } from "@/data/seed";
import { productFromRow, type Product, type ProductRow } from "./product";
import { isSupabaseConfigured } from "./supabase/env";
import { createPublicClient } from "./supabase/public";

export const PRODUCTS_TAG = "products";

/** Active products in display order. Invalidated with updateTag(PRODUCTS_TAG) after any change. */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);

  if (!isSupabaseConfigured) {
    cacheLife("hours");
    return starterProducts;
  }

  const { data, error } = await createPublicClient()
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Could not load products:", error?.message);
    cacheLife("minutes");
    return [];
  }

  cacheLife("hours");
  return (data as ProductRow[]).map(productFromRow).filter((p): p is Product => p !== null);
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}