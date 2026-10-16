"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, ShoppingBag, Truck } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, LOW_STOCK_THRESHOLD, categoryLabel, oneSize } from "@/data/store";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { whatsappUrl } from "@/lib/contact";
import { formatCedi } from "@/lib/format";
import { colorStock, firstAvailable, photosFor, stockFor, variantLabel, type Product } from "@/lib/product";
import { badgeStyles } from "../ProductCard";
import { PillButton } from "../ui/Button";
import { QtyStepper } from "../ui/QtyStepper";
import { WhatsappIcon } from "../ui/SocialIcons";
import { Gallery } from "./Gallery";
import { SizeGuide } from "./SizeGuide";

export function ProductView({ product }: { product: Product }) {
  const { addItem, qtyInCart, notify } = useCart();
  const initial = firstAvailable(product);
  const [color, setColor] = useState(initial?.color ?? product.colors[0]?.name ?? "");
  const [size, setSize] = useState(initial?.size ?? "");
  const [qty, setQty] = useState(1);

  const available = size ? stockFor(product, color, size) : 0;
  const room = Math.max(0, available - qtyInCart(product.id, color, size));
  const soldOut = !initial;
  const photos = photosFor(product, color);
  const showSizeGuide = product.sizes.some((s) => !oneSize.includes(s));

  const pickColor = (name: string) => {
    setColor(name);
    setQty(1);
    if (size && stockFor(product, name, size) > 0) return;
    setSize(product.sizes.find((s) => stockFor(product, name, s) > 0) ?? "");
  };

  const pickSize = (s: string) => {
    setSize(s);
    setQty(1);
  };

  const add = () => {
    if (!size || room === 0) return;
    addItem(product.id, color, size, Math.min(qty, room));
    setQty(1);
    notify("Added to cart");
  };

  const askText = `Hi, I'm interested in the ${product.name}${
    color || size ? ` (${variantLabel(color, size)})` : ""
  } at ${formatCedi(product.price)}. Is it available?`;

  const addLabel = size && room === 0 ? "All available are in your cart" : "Add to Cart";
  const addDisabled = !size || room === 0;

  return (
    <div className="grid min-w-0 gap-2 pb-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:pb-0">
      <div className="min-w-0">
        <Gallery key={color} photos={photos} name={product.name} category={product.category} />
      </div>

      <div className="lg:pt-4">
        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm text-muted lg:flex">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href="/#collection" className="hover:text-accent">
            {categoryLabel(product.category)}
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2 lg:mt-4">
          {soldOut ? (
            <span className="rounded-full bg-night px-3 py-1 text-xs font-medium text-white">Sold out</span>
          ) : (
            product.badge && (
              <span className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize", badgeStyles[product.badge])}>
                {product.badge}
              </span>
            )
          )}
        </div>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl lg:mt-3 lg:text-5xl">{product.name}</h1>
        <p className="mt-1 text-xl font-semibold text-accent lg:mt-3 lg:text-3xl">{formatCedi(product.price)}</p>

        {product.colors.length > 0 && (
          <fieldset className="mt-3 lg:mt-8">
            <legend className="text-sm font-medium">
              Colour: <span className="text-muted">{color}</span>
            </legend>
            <div className="mt-1.5 flex flex-wrap gap-2 lg:mt-3 lg:gap-2.5">
              {product.colors.map((c) => {
                const out = colorStock(product, c.name) === 0;
                const selected = c.name === color;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => pickColor(c.name)}
                    aria-pressed={selected}
                    aria-label={out ? `${c.name} (sold out)` : c.name}
                    title={out ? `${c.name} (sold out)` : c.name}
                    className={cn(
                      "relative grid size-9 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-paper transition lg:size-11",
                      selected ? "ring-accent" : "ring-transparent hover:ring-ink/20",
                    )}
                  >
                    <span className="size-full rounded-full ring-1 ring-ink/15" style={{ backgroundColor: c.hex }} />
                    {out && (
                      <span className="absolute inset-0 m-auto h-0.5 w-full rotate-45 rounded bg-danger" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <fieldset className="mt-3 lg:mt-8">
          <div className="flex items-center justify-between gap-4">
            <legend className="text-sm font-medium">
              Size{size && <span className="text-muted">: {size}</span>}
            </legend>
            {showSizeGuide && <SizeGuide />}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2 lg:mt-3">
            {product.sizes.map((s) => {
              const out = stockFor(product, color, s) === 0;
              const selected = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => pickSize(s)}
                  disabled={out}
                  aria-pressed={selected}
                  className={cn(
                    "min-w-12 rounded-full border px-3 py-2 text-sm font-medium transition-colors lg:min-w-14 lg:px-4 lg:py-2.5",
                    selected
                      ? "border-night bg-night text-white dark:border-accent dark:bg-accent"
                      : "border-ink/15 bg-surface hover:border-ink/40",
                    out && "cursor-not-allowed text-muted line-through opacity-50 hover:border-ink/15",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="mt-2 min-h-5 text-sm lg:mt-3" aria-live="polite">
            {soldOut ? (
              <span className="text-muted">This piece is sold out. Message us to ask about a restock.</span>
            ) : !size ? (
              <span className="text-muted">Pick a size.</span>
            ) : available <= LOW_STOCK_THRESHOLD ? (
              <span className="font-medium text-danger">Only {available} left in this option</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Check className="size-4 text-accent" aria-hidden="true" /> In stock
              </span>
            )}
          </p>
        </fieldset>

        {!soldOut && (
          <div className="mt-5 hidden flex-wrap items-center gap-3 lg:mt-6 lg:flex">
            <QtyStepper
              value={qty}
              max={Math.max(1, room)}
              onChange={setQty}
              label={product.name}
              className="bg-surface p-1.5"
            />
            <PillButton onClick={add} disabled={addDisabled} variant="dark" className="flex-1">
              <ShoppingBag className="size-4" aria-hidden="true" />
              {addLabel}
            </PillButton>
          </div>
        )}

        <a
          href={whatsappUrl(askText)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-medium transition-colors hover:border-[#25d366] hover:text-[#1da851] lg:flex"
        >
          <WhatsappIcon className="size-4" />
          Ask about this on WhatsApp
        </a>

        {/* Mobile: sticky actions always in reach, like common shop apps. */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <a
              href={whatsappUrl(askText)}
              target="_blank"
              rel="noreferrer"
              aria-label="Ask about this on WhatsApp"
              className="grid size-12 shrink-0 place-items-center rounded-2xl border border-ink/15 text-[#1da851] transition-colors hover:border-[#25d366]"
            >
              <WhatsappIcon className="size-5" />
            </a>
            {!soldOut ? (
              <PillButton onClick={add} disabled={addDisabled} variant="dark" className="min-h-12 flex-1 rounded-2xl">
                <ShoppingBag className="size-4" aria-hidden="true" />
                {addLabel}
              </PillButton>
            ) : (
              <a
                href={whatsappUrl(askText)}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-night px-5 text-sm font-medium text-white"
              >
                Ask about restock
              </a>
            )}
          </div>
        </div>

        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-accent-soft px-4 py-2.5 text-sm lg:mt-6">
          <Truck className="size-4 shrink-0 text-accent" aria-hidden="true" />
          Free delivery in Accra on orders over {formatCedi(FREE_DELIVERY_THRESHOLD)}.
        </p>

        {(product.description || product.details.length > 0) && (
          <div className="mt-3 border-t border-ink/10 pt-3 lg:mt-8 lg:pt-8">
            {product.description && <p className="text-sm text-muted lg:text-base">{product.description}</p>}
            {product.details.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5 text-sm lg:mt-5 lg:gap-2">
                {product.details.map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
