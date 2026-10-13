import { Truck } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD } from "@/data/store";
import { formatCedi } from "@/lib/format";
import { cn } from "@/lib/cn";

export function FreeDeliveryMeter({ subtotal, className }: { subtotal: number; className?: string }) {
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);

  return (
    <div className={cn("rounded-2xl bg-accent-soft p-4", className)}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Truck className="size-4 shrink-0 text-accent" aria-hidden="true" />
        {remaining > 0 ? (
          <span>
            Add <span className="text-accent">{formatCedi(remaining)}</span> more for free delivery in Accra
          </span>
        ) : (
          <span>You&apos;ve unlocked free delivery in Accra</span>
        )}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full origin-left rounded-full bg-accent transition-transform duration-500"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}
