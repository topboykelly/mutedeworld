import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "./supabase/env";
import { createSessionClient } from "./supabase/server";

export type AdminUser = { id: string; email?: string };

export type AdminState =
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "not-admin"; user: AdminUser }
  | { status: "admin"; user: AdminUser };

export const getAdminState = cache(async (): Promise<AdminState> => {
  if (!isSupabaseConfigured) return { status: "unconfigured" };

  // Supabase checks token expiry against the clock, so admin pages only ever render for a real request.
  await connection();
  const supabase = await createSessionClient();
  // Verified locally against the project's cached signing key, so this costs no round trip to Supabase.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { status: "signed-out" };
  const user: AdminUser = { id: data.claims.sub, email: data.claims.email };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin === true ? { status: "admin", user } : { status: "not-admin", user };
});

/**
 * For admin pages and actions. Returns a client acting as the admin, or redirects to the login page.
 * Pages render a setup notice instead when Supabase isn't configured, so this only runs once it is.
 */
export async function requireAdmin() {
  const state = await getAdminState();
  if (state.status !== "admin") redirect("/admin/login");
  return { user: state.user, supabase: await createSessionClient() };
}

/** For admin pages: null when Supabase isn't configured yet, so the page can show setup steps. */
export async function getAdminSession() {
  if (!isSupabaseConfigured) return null;
  return requireAdmin();
}
