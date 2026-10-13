/* Edit the store's content here: contact details, delivery fees and copy. Products are managed in /admin. */

export const brand = {
  name: "Mutedeworld",
  tagline: "Let the Style Speak",
  description:
    "Mutedeworld is aesthetic gear built for the leaders, thinkers and visionaries who let their actions and their style do the talking.",
  collectionYear: 2026,
  copyrightYear: 2026,
};

export const contact = {
  /** International format, digits only (used for wa.me links). */
  whatsapp: "233558177451",
  phone: "+233 55 817 7451",
  email: "osmanemmanuel673@gmail.com",
  location: "Accra, Ghana",
  hours: "Mon – Sat, 9am – 6pm",
  instagram: { handle: "@mog_mdw", url: "https://instagram.com/mog_mdw" },
  tiktok: { handle: "@mog_mdw", url: "https://tiktok.com/@mog_mdw" },
};

/** Links starting with "#" are sections on the home page; others are routes. */
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Collection", href: "#collection" },
  { label: "Our Story", href: "#story" },
  { label: "Contact", href: "/contact" },
] as const;

export type Category =
  | "tees"
  | "joggers"
  | "shorts"
  | "baggy-jeans"
  | "socks"
  | "tank-tops"
  | "knit-bodysuit"
  | "caps";

export const categories: { id: Category; label: string }[] = [
  { id: "tees", label: "Tees" },
  { id: "joggers", label: "Joggers" },
  { id: "shorts", label: "Shorts" },
  { id: "baggy-jeans", label: "Baggy Jeans" },
  { id: "socks", label: "Socks" },
  { id: "tank-tops", label: "Tank Tops" },
  { id: "knit-bodysuit", label: "Knit Bodysuit" },
  { id: "caps", label: "Caps & Headwear" },
];

export function categoryLabel(id: Category) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function isCategory(value: string): value is Category {
  return categories.some((c) => c.id === value);
}

export const apparelSizes = ["XS", "S", "M", "L", "XL", "XXL"];
export const oneSize = ["One Size"];
export const allSizes = [...apparelSizes, ...oneSize];

/** Sizes pre-selected when creating a product in the admin portal. */
export function defaultSizesFor(category: Category) {
  return category === "socks" || category === "caps" ? oneSize : apparelSizes;
}

export const badges = ["new", "bestseller", "limited"] as const;
export type Badge = (typeof badges)[number];

/** Stock at or below this shows an "Only N left" note. */
export const LOW_STOCK_THRESHOLD = 3;

export const heroTags: Category[] = ["tees", "joggers", "baggy-jeans", "knit-bodysuit", "caps", "tank-tops"];

export const heroQuote = "Designed with intention, worn with purpose. Pieces for people who let their presence speak first.";

export const marquee = [
  "Free Delivery in Accra over GH₵500",
  "New Collection Now Available",
  "Designed with Intention",
  "Worn with Purpose",
  "Mutedeworld",
];

export const promise = {
  title: "Crafted for Eternity",
  body: "Every Mutedeworld piece is made in limited quantities, using ethically sourced fabrics and age-old tailoring techniques passed down through generations.",
  points: [
    { value: "Limited", label: "Small-batch drops" },
    { value: "Ethical", label: "Responsibly sourced fabrics" },
    { value: "Accra", label: "Designed in Ghana" },
  ],
};

export const footerColumns = [
  {
    title: "Navigate",
    links: [
      { label: "New Arrivals", href: "/#collection" },
      { label: "Collection", href: "/#collection" },
      { label: "Our Story", href: "/#story" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Sizing", href: "/contact#faq" },
      { label: "Delivery", href: "/contact#faq" },
      { label: "Returns", href: "/contact#faq" },
    ],
  },
];

export const contactTopics = ["Order enquiry", "Sizing help", "Delivery", "Returns & exchanges", "Wholesale / collabs", "Something else"];

/* Placeholder policies: confirm the details with the brand before launch. */
export const faqs = [
  {
    q: "How long does delivery take?",
    a: "Orders within Greater Accra usually arrive in 1–2 business days. Other regions take 2–5 business days depending on location.",
  },
  {
    q: "How much is delivery?",
    a: "Delivery within Accra is free on orders over GH₵500 (GH₵30 otherwise). Other regions have a flat fee between GH₵60 and GH₵120, shown at checkout once you pick your region.",
  },
  {
    q: "How do I know my size?",
    a: "Our tees, joggers and shorts run true to size, and the baggy jeans are cut for a relaxed fit. If you're between sizes, message us on WhatsApp with your height and usual size and we'll help.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Unworn items with their tags can be exchanged within 7 days of delivery. Reach out with your order reference and we'll arrange it.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Mobile Money (MTN, Telecel, AirtelTigo): once we confirm your order on WhatsApp we'll send our MoMo details. Pay on delivery is available within Greater Accra.",
  },
  {
    q: "How do I track my order?",
    a: "After you place an order, send it to us on WhatsApp from the confirmation screen. For updates, message us your order reference (it starts with MDW-).",
  },
];

/* ── Checkout ── */

export const FREE_DELIVERY_THRESHOLD = 500;
export const ACCRA_SMALL_ORDER_FEE = 30;

export type RegionId = "accra" | "kumasi" | "takoradi" | "cape-coast" | "tamale" | "other";

export const regions: { id: RegionId; label: string; fee: number; note: string }[] = [
  {
    id: "accra",
    label: "Greater Accra",
    fee: 0,
    note: `Free delivery within Accra for orders over GH₵${FREE_DELIVERY_THRESHOLD}. Under that, a GH₵${ACCRA_SMALL_ORDER_FEE} fee applies.`,
  },
  { id: "kumasi", label: "Ashanti Region", fee: 60, note: "GH₵60 flat fee. Estimated 2–3 business days." },
  { id: "takoradi", label: "Western Region", fee: 80, note: "GH₵80 flat fee. Estimated 2–4 business days." },
  { id: "cape-coast", label: "Central Region", fee: 70, note: "GH₵70 flat fee. Estimated 2–3 business days." },
  { id: "tamale", label: "Northern Region", fee: 100, note: "GH₵100 flat fee. Estimated 3–5 business days." },
  { id: "other", label: "Other Region", fee: 120, note: "GH₵120 flat fee. Contact us for an exact timeline." },
];

export function isRegion(value: string): value is RegionId {
  return regions.some((r) => r.id === value);
}

/** The fee for a region, plus the subtotal above which delivery becomes free (Accra only). */
export function deliveryRule(regionId: RegionId): { fee: number; freeOver: number | null } {
  if (regionId === "accra") return { fee: ACCRA_SMALL_ORDER_FEE, freeOver: FREE_DELIVERY_THRESHOLD };
  return { fee: regions.find((r) => r.id === regionId)?.fee ?? 120, freeOver: null };
}

export function deliveryFee(regionId: RegionId | "", subtotal: number): number | null {
  if (!regionId) return null;
  const { fee, freeOver } = deliveryRule(regionId);
  return freeOver !== null && subtotal >= freeOver ? 0 : fee;
}

export type PaymentId = "momo" | "cod";

export const paymentMethods: { id: PaymentId; label: string; detail: string }[] = [
  {
    id: "momo",
    label: "Mobile Money",
    detail: "MTN · Telecel · AirtelTigo. We send payment details on WhatsApp once we confirm your order.",
  },
  { id: "cod", label: "Pay on Delivery", detail: "Cash or MoMo at your door. Greater Accra only." },
];

export function paymentLabel(id: string) {
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}

export function regionLabel(id: string) {
  return regions.find((r) => r.id === id)?.label ?? id;
}

/* ── Orders (admin) ── */

export const orderStatuses = [
  { id: "new", label: "New" },
  { id: "confirmed", label: "Confirmed" },
  { id: "dispatched", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export type OrderStatus = (typeof orderStatuses)[number]["id"];

export function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.some((s) => s.id === value);
}

/* ── Size guide (placeholder measurements in cm: confirm with the brand) ── */

export const sizeGuide = {
  note: "Measurements are of the garment laid flat, in centimetres. If you're between sizes, size up for a relaxed fit.",
  tables: [
    {
      title: "Tops (tees, tank tops, bodysuits)",
      columns: ["Size", "Chest", "Length", "Shoulder"],
      rows: [
        ["XS", "48", "66", "42"],
        ["S", "51", "69", "44"],
        ["M", "54", "72", "46"],
        ["L", "57", "74", "48"],
        ["XL", "60", "76", "50"],
        ["XXL", "63", "78", "52"],
      ],
    },
    {
      title: "Bottoms (joggers, shorts, jeans)",
      columns: ["Size", "Waist", "Hip", "Inseam"],
      rows: [
        ["XS", "68", "92", "74"],
        ["S", "72", "96", "76"],
        ["M", "78", "102", "78"],
        ["L", "84", "108", "80"],
        ["XL", "90", "114", "81"],
        ["XXL", "96", "120", "82"],
      ],
    },
  ],
};
