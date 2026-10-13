"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { starterProducts } from "@/data/seed";
import { isOrderStatus } from "@/data/store";
import { checkProductInput, type ProductInput, type ProductInputErrors } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";
import { PRODUCTS_TAG } from "@/lib/catalog";
import { productToRow } from "@/lib/product";
import { PRODUCT_IMAGES_BUCKET, isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/* ── Auth ── */

export type SignInState = { error: string } | null;

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!isSupabaseConfigured) return { error: "Connect Supabase first (see the setup steps)." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("signIn failed:", error.code ?? error.name, error.message);
    if (error.code === "email_not_confirmed") {
      return { error: "This email isn't confirmed yet. In Supabase, open Authentication → Users and confirm it." };
    }
    if (error.code === "invalid_credentials") return { error: "That email and password don't match an account." };
    if (error.name === "AuthRetryableFetchError" || error.status === 0 || !error.status) {
      return { error: "Couldn't reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local (it should end in .supabase.co)." };
    }
    return { error: `Sign-in failed: ${error.message}` };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "This account isn't an admin. Add it to the admins table (see the setup steps)." };
  }

  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

/* ── Products ── */

const publicPrefix = `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;

/** Storage paths for photos we uploaded (starter photos in /public are left alone). */
function storagePaths(urls: string[]) {
  return urls.filter((url) => url.startsWith(publicPrefix)).map((url) => decodeURIComponent(url.slice(publicPrefix.length)));
}

export type SaveProductResult = { ok: false; error: string; fieldErrors?: ProductInputErrors };

export async function saveProduct(id: string | null, input: ProductInput): Promise<SaveProductResult> {
  const { supabase } = await requireAdmin();

  const { product, errors } = checkProductInput(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: errors };
  }

  const row = productToRow(product);
  let previousImages: string[] = [];

  if (id) {
    const { data: existing } = await supabase.from("products").select("images").eq("id", id).maybeSingle();
    if (!existing) return { ok: false, error: "This product no longer exists." };
    previousImages = Array.isArray(existing.images)
      ? (existing.images as { url?: unknown }[]).flatMap((img) => (typeof img?.url === "string" ? [img.url] : []))
      : [];
  }

  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Another product already uses that link.", fieldErrors: { slug: "Already in use." } };
    }
    console.error("saveProduct failed:", error.message);
    return { ok: false, error: "Couldn't save the product. Please try again." };
  }

  const kept = new Set(product.images.map((img) => img.url));
  const removed = storagePaths(previousImages.filter((url) => !kept.has(url)));
  if (removed.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(removed);

  updateTag(PRODUCTS_TAG);
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: existing } = await supabase.from("products").select("images").eq("id", id).maybeSingle();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("deleteProduct failed:", error.message);
    return { ok: false, error: "Couldn't delete the product." };
  }

  const urls = Array.isArray(existing?.images)
    ? (existing.images as { url?: unknown }[]).flatMap((img) => (typeof img?.url === "string" ? [img.url] : []))
    : [];
  const paths = storagePaths(urls);
  if (paths.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);

  updateTag(PRODUCTS_TAG);
  return { ok: true };
}

export async function setProductFlag(id: string, flag: "is_active" | "featured", value: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (flag !== "is_active" && flag !== "featured") return { ok: false, error: "Unknown setting." };

  const { error } = await supabase.from("products").update({ [flag]: value }).eq("id", id);
  if (error) return { ok: false, error: "Couldn't update the product." };

  updateTag(PRODUCTS_TAG);
  return { ok: true };
}

export async function importStarterProducts(): Promise<ActionResult & { count?: number }> {
  const { supabase } = await requireAdmin();

  const rows = starterProducts.map((p) => productToRow(p));
  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug", ignoreDuplicates: true })
    .select("id");
  if (error) {
    console.error("importStarterProducts failed:", error.message);
    return { ok: false, error: "Couldn't import the starter products." };
  }

  updateTag(PRODUCTS_TAG);
  return { ok: true, count: data?.length ?? 0 };
}

/* ── Orders ── */

export async function setOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isOrderStatus(status)) return { ok: false, error: "Unknown status." };

  const { error } = await supabase.rpc("set_order_status", { p_order_id: orderId, p_status: status });
  if (error) {
    if (error.message.includes("ALREADY_CANCELLED")) {
      return { ok: false, error: "Cancelled orders can't be reopened (their stock was already returned)." };
    }
    console.error("setOrderStatus failed:", error.message);
    return { ok: false, error: "Couldn't update the order." };
  }

  if (status === "cancelled") updateTag(PRODUCTS_TAG);
  return { ok: true };
}

export async function saveOrderNote(orderId: string, note: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("orders")
    .update({ admin_note: String(note ?? "").slice(0, 2000) })
    .eq("id", orderId);
  if (error) return { ok: false, error: "Couldn't save the note." };
  return { ok: true };
}
