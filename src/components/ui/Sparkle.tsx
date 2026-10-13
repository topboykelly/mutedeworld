import { cn } from "@/lib/cn";

/** The small three-stroke burst used next to headings. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("inline-block text-accent", className)}
    >
      <path d="M6 13V4" />
      <path d="M11 16l7-7" />
      <path d="M13 21h8" />
    </svg>
  );
}

/** Four-point star used as a separator and bullet. */
export function Star4({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("inline-block shrink-0", className)}
    >
      <path d="M12 0C12.8 6.4 17.6 11.2 24 12C17.6 12.8 12.8 17.6 12 24C11.2 17.6 6.4 12.8 0 12C6.4 11.2 11.2 6.4 12 0Z" />
    </svg>
  );
}
