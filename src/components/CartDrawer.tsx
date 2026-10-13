"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { categoryLabel } from "@/data/store";
import { useCart } from "@/lib/cart";
import { formatCedi } from "@/lib/format";
import { photosFor } from "@/lib/product";
import { PillButton, PillLink } from "./ui/Button";
import { FreeDeliveryMeter } from "./ui/FreeDeliveryMeter";
import { ProductImage } from "./ui/ProductImage";
import { QtyStepper } from "./ui/QtyStepper";
import { easeOut } from "./ui/Section";

export function CartDrawer() {
  const { isOpen, closeCart, lines, count, subtotal, updateQty, removeItem } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="cart-drawer" className="fixed inset-0 z-60">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-2xl sm:inset-y-3 sm:right-3 sm:rounded-3xl dark:ring-1 dark:ring-white/10"
          >
            <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="text-xl font-semibold">
                Your Cart <span className="text-muted">({count})</span>
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="grid size-10 place-items-center rounded-full bg-paper transition-colors hover:bg-accent-soft hover:text-accent"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="grid size-20 place-items-center rounded-full bg-accent-soft text-accent">
                  <ShoppingBag className="size-8" aria-hidden="true" />
                </span>
                <p className="text-lg font-semibold">Your cart is empty</p>
                <p className="text-muted">Add something you love from the collection.</p>
                <PillButton onClick={closeCart} variant="dark" arrow className="mt-2">
                  Keep Shopping
                </PillButton>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <FreeDeliveryMeter subtotal={subtotal} className="mb-4" />
                  <ul className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {lines.map((line) => (
                        <motion.li
                          key={line.key}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.3, ease: easeOut }}
                          className="flex gap-4 rounded-2xl bg-paper p-2.5"
                        >
                          <Link href={`/product/${line.product.slug}`} onClick={closeCart} className="shrink-0">
                            <ProductImage
                              src={photosFor(line.product, line.color)[0]?.url ?? ""}
                              alt={line.product.name}
                              category={line.product.category}
                              sizes="80px"
                              className="aspect-[3/4] w-20 rounded-xl"
                            />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col py-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-semibold">{line.product.name}</p>
                                <p className="text-xs text-muted">
                                  {[categoryLabel(line.product.category), line.color, `Size ${line.size}`]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(line.key)}
                                aria-label={`Remove ${line.product.name}`}
                                className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                              {line.available > 0 ? (
                                <>
                                  <QtyStepper
                                    value={line.qty}
                                    max={line.available}
                                    onChange={(q) => updateQty(line.key, q)}
                                    label={line.product.name}
                                  />
                                  <p className="font-semibold text-accent">{formatCedi(line.lineTotal)}</p>
                                </>
                              ) : (
                                <p className="text-sm font-medium text-danger">Sold out. Please remove it.</p>
                              )}
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <footer className="border-t border-ink/10 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-2xl font-semibold">{formatCedi(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">Delivery is calculated at checkout.</p>
                  <PillLink href="/cart" onClick={closeCart} variant="accent" arrow className="mt-4 w-full justify-between">
                    Checkout
                  </PillLink>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-3 w-full text-center text-sm font-medium text-muted transition-colors hover:text-ink"
                  >
                    Continue shopping
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
