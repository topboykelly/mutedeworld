"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories, type Category } from "@/data/store";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/product";
import { ProductCard } from "./ProductCard";
import { Reveal, Section, easeOut } from "./ui/Section";
import { Accent, SectionHeading } from "./ui/SectionHeading";

type Filter = Category | "all";

export function Collection({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const present = new Set(products.map((p) => p.category));
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    ...categories.filter((c) => present.has(c.id)),
  ];

  const visible = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <Section id="collection">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <SectionHeading
            label="Shop the Drop"
            title={
              <>
                The <Accent>Collection</Accent>
              </>
            }
          />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-muted" aria-live="polite">
            Showing <span className="font-semibold text-ink">{visible.length}</span>{" "}
            {visible.length === 1 ? "piece" : "pieces"}
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-10">
        <div
          role="toolbar"
          aria-label="Filter by category"
          className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
        >
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={isActive}
                className={cn(
                  "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-white" : "bg-surface text-ink/70 hover:text-ink dark:ring-1 dark:ring-white/5",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-night dark:bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-8">
        <motion.ul layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product, i) => (
              <motion.li
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: easeOut, delay: Math.min(i, 8) * 0.03 }}
              >
                <ProductCard product={product} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        {products.length === 0 && (
          <p className="rounded-3xl bg-surface p-10 text-center text-muted">
            New pieces are on the way. Check back soon.
          </p>
        )}
      </Reveal>
    </Section>
  );
}
