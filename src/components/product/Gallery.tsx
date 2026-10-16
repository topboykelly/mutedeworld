"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Category } from "@/data/store";
import { cn } from "@/lib/cn";
import type { ProductPhoto } from "@/lib/product";
import { ProductImage } from "../ui/ProductImage";
/** Remount with a new `key` when the photo set changes so the selection resets. */
export function Gallery({ photos, name, category }: { photos: ProductPhoto[]; name: string; category: Category }) {
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const viewerRef = useRef<HTMLUListElement>(null);
  const current = photos[index]?.url ?? "";

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const slide = el.firstElementChild as HTMLElement | null;
      const width = slide?.offsetWidth || el.clientWidth;
      const i = Math.round(el.scrollLeft / Math.max(width, 1));
      setIndex(Math.max(0, Math.min(photos.length - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  useEffect(() => {
    setIndex(0);
    setViewerOpen(false);
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [photos]);

  const scrollViewerTo = (i: number, smooth = true) => {
    const el = viewerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };

  // Swipe in the enlarged viewer updates the selected photo.
  useEffect(() => {
    const el = viewerRef.current;
    if (!viewerOpen || !el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
      setIndex(Math.max(0, Math.min(photos.length - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [viewerOpen, photos.length]);

  // Land on the tapped photo when the viewer opens.
  useLayoutEffect(() => {
    if (!viewerOpen) return;
    const el = viewerRef.current;
    if (!el) return;
    const go = () => {
      el.scrollLeft = index * el.clientWidth;
    };
    go();
    requestAnimationFrame(go);
    // Only when opening — index is already set by openViewer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerOpen(false);
      if (e.key === "ArrowRight") {
        setIndex((i) => {
          const next = Math.min(photos.length - 1, i + 1);
          scrollViewerTo(next);
          return next;
        });
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => {
          const next = Math.max(0, i - 1);
          scrollViewerTo(next);
          return next;
        });
      }
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [viewerOpen, photos.length]);

  const openViewer = (i: number) => {
    setIndex(i);
    setViewerOpen(true);
  };

  const pickViewerPhoto = (i: number) => {
    setIndex(i);
    scrollViewerTo(i);
  };

  return (
    <>
      <div className="flex min-w-0 w-full flex-col gap-1.5 md:flex-row-reverse md:items-start md:gap-3">
        <div className="relative min-w-0 w-full md:flex-1">
          <ul
            ref={scrollerRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:hidden"
            aria-label="Photos"
          >
            {photos.map((photo, i) => (
              <li key={photo.url} className="w-[86%] shrink-0 snap-center pr-2 last:pr-0">
                <button
                  type="button"
                  onClick={() => openViewer(i)}
                  aria-label={`View ${name} photo ${i + 1} larger`}
                  className="block w-full"
                >
                  <ProductImage
                    src={photo.url}
                    alt={i === 0 ? name : `${name} photo ${i + 1}`}
                    category={category}
                    sizes="90vw"
                    preload={i === 0}
                    className="aspect-[4/5] max-h-[36svh] w-full rounded-2xl"
                  />
                </button>
              </li>
            ))}
          </ul>

          {photos.length > 1 && (
            <p className="mt-1 text-center text-xs text-muted md:hidden" aria-live="polite">
              {index + 1} / {photos.length} · tap to enlarge
            </p>
          )}

          <button
            type="button"
            onClick={() => openViewer(index)}
            aria-label={`View ${name} larger`}
            className="relative hidden w-full md:block"
          >
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
          </button>
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
                  onDoubleClick={() => openViewer(i)}
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

      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            key="viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} photos`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-70 flex flex-col bg-surface"
          >
            <div className="flex items-center justify-end px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
              <button
                type="button"
                onClick={() => setViewerOpen(false)}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-full bg-paper text-ink transition-colors hover:bg-accent-soft"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <ul
                ref={viewerRef}
                className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
                aria-label={`${name} enlarged photos`}
              >
                {photos.map((photo, i) => (
                  <li key={photo.url} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-3">
                    <div className="relative h-[min(72svh,100%)] w-full max-w-3xl">
                      <ProductImage
                        src={photo.url}
                        alt={`${name} photo ${i + 1}`}
                        category={category}
                        sizes="100vw"
                        fit="contain"
                        className="h-full w-full rounded-2xl bg-paper"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              {photos.length > 1 && (
                <p className="pointer-events-none absolute right-4 bottom-2 rounded-full bg-night/70 px-2.5 py-1 text-xs font-medium text-white">
                  {index + 1}/{photos.length}
                </p>
              )}
            </div>

            {photos.length > 1 && (
              <ul className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {photos.map((photo, i) => (
                  <li key={photo.url} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => pickViewerPhoto(i)}
                      aria-label={`Show photo ${i + 1}`}
                      aria-current={i === index || undefined}
                      className={cn(
                        "block w-14 overflow-hidden rounded-xl ring-2 transition sm:w-16",
                        i === index ? "ring-accent" : "ring-transparent opacity-60",
                      )}
                    >
                      <ProductImage src={photo.url} alt="" category={category} sizes="64px" className="aspect-square" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
