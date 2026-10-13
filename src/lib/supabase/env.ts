export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False until the Supabase keys are in .env.local. The store then runs on the built-in starter products. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const PRODUCT_IMAGES_BUCKET = "product-images";
