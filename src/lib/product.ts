import { LOW_STOCK_THRESHOLD, badges, isCategory, type Badge, type Category } from "@/data/store";

export type ProductColor = { name: string; hex: string };
export type ProductPhoto = { url: string; color?: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  /** Price in Ghana cedis. */
  price: number;
  description: string;
  details: string[];
  badge: Badge | null;
  sizes: string[];
  colors: ProductColor[];
  images: ProductPhoto[];
  /** Units in stock per variant, keyed by {@link stockKey}. */
  stock: Record<string, number>;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
};

/** Variant key used by the stock map. Colour is "" for products without colours. */
export function stockKey(color: string, size: string) {
  return `${color}|${size}`;
}

/** Colour names to iterate over; a single "" when the product has no colours. */
export function colorNames(product: Pick<Product, "colors">) {
  return product.colors.length ? product.colors.map((c) => c.name) : [""];
}

export function stockFor(product: Pick<Product, "stock">, color: string, size: string) {
  return Math.max(0, product.stock[stockKey(color, size)] ?? 0);
}

export function totalStock(product: Pick<Product, "stock" | "colors" | "sizes">) {
  let total = 0;
  for (const color of colorNames(product)) {
    for (const size of product.sizes) total += stockFor(product, color, size);
  }
  return total;
}

export function isSoldOut(product: Pick<Product, "stock" | "colors" | "sizes">) {
  return totalStock(product) === 0;
}

/** Units left when the whole product is nearly sold out, otherwise null. */
export function lowStockCount(product: Pick<Product, "stock" | "colors" | "sizes">) {
  const total = totalStock(product);
  return total > 0 && total <= LOW_STOCK_THRESHOLD ? total : null;
}

export function colorStock(product: Pick<Product, "stock" | "sizes">, color: string) {
  return product.sizes.reduce((sum, size) => sum + stockFor(product, color, size), 0);
}

/** The first in-stock variant, preferring size M. Used for quick add. */
export function firstAvailable(product: Pick<Product, "stock" | "colors" | "sizes">) {
  const sizes = [...product.sizes].sort((a, b) => (a === "M" ? -1 : b === "M" ? 1 : 0));
  for (const color of colorNames(product)) {
    for (const size of sizes) {
      if (stockFor(product, color, size) > 0) return { color, size };
    }
  }
  return null;
}

/** Photos for the chosen colour, falling back to untagged photos, then to all photos. */
export function photosFor(product: Pick<Product, "images">, color: string) {
  if (!color) return product.images;
  const tagged = product.images.filter((img) => img.color === color);
  if (tagged.length) return tagged;
  const untagged = product.images.filter((img) => !img.color);
  return untagged.length ? untagged : product.images;
}

export function coverPhoto(product: Pick<Product, "images">) {
  return product.images[0]?.url ?? "";
}

/** The product shown in the hero: the first featured one, else the first in the list. */
export function heroProductFrom(products: Product[]) {
  return products.find((p) => p.featured) ?? products[0] ?? null;
}

export function variantLabel(color: string, size: string) {
  return [color, size].filter(Boolean).join(" / ");
}

/* ── Database rows ── */

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number | string;
  description: string | null;
  details: string[] | null;
  badge: string | null;
  sizes: string[] | null;
  colors: unknown;
  images: unknown;
  stock: unknown;
  is_active: boolean;
  featured: boolean;
  sort_order: number;
};

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((v) => v && typeof v === "object") : [];
}

export function productFromRow(row: ProductRow): Product | null {
  if (!isCategory(row.category)) return null;

  const stock: Record<string, number> = {};
  if (row.stock && typeof row.stock === "object" && !Array.isArray(row.stock)) {
    for (const [key, value] of Object.entries(row.stock)) {
      const n = Number(value);
      if (Number.isFinite(n)) stock[key] = Math.max(0, Math.floor(n));
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price) || 0,
    description: row.description ?? "",
    details: row.details ?? [],
    badge: badges.includes(row.badge as Badge) ? (row.badge as Badge) : null,
    sizes: row.sizes ?? [],
    colors: asArray(row.colors)
      .filter((c) => typeof c.name === "string" && c.name)
      .map((c) => ({ name: String(c.name), hex: typeof c.hex === "string" ? c.hex : "#888888" })),
    images: asArray(row.images)
      .filter((img) => typeof img.url === "string" && img.url)
      .map((img) => ({ url: String(img.url), ...(typeof img.color === "string" && img.color ? { color: img.color } : {}) })),
    stock,
    isActive: row.is_active,
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}

export function productToRow(product: Omit<Product, "id">) {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    details: product.details,
    badge: product.badge,
    sizes: product.sizes,
    colors: product.colors,
    images: product.images,
    stock: product.stock,
    is_active: product.isActive,
    featured: product.featured,
    sort_order: product.sortOrder,
  };
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
