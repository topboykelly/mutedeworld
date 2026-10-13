"use client";

import Link from "next/link";
import { ChevronDown, Trash2 } from "lucide-react";
import { LOW_STOCK_THRESHOLD, categoryLabel } from "@/data/store";
import { useCart, type CartLine } from "@/lib/cart";
import { formatCedi } from "@/lib/format";
import { colorStock, photosFor, stockFor } from "@/lib/product";
import { ProductImage } from "../ui/ProductImage";
import { QtyStepper } from "../ui/QtyStepper";

function VariantSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string; disabled: boolean }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-full border border-ink/10 bg-surface py-1.5 pr-8 pl-3.5 text-sm font-medium outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
}

export function CartItemRow({ line }: { line: CartLine }) {
  const { updateQty, updateVariant, removeItem } = useCart();
  const { product, available } = line;
  const soldOut = available === 0;

  const pickColor = (color: string) => {
    const size = stockFor(product, color, line.size) > 0
      ? line.size
      : (product.sizes.find((s) => stockFor(product, color, s) > 0) ?? line.size);
    updateVariant(line.key, color, size);
  };

  return (
    <div className="flex gap-4 rounded-3xl bg-paper p-3 sm:gap-5">
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <ProductImage
          src={photosFor(product, line.color)[0]?.url ?? ""}
          alt={product.name}
          category={product.category}
          sizes="120px"
          className="aspect-[3/4] w-24 rounded-2xl sm:w-28"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">{categoryLabel(product.category)}</p>
            <Link href={`/product/${product.slug}`} className="mt-0.5 block truncate text-lg font-semibold hover:text-accent">
              {product.name}
            </Link>
            <p className="text-sm text-muted">{formatCedi(product.price)} each</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.key)}
            aria-label={`Remove ${product.name}`}
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {product.colors.length > 0 && (
              <VariantSelect
                id={`color-${line.key}`}
                label={`Colour for ${product.name}`}
                value={line.color}
                onChange={pickColor}
                options={product.colors.map((c) => ({
                  value: c.name,
                  label: colorStock(product, c.name) > 0 ? c.name : `${c.name} (sold out)`,
                  disabled: colorStock(product, c.name) === 0,
                }))}
              />
            )}
            {product.sizes.length > 1 ? (
              <VariantSelect
                id={`size-${line.key}`}
                label={`Size for ${product.name}`}
                value={line.size}
                onChange={(size) => updateVariant(line.key, line.color, size)}
                options={product.sizes.map((s) => {
                  const left = stockFor(product, line.color, s);
                  return { value: s, label: left > 0 ? `Size ${s}` : `Size ${s} (sold out)`, disabled: left === 0 };
                })}
              />
            ) : (
              <span className="rounded-full border border-ink/10 bg-surface px-3.5 py-1.5 text-sm font-medium">
                {line.size}
              </span>
            )}
            {!soldOut && (
              <QtyStepper
                value={line.qty}
                max={available}
                onChange={(q) => updateQty(line.key, q)}
                label={product.name}
                className="bg-surface"
              />
            )}
          </div>
          {soldOut ? (
            <p className="text-sm font-medium text-danger">Sold out. Please remove it.</p>
          ) : (
            <p className="text-lg font-semibold text-accent">{formatCedi(line.lineTotal)}</p>
          )}
        </div>
        {!soldOut && available <= LOW_STOCK_THRESHOLD && (
          <p className="mt-2 text-xs font-medium text-accent">Only {available} left in this option</p>
        )}
      </div>
    </div>
  );
}
