import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function QtyStepper({
  value,
  onChange,
  label,
  max,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  max?: number;
  className?: string;
}) {
  const btn =
    "grid size-8 place-items-center rounded-full transition-colors hover:bg-accent-soft hover:text-accent disabled:pointer-events-none disabled:opacity-35";
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className={cn("inline-flex items-center gap-1 rounded-full border border-ink/10 p-0.5", className)}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className={btn}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={max !== undefined && value >= max}
        aria-label="Increase quantity"
        className={btn}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
