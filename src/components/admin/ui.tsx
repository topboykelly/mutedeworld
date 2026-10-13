import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/data/store";
import { orderStatuses } from "@/data/store";

export function AdminHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-3xl bg-surface p-5 sm:p-6 dark:ring-1 dark:ring-white/5", className)}>{children}</div>;
}

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-accent text-white",
  confirmed: "bg-accent-soft text-accent-dark dark:text-accent-light",
  dispatched: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  cancelled: "bg-ink/10 text-muted line-through",
};

export function StatusBadge({ status }: { status: string }) {
  const known = orderStatuses.find((s) => s.id === status);
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        known ? statusStyles[known.id] : "bg-ink/10 text-muted",
      )}
    >
      {known?.label ?? status}
    </span>
  );
}

export function AdminSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-56 animate-pulse rounded-2xl bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-surface" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-3xl bg-surface" />
    </div>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

export function formatDate(value: string) {
  return dateFormat.format(new Date(value));
}

/** Ghana numbers like 024 123 4567 become 233241234567 for wa.me links. */
export function internationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  return digits;
}
