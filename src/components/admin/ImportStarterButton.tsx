"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { importStarterProducts } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

export function ImportStarterButton({ prominent = false }: { prominent?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const run = () =>
    startTransition(async () => {
      const result = await importStarterProducts();
      setMessage(
        result.ok
          ? result.count
            ? `Imported ${result.count} products.`
            : "All starter products are already in your catalogue."
          : result.error,
      );
      router.refresh();
    });

  return (
    <div className="flex items-center gap-3">
      {message && <span className="text-sm text-muted">{message}</span>}
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
