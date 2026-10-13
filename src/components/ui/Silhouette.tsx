import type { Category } from "@/data/store";
import { cn } from "@/lib/cn";

const shapes: Record<Category, React.ReactNode> = {
  tees: (
    <>
      <path d="M28 12 L18 30 L20 72 L62 72 L64 30 L52 12 Z" opacity="0.22" />
      <path d="M28 12 Q45 18 52 12 L18 12 Z" opacity="0.1" />
      <path d="M28 12 Q45 19 52 12 L64 30 Q45 36 18 30 Z" opacity="0.35" />
    </>
  ),
  joggers: (
    <>
      <path d="M22 10 L18 55 L14 90 L36 90 L45 58 L54 90 L76 90 L72 55 L68 10 Z" opacity="0.2" />
      <path d="M22 10 Q45 16 68 10 L22 10 Z" opacity="0.3" />
      <path d="M14 70 Q25 74 36 70" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M54 70 Q65 74 76 70" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
    </>
  ),
  shorts: (
    <>
      <path d="M22 10 L18 50 L14 65 L36 65 L45 40 L54 65 L76 65 L72 50 L68 10 Z" opacity="0.22" />
      <line x1="22" y1="10" x2="68" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </>
  ),
  "baggy-jeans": (
    <>
      <path d="M18 8 L10 55 L8 90 L34 90 L45 55 L56 90 L82 90 L80 55 L72 8 Z" opacity="0.2" />
      <line x1="18" y1="8" x2="72" y2="8" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M8 60 Q21 65 34 60" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.35" />
      <path d="M56 60 Q69 65 82 60" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.35" />
    </>
  ),
  socks: (
    <>
      <path
        d="M32 10 L28 10 L28 55 Q28 75 20 82 Q14 88 20 92 L55 92 Q62 88 58 80 Q52 72 52 55 L52 10 Z"
        opacity="0.2"
      />
      <path d="M28 10 L52 10 L52 28 L28 28 Z" opacity="0.15" />
      <path d="M20 85 Q37 80 55 85" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />
    </>
  ),
  "tank-tops": (
    <>
      <path d="M33 8 L24 22 L22 75 L68 75 L66 22 L57 8 Z" opacity="0.22" />
      <path d="M33 8 Q45 6 57 8 L57 22 Q45 25 33 22 Z" opacity="0.1" />
      <line x1="33" y1="8" x2="33" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      <line x1="57" y1="8" x2="57" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
    </>
  ),
  "knit-bodysuit": (
    <>
      <path d="M28 8 L18 28 L16 65 Q16 80 45 82 Q74 80 74 65 L72 28 L62 8 Z" opacity="0.2" />
      <path d="M28 8 Q45 15 62 8 L72 28 Q45 34 18 28 Z" opacity="0.32" />
      <path d="M16 48 Q45 54 74 48" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.35" />
      <path d="M38 82 L38 92 L52 92 L52 82" opacity="0.18" />
    </>
  ),
  caps: (
    <>
      <ellipse cx="45" cy="52" rx="32" ry="16" opacity="0.2" />
      <path d="M13 52 Q45 20 77 52" opacity="0.25" />
      <path d="M13 52 Q45 22 77 52 Q45 38 13 52 Z" opacity="0.15" />
      <rect x="13" y="50" width="22" height="6" rx="3" opacity="0.3" />
      <line x1="30" y1="36" x2="60" y2="36" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    </>
  ),
};

/** Placeholder garment drawing shown until a product photo is available. */
export function Silhouette({ category, className }: { category: Category; className?: string }) {
  return (
    <svg
      viewBox="0 0 90 95"
      fill="currentColor"
      aria-hidden="true"
      className={cn("text-accent-dark dark:text-accent-light", className)}
    >
      {shapes[category]}
    </svg>
  );
}
