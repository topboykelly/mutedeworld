import { badges, isCategory, type Badge } from "@/data/store";
import { colorNames, stockKey, type Product } from "./product";

/** What the admin product form submits. */
export type ProductInput = Omit<Product, "id">;

export type ProductInputErrors = Partial<Record<"name" | "slug" | "category" | "price" | "sizes" | "colors" | "images" | "stock", string>>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-f]{6}$/i;

/** Validates and normalises a product from the admin form. Shared by the form and the server action. */
export function checkProductInput(input: ProductInput): { product: ProductInput; errors: ProductInputErrors } {
  const errors: ProductInputErrors = {};
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const name = text(input.name, 120);
  if (!name) errors.name = "Give the product a name.";

  const slug = text(input.slug, 80).toLowerCase();
  if (!SLUG.test(slug)) errors.slug = "Use lowercase letters, numbers and dashes only, e.g. mdw-tee-black.";

  const category = isCategory(String(input.category)) ? input.category : null;
  if (!category) errors.category = "Pick a category.";

  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) errors.price = "Enter a valid price.";

  const sizes = Array.isArray(input.sizes)
    ? [...new Set(input.sizes.map((s) => text(s, 20)).filter(Boolean))]
    : [];
  if (sizes.length === 0) errors.sizes = "Pick at least one size.";

  const colors = Array.isArray(input.colors)
    ? input.colors.map((c) => ({ name: text(c?.name, 40), hex: text(c?.hex, 7) }))
    : [];
  const colorSet = new Set(colors.map((c) => c.name.toLowerCase()));
  if (colors.some((c) => !c.name)) errors.colors = "Every colour needs a name.";
  else if (colorSet.size !== colors.length) errors.colors = "Colour names must be different.";
  else if (colors.some((c) => !HEX.test(c.hex))) errors.colors = "Pick a swatch colour for every colour.";

  const names = colorNames({ colors });
  const images = Array.isArray(input.images)
    ? input.images
        .filter((img) => typeof img?.url === "string" && (img.url.startsWith("https://") || img.url.startsWith("/")))
        .map((img) => ({
          url: img.url,
          ...(img.color && names.includes(img.color) ? { color: img.color } : {}),
        }))
    : [];
  if (images.length > 20) errors.images = "Use 20 photos or fewer.";

  const stock: Record<string, number> = {};
  for (const color of names) {
    for (const size of sizes) {
      const n = Number(input.stock?.[stockKey(color, size)] ?? 0);
      if (!Number.isInteger(n) || n < 0 || n > 100_000) {
        errors.stock = "Stock must be whole numbers, 0 or more.";
        continue;
      }
      stock[stockKey(color, size)] = n;
    }
  }

  const badge = input.badge && badges.includes(input.badge as Badge) ? input.badge : null;
  const details = Array.isArray(input.details) ? input.details.map((d) => text(d, 200)).filter(Boolean).slice(0, 20) : [];
  const sortOrder = Number.isInteger(Number(input.sortOrder)) ? Number(input.sortOrder) : 0;

  return {
    errors,
    product: {
      slug,
      name,
      category: category ?? "tees",
      price: Math.round(price * 100) / 100,
      description: text(input.description, 2000),
      details,
      badge,
      sizes,
      colors,
      images,
      stock,
      isActive: Boolean(input.isActive),
      featured: Boolean(input.featured),
      sortOrder,
    },
  };
}
