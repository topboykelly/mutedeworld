"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { importStarterProducts } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { useAdminToast } from "./AdminToast";

export function ImportStarterButton({ prominent = false }: { prominent?: boolean }) {
  const router = useRouter();
  const notify = useAdminToast();
  const [pending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      const result = await importStarterProducts();
      if (!result.ok) notify(result.error, false);
      else if (result.count) notify(`Imported ${result.count} products`);
      else notify("All starter products are already in your catalogue");
      router.refresh();
    });

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
          prominent ? "bg-night text-white hover:bg-accent" : "border border-ink/15 hover:border-ink/40",
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="size-4" aria-hidden="true" />
        )}
        Import starter products
      </button>
    </div>
  );
}
