"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { Category } from "@/data/store";
import { cn } from "@/lib/cn";
import { Silhouette } from "./Silhouette";

/** Product photo with the category silhouette underneath, which stays visible if the photo is missing. */
export function ProductImage({
  src,
  alt,
  category,
  sizes,
  preload = false,
  className,
  imageClassName,
  fit = "cover",
}: {
  src: string;
  alt: string;
  category: Category;
  sizes: string;
  /** Use for the above-the-fold (LCP) image. */
  preload?: boolean;
  className?: string;
  imageClassName?: string;
  /** cover fills the card; contain shows the whole photo (lightbox). */
  fit?: "cover" | "contain";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;

  // The image can fail before hydration, in which case onError never reaches React.
  const checkLoaded = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth === 0) setFailedSrc(src);
    },
    [src],
  );

  return (
    <div className={cn("relative overflow-hidden bg-accent-soft", className)}>
      <div className="absolute inset-0 grid place-items-center">
        <Silhouette category={category} className="h-1/2 w-1/2" />
      </div>
      {!failed && (
        <Image
          key={src}
          ref={checkLoaded}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          loading={preload ? "eager" : undefined}
          onError={() => setFailedSrc(src)}
          // Inline so a stale CSS cache can't undo the fit.
          style={{ objectFit: fit, objectPosition: "center" }}
          className={cn("text-transparent", imageClassName)}
        />
      )}
    </div>
  );
}
