"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/data/store";
import { cn } from "@/lib/cn";
import type { ProductPhoto } from "@/lib/product";
import { ProductImage } from "../ui/ProductImage";

/** Remount with a new `key` when the photo set changes so the selection resets. */
export function Gallery({ photos, name, category }: { photos: ProductPhoto[]; name: string; category: Category }) {
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const current = photos[index]?.url ?? "";

  // Keep the selected index in sync when the user swipes the mobile carousel.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(Math.max(0, Math.min(photos.length - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  useEffect(() => {
    setIndex(0);
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [photos]);

  return (
    <div className="flex min-w-0 w-full flex-col gap-2 md:flex-row-reverse md:items-start md:gap-3">
      {/* Mobile: swipeable full-bleed carousel (peek of the next photo). Desktop: single selected image. */}
      <div className="relative min-w-0 w-full md:flex-1">
        <ul
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:hidden"
          aria-label="Photos"
        >
          {photos.map((photo, i) => (
            <li key={photo.url} className="w-[86%] shrink-0 snap-center pr-2.5 last:pr-0">
              <ProductImage
                src={photo.url}
                alt={i === 0 ? name : `${name} photo ${i + 1}`}
                category={category}
                sizes="90vw"
                preload={i === 0}
                className="aspect-[4/5] max-h-[40svh] w-full rounded-2xl"
              />
            </li>
          ))}
        </ul>

        {photos.length > 1 && (
          <p className="mt-2 text-center text-xs text-muted md:hidden" aria-live="polite">
            {index + 1} / {photos.length}
          </p>
        )}

        <div className="relative hidden md:block">
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
                className="aspect-[3/4] rounded-4xl"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {photos.length > 1 && (
        <ul
          className="no-scrollbar hidden md:sticky md:top-28 md:flex md:w-20 md:max-h-[min(36rem,calc(100vh-8rem))] md:flex-col md:gap-2 md:overflow-y-auto"
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
                  "block w-20 overflow-hidden rounded-2xl ring-2 transition",
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
