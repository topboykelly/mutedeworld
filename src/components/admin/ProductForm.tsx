"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { saveProduct } from "@/app/admin/actions";
import { allSizes, badges, categories, defaultSizesFor, type Badge, type Category } from "@/data/store";
import { checkProductInput, type ProductInput, type ProductInputErrors } from "@/lib/admin-products";
import { cn } from "@/lib/cn";
import { slugify, stockKey, type Product } from "@/lib/product";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/env";
import { ProductImage } from "../ui/ProductImage";
import { Field, Select, TextArea, TextInput } from "../ui/fields";
import { useAdminToast } from "./AdminToast";
import { Toggle } from "./ProductRowActions";
import { Card } from "./ui";

type ColorRow = { id: string; name: string; hex: string };
type PhotoRow = { url: string; colorId: string };

/** Row id used for stock when a product has no colours. */
const NO_COLOR = "";
const MAX_PHOTO_MB = 8;

type FormState = {
  name: string;
  slug: string;
  category: Category;
  price: string;
  badge: Badge | "";
  description: string;
  details: string;
  sizes: string[];
  colors: ColorRow[];
  photos: PhotoRow[];
  /** Keyed by `${colorRowId}|${size}`, so renaming a colour keeps its stock. */
  stock: Record<string, string>;
  isActive: boolean;
  featured: boolean;
  sortOrder: string;
};

function initialState(product: Product | null, nextSortOrder: number): FormState {
  if (!product) {
    return {
      name: "",
      slug: "",
      category: "tees",
      price: "",
      badge: "",
      description: "",
      details: "",
      sizes: defaultSizesFor("tees"),
      colors: [],
      photos: [],
      stock: {},
      isActive: true,
      featured: false,
      sortOrder: String(nextSortOrder),
    };
  }

  const colors = product.colors.map((c, i) => ({ id: `c${i}`, name: c.name, hex: c.hex }));
  const idFor = (name: string) => colors.find((c) => c.name === name)?.id ?? NO_COLOR;
  const rows = colors.length ? colors : [{ id: NO_COLOR, name: "" }];
  const stock: Record<string, string> = {};
  for (const row of rows) {
    for (const size of product.sizes) stock[`${row.id}|${size}`] = String(product.stock[stockKey(row.name, size)] ?? 0);
  }

  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: String(product.price),
    badge: product.badge ?? "",
    description: product.description,
    details: product.details.join("\n"),
    sizes: product.sizes,
    colors,
    photos: product.images.map((img) => ({ url: img.url, colorId: img.color ? idFor(img.color) : NO_COLOR })),
    stock,
    isActive: product.isActive,
    featured: product.featured,
    sortOrder: String(product.sortOrder),
  };
}

function toInput(form: FormState): ProductInput {
  const nameOf = (id: string) => form.colors.find((c) => c.id === id)?.name ?? "";
  const rows = form.colors.length ? form.colors : [{ id: NO_COLOR, name: "", hex: "" }];
  const stock: Record<string, number> = {};
  for (const row of rows) {
    for (const size of form.sizes) {
      const raw = form.stock[`${row.id}|${size}`]?.trim();
      stock[stockKey(row.name.trim(), size)] = raw ? Number(raw) : 0;
    }
  }

  return {
    name: form.name,
    slug: form.slug,
    category: form.category,
    price: form.price.trim() === "" ? NaN : Number(form.price),
    badge: form.badge || null,
    description: form.description,
    details: form.details.split("\n"),
    sizes: allSizes.filter((s) => form.sizes.includes(s)),
    colors: form.colors.map((c) => ({ name: c.name, hex: c.hex })),
    images: form.photos.map((p) => ({ url: p.url, ...(p.colorId ? { color: nameOf(p.colorId).trim() } : {}) })),
    stock,
    isActive: form.isActive,
    featured: form.featured,
    sortOrder: Number(form.sortOrder) || 0,
  };
}

const sectionTitle = "text-lg font-semibold";

export function ProductForm({ product, nextSortOrder = 0 }: { product: Product | null; nextSortOrder?: number }) {
  const [form, setForm] = useState(() => initialState(product, nextSortOrder));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [errors, setErrors] = useState<ProductInputErrors>({});
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [fillValue, setFillValue] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const notify = useAdminToast();
  const nextColorId = useRef(form.colors.length);
  const fileInput = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const colorRows = form.colors.length ? form.colors : [{ id: NO_COLOR, name: "", hex: "" }];

  /* ── Basics ── */

  const setName = (name: string) => update(slugTouched ? { name } : { name, slug: slugify(name) });

  const setCategory = (category: Category) => {
    const usingDefaults =
      !product && form.sizes.join() === allSizes.filter((s) => defaultSizesFor(form.category).includes(s)).join();
    update(usingDefaults ? { category, sizes: defaultSizesFor(category) } : { category });
  };

  const toggleSize = (size: string) =>
    update({ sizes: form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size] });

  /* ── Colours ── */

  const addColor = () => {
    const id = `c${nextColorId.current++}`;
    setForm((f) => {
      const stock = { ...f.stock };
      // The first colour inherits the stock entered before colours existed.
      if (f.colors.length === 0) {
        for (const size of f.sizes) stock[`${id}|${size}`] = stock[`${NO_COLOR}|${size}`] ?? "";
      }
      return { ...f, colors: [...f.colors, { id, name: "", hex: "#111111" }], stock };
    });
  };

  const updateColor = (id: string, patch: Partial<ColorRow>) =>
    update({ colors: form.colors.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const removeColor = (id: string) =>
    update({
      colors: form.colors.filter((c) => c.id !== id),
      photos: form.photos.map((p) => (p.colorId === id ? { ...p, colorId: NO_COLOR } : p)),
    });

  /* ── Photos ── */

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError("");
    const supabase = createBrowserSupabase();
    const list = Array.from(files);
    setUploading((n) => n + list.length);

    await Promise.all(
      list.map(async (file) => {
        try {
          if (!file.type.startsWith("image/")) throw new Error(`${file.name} isn't an image.`);
          if (file.size > MAX_PHOTO_MB * 1024 * 1024) throw new Error(`${file.name} is over ${MAX_PHOTO_MB}MB.`);
          const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
          const path = `products/${form.slug || "item"}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
          const { error } = await supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
          if (error) throw new Error(`Couldn't upload ${file.name}: ${error.message}`);
          const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
          setForm((f) => ({ ...f, photos: [...f.photos, { url: data.publicUrl, colorId: NO_COLOR }] }));
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : "Upload failed.");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    if (fileInput.current) fileInput.current.value = "";
  };

  const movePhoto = (index: number, by: -1 | 1) => {
    const photos = [...form.photos];
    const target = index + by;
    if (target < 0 || target >= photos.length) return;
    [photos[index], photos[target]] = [photos[target], photos[index]];
    update({ photos });
  };

  /* ── Stock ── */

  const setStock = (rowId: string, size: string, value: string) =>
    update({ stock: { ...form.stock, [`${rowId}|${size}`]: value.replace(/[^\d]/g, "") } });

  const fillAll = () => {
    const value = fillValue.replace(/[^\d]/g, "");
    if (!value) return;
    const stock = { ...form.stock };
    for (const row of colorRows) for (const size of form.sizes) stock[`${row.id}|${size}`] = value;
    update({ stock });
  };

  /* ── Save ── */

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || uploading > 0) return;
    const input = toInput(form);
    const { errors: found } = checkProductInput(input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await saveProduct(product?.id ?? null, input);
      if (result.ok) {
        notify(product ? "Changes saved" : "Product added");
        router.push("/admin/products");
      } else {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
      }
    });
  };

  const sortedSizes = allSizes.filter((s) => form.sizes.includes(s));

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <h2 className={sectionTitle}>Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Name" error={errors.name} className="sm:col-span-2">
              <TextInput
                id="name"
                value={form.name}
                onChange={(e) => setName(e.target.value)}
                placeholder="MDW Tee"
                invalid={!!errors.name}
              />
            </Field>
            <Field id="slug" label="Link" error={errors.slug} className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-muted">/product/</span>
                <TextInput
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                  }}
                  placeholder="mdw-tee-black"
                  invalid={!!errors.slug}
                />
              </div>
            </Field>
            <Field id="category" label="Category" error={errors.category}>
              <Select id="category" value={form.category} onChange={(e) => setCategory(e.target.value as Category)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="price" label="Price (GH₵)" error={errors.price}>
              <TextInput
                id="price"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => update({ price: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="85"
                invalid={!!errors.price}
              />
            </Field>
            <Field id="badge" label="Badge" optional>
              <Select id="badge" value={form.badge} onChange={(e) => update({ badge: e.target.value as Badge | "" })}>
                <option value="">None</option>
                {badges.map((b) => (
                  <option key={b} value={b}>
                    {b === "bestseller" ? "Bestseller" : b === "new" ? "New" : "Limited"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="sortOrder" label="Position in the shop" optional>
              <TextInput
                id="sortOrder"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(e) => update({ sortOrder: e.target.value.replace(/[^\d-]/g, "") })}
              />
            </Field>
            <Field id="description" label="Description" optional className="sm:col-span-2">
              <TextArea
                id="description"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="What makes this piece special?"
              />
            </Field>
            <Field id="details" label="Details (one per line)" optional className="sm:col-span-2">
              <TextArea
                id="details"
                value={form.details}
                onChange={(e) => update({ details: e.target.value })}
                placeholder={"100% cotton\nRelaxed fit\nMachine wash cold"}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className={sectionTitle}>Sizes</h2>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Sizes">
            {allSizes.map((size) => {
              const on = form.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  aria-pressed={on}
                  className={cn(
                    "min-w-14 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    on ? "border-night bg-night text-white dark:border-accent dark:bg-accent" : "border-ink/15 hover:border-ink/40",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {errors.sizes && <p className="mt-2 text-sm text-danger">{errors.sizes}</p>}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className={sectionTitle}>Colours</h2>
              <p className="text-sm text-muted">Leave empty if the product comes in one colour.</p>
            </div>
            <button
              type="button"
              onClick={addColor}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:border-ink/40"
            >
              <Plus className="size-4" aria-hidden="true" /> Add colour
            </button>
          </div>
          {form.colors.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {form.colors.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <label className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-ink/15">
                    <span className="sr-only">Swatch for {c.name || "colour"}</span>
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(c.id, { hex: e.target.value })}
                      className="absolute -inset-2 size-16 cursor-pointer"
                    />
                  </label>
                  <TextInput
                    aria-label="Colour name"
                    value={c.name}
                    onChange={(e) => updateColor(c.id, { name: e.target.value })}
                    placeholder="e.g. Black"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(c.id)}
                    aria-label={`Remove ${c.name || "colour"}`}
                    className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.colors && <p className="mt-2 text-sm text-danger">{errors.colors}</p>}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className={sectionTitle}>Photos</h2>
              <p className="text-sm text-muted">
                The first photo is the cover. Tag photos with a colour to show them when that colour is picked.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-night px-4 py-2 text-sm font-medium text-white hover:bg-accent"
            >
              {uploading > 0 ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="size-4" aria-hidden="true" />
              )}
              {uploading > 0 ? `Uploading ${uploading}…` : "Upload"}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => uploadPhotos(e.target.files)}
            />
          </div>
          {uploadError && <p className="mt-3 text-sm text-danger">{uploadError}</p>}
          {errors.images && <p className="mt-3 text-sm text-danger">{errors.images}</p>}
          {form.photos.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="mt-4 flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-ink/15 py-10 text-sm text-muted hover:border-accent hover:text-accent"
            >
              <ImagePlus className="size-6" aria-hidden="true" />
              Add photos (JPG, PNG or WebP, up to {MAX_PHOTO_MB}MB each)
            </button>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {form.photos.map((photo, i) => (
                <li key={photo.url} className="flex flex-col gap-2 rounded-2xl bg-paper p-2">
                  <div className="relative">
                    <ProductImage
                      src={photo.url}
                      alt=""
                      category={form.category}
                      sizes="200px"
                      className="aspect-[3/4] rounded-xl"
                    />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                        Cover
                      </span>
                    )}
                  </div>
                  {form.colors.length > 0 && (
                    <select
                      aria-label="Photo colour"
                      value={photo.colorId}
                      onChange={(e) =>
                        update({
                          photos: form.photos.map((p, j) => (j === i ? { ...p, colorId: e.target.value } : p)),
                        })
                      }
                      className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-xs"
                    >
                      <option value={NO_COLOR}>All colours</option>
                      {form.colors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || "Unnamed colour"}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => movePhoto(i, -1)}
                        disabled={i === 0}
                        aria-label="Move earlier"
                        className="grid size-8 place-items-center rounded-full hover:bg-surface disabled:opacity-30"
                      >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(i, 1)}
                        disabled={i === form.photos.length - 1}
                        aria-label="Move later"
                        className="grid size-8 place-items-center rounded-full hover:bg-surface disabled:opacity-30"
                      >
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ photos: form.photos.filter((_, j) => j !== i) })}
                      aria-label="Remove photo"
                      className="grid size-8 place-items-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className={sectionTitle}>Stock</h2>
              <p className="text-sm text-muted">How many of each option you have ready to sell.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                aria-label="Units for every option"
                inputMode="numeric"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                placeholder="10"
                className="w-20 rounded-full border border-ink/10 bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={fillAll}
                className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:border-ink/40"
              >
                Set all
              </button>
            </div>
          </div>
          {sortedSizes.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Pick at least one size first.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {form.colors.length ? "Colour" : ""}
                    </th>
                    {sortedSizes.map((s) => (
                      <th key={s} scope="col" className="px-1 py-2 text-center font-medium">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colorRows.map((row) => (
                    <tr key={row.id} className="border-t border-ink/5">
                      <th scope="row" className="py-2 pr-4 text-left font-medium whitespace-nowrap">
                        {form.colors.length ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="size-3.5 rounded-full ring-1 ring-ink/15" style={{ backgroundColor: row.hex }} />
                            {row.name || "Unnamed"}
                          </span>
                        ) : (
                          "Units"
                        )}
                      </th>
                      {sortedSizes.map((size) => (
                        <td key={size} className="px-1 py-2">
                          <input
                            aria-label={`Stock for ${[row.name, size].filter(Boolean).join(" ")}`}
                            inputMode="numeric"
                            value={form.stock[`${row.id}|${size}`] ?? ""}
                            onChange={(e) => setStock(row.id, size, e.target.value)}
                            placeholder="0"
                            className="w-full min-w-14 rounded-xl border border-ink/10 bg-paper px-2 py-2 text-center tabular-nums outline-none focus:border-accent"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {errors.stock && <p className="mt-2 text-sm text-danger">{errors.stock}</p>}
        </Card>
      </div>

      <div className="flex flex-col gap-4 xl:sticky xl:top-10">
        <Card className="flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-medium">Show in store</span>
              <span className="text-sm text-muted">Hidden products can&apos;t be bought.</span>
            </span>
            <Toggle checked={form.isActive} onChange={(v) => update({ isActive: v })} label="Show in store" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-medium">Feature on home page</span>
              <span className="text-sm text-muted">Shown in the hero.</span>
            </span>
            <Toggle checked={form.featured} onChange={(v) => update({ featured: v })} label="Feature on home page" />
          </label>
        </Card>
        <Card>
          <button
            type="submit"
            disabled={pending || uploading > 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          {formError && (
            <p className="mt-3 text-center text-sm text-danger" role="alert">
              {formError}
            </p>
          )}
          <Link href="/admin/products" className="mt-3 block text-center text-sm text-muted hover:text-ink">
            Cancel
          </Link>
          {product && (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="mt-2 block text-center text-sm text-accent hover:underline"
            >
              View in store
            </Link>
          )}
        </Card>
      </div>
    </form>
  );
}
