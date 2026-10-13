import type { Category } from "./store";
import { defaultSizesFor } from "./store";
import { colorNames, stockKey, type Product, type ProductColor } from "@/lib/product";

/**
 * Starter catalogue. The store shows these until Supabase is connected, and the admin portal's
 * "Import starter products" button copies them into the database. Photos point at /public/images:
 * drop real photos there, or upload new ones from the admin portal.
 */

const copy: Record<Category, { description: string; details: string[] }> = {
  tees: {
    description: "An everyday heavyweight tee with a relaxed, boxy cut. Soft hand-feel, clean lines, made to be worn on repeat.",
    details: ["100% cotton, 240gsm", "Relaxed, boxy fit", "Ribbed crew neck", "Machine wash cold, inside out"],
  },
  joggers: {
    description: "Brushed-fleece joggers with a tapered leg and a comfortable elastic waist. Dressed up or down, they just work.",
    details: ["Cotton-blend fleece", "Tapered leg with ribbed cuffs", "Drawstring waist, side pockets", "Machine wash cold"],
  },
  shorts: {
    description: "Easy, mid-length shorts cut for warm Accra days. Lightweight with a drawstring waist.",
    details: ["Cotton-blend", "Mid-thigh length", "Drawstring waist, side pockets", "Machine wash cold"],
  },
  "baggy-jeans": {
    description: "Wide, relaxed denim with a slouchy drape and a washed finish. The silhouette that anchors the collection.",
    details: ["Rigid cotton denim", "Baggy, wide-leg fit", "Five-pocket styling", "Wash inside out to keep the colour"],
  },
  socks: {
    description: "Ribbed crew socks with the MDW mark. The small detail that finishes the fit.",
    details: ["Cotton-rich knit", "Cushioned sole", "One size fits most (EU 38–45)"],
  },
  "tank-tops": {
    description: "A clean, fitted tank for layering or wearing alone when the heat is on.",
    details: ["Ribbed cotton", "Slim fit", "Machine wash cold"],
  },
  "knit-bodysuit": {
    description: "A close-fitting knit bodysuit with a sculpted shape. Pairs with the baggy jeans for the full look.",
    details: ["Stretch rib knit", "Snap closure", "Hand wash or gentle cycle"],
  },
  caps: {
    description: "Structured headwear with subtle MDW branding. Adjustable for an easy fit.",
    details: ["Cotton twill", "Adjustable strap", "Spot clean only"],
  },
};

type SeedInput = {
  id: string;
  name: string;
  category: Category;
  price: number;
  badge?: Product["badge"];
  image: string;
  colors?: ProductColor[];
  /** Units per variant. Defaults to 10. */
  units?: number;
  featured?: boolean;
};

const inputs: SeedInput[] = [
  {
    id: "tee-1",
    name: "MDW Tee",
    category: "tees",
    price: 85,
    badge: "new",
    image: "/images/tees3.jpeg",
    featured: true,
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Bone", hex: "#ece6da" },
      { name: "Sand", hex: "#c8b49a" },
    ],
  },
  { id: "tee-2", name: "MDW Tee", category: "tees", price: 85, image: "/images/tees2.jpeg" },
  { id: "joggers-1", name: "MDW Joggers", category: "joggers", price: 180, badge: "new", image: "/images/joggers1.jpeg" },
  { id: "joggers-2", name: "MDW Joggers", category: "joggers", price: 180, image: "/images/joggers2.jpeg" },
  { id: "shorts-1", name: "MDW Shorts", category: "shorts", price: 70, image: "/images/shorts2.jpeg" },
  { id: "shorts-2", name: "MDW Shorts", category: "shorts", price: 70, badge: "bestseller", image: "/images/shorts3.jpeg" },
  { id: "jeans-1", name: "Baggy Jeans", category: "baggy-jeans", price: 200, badge: "new", image: "/images/baggyjeans1.jpeg" },
  { id: "jeans-2", name: "Baggy Jeans", category: "baggy-jeans", price: 200, image: "/images/baggyjeans2.jpeg" },
  { id: "socks-1", name: "MDW Socks", category: "socks", price: 10, image: "/images/socks2.jpeg" },
  { id: "socks-2", name: "MDW Socks", category: "socks", price: 10, badge: "limited", image: "/images/socks1.png", units: 2 },
  { id: "tank-1", name: "MDW Tank Top", category: "tank-tops", price: 70, image: "/images/tanktop1.jpeg" },
  { id: "tank-2", name: "MDW Tank Top", category: "tank-tops", price: 70, badge: "new", image: "/images/tanktop2.jpeg" },
  { id: "bodysuit-1", name: "MDW Knit Bodysuit", category: "knit-bodysuit", price: 80, badge: "limited", image: "/images/knitbodysuit1.jpeg" },
  { id: "bodysuit-2", name: "MDW Knit Bodysuit", category: "knit-bodysuit", price: 80, image: "/images/bodysuit2.jpeg" },
  { id: "cap-1", name: "MDW Cap", category: "caps", price: 60, badge: "new", image: "/images/cap1.png" },
  { id: "cap-2", name: "MDW Cap", category: "caps", price: 60, image: "/images/cap2.png" },
  { id: "headband-1", name: "MDW Head Band", category: "caps", price: 40, image: "/images/bonnet1.jpeg" },
  { id: "headband-2", name: "MDW Head Band", category: "caps", price: 40, image: "/images/bonnet2.jpeg", units: 0 },
];

export const starterProducts: Product[] = inputs.map((input, index) => {
  const sizes = defaultSizesFor(input.category);
  const colors = input.colors ?? [];
  const stock: Record<string, number> = {};
  for (const color of colorNames({ colors })) {
    for (const size of sizes) stock[stockKey(color, size)] = input.units ?? 10;
  }

  return {
    id: `seed-${input.id}`,
    slug: `mdw-${input.id}`,
    name: input.name,
    category: input.category,
    price: input.price,
    description: copy[input.category].description,
    details: copy[input.category].details,
    badge: input.badge ?? null,
    sizes,
    colors,
    images: [{ url: input.image }],
    stock,
    isActive: true,
    featured: input.featured ?? false,
    sortOrder: index,
  };
});
