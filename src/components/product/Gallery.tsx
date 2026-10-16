"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/data/store";
import { cn } from "@/lib/cn";
import type { ProductPhoto } from "@/lib/product";
import { ProductImage } from "../ui/ProductImage";

/** Remount with a new `key` when the photo set changes so the selection resets. */
export function Gallery({ photos, name, category }: { photos: ProductPhoto[]; name: string; category: Category }) {
  const [index, setIndex] = useState(0);
  const current = photos[index]?.url ?? "";

  return (
    <div className="flex min-w-0 w-full flex-col gap-2 md:flex-row-reverse md:items-start md:gap-3">
      <div className="relative min-w-0 w-full md:flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductImage
              src={current}
              alt={name}
              category={category}
              sizes="(min-width: 1024px) 45vw, 100vw"
              preload={index === 0}
              /* Shorter on phones so name / price / size fit in the first viewport. */
              className="aspect-square max-h-[38svh] w-full rounded-3xl md:aspect-[3/4] md:max-h-none md:rounded-4xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {photos.length > 1 && (
        <ul
          className="no-scrollbar flex min-w-0 w-full max-w-full gap-2 overflow-x-auto md:sticky md:top-28 md:w-20 md:max-h-[min(36rem,calc(100vh-8rem))] md:flex-col md:overflow-x-hidden md:overflow-y-auto"
          aria-label="Photos"
        >
          {photos.map((photo, i) => (
            <li key={photo.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index || undefined}
                className={cn(
                  "block w-12 overflow-hidden rounded-xl ring-2 transition sm:w-14 md:w-20 md:rounded-2xl",
                  i === index ? "ring-accent" : "ring-transparent opacity-70 hover:opacity-100",
                )}
              >
                <ProductImage src={photo.url} alt="" category={category} sizes="80px" className="aspect-[3/4]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
