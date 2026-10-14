"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { deleteProduct, setProductFlag } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { useAdminToast } from "./AdminToast";

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-accent" : "bg-ink/15",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function ProductRowActions({
  id,
  name,
  isActive,
  featured,
}: {
  id: string;
  name: string;
  isActive: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const notify = useAdminToast();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, success = "Changes saved") =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) notify(success);
      else notify(result.error ?? "Something went wrong.", false);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-1 sm:justify-end sm:gap-3">
      <label className="mr-auto flex items-center gap-2 text-xs text-muted sm:mr-0">
        <Toggle
          checked={isActive}
          disabled={pending}
          label={`Show ${name} in the store`}
          onChange={(v) => run(() => setProductFlag(id, "is_active", v))}
        />
        {isActive ? "Live" : "Hidden"}
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setProductFlag(id, "featured", !featured))}
        aria-pressed={featured}
        aria-label={featured ? `Unfeature ${name}` : `Feature ${name} on the home page`}
        title={featured ? "Featured in the hero" : "Feature in the hero"}
        className={cn(
          "grid size-9 place-items-center rounded-full transition-colors hover:bg-paper",
          featured ? "text-amber-500" : "text-muted",
        )}
      >
        <Star className={cn("size-4", featured && "fill-current")} aria-hidden="true" />
      </button>
      <Link
        href={`/admin/products/${id}`}
        aria-label={`Edit ${name}`}
        className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete "${name}"? This can't be undone. To hide it instead, switch it off.`)) {
            run(() => deleteProduct(id), "Product deleted");
          }
        }}
        aria-label={`Delete ${name}`}
        className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
