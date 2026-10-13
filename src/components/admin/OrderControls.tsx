"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveOrderNote, setOrderStatus } from "@/app/admin/actions";
import { orderStatuses } from "@/data/store";
import { cn } from "@/lib/cn";
import { TextArea } from "../ui/fields";

export function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const cancelled = status === "cancelled";

  const change = (next: string) => {
    if (next === status || pending) return;
    if (next === "cancelled" && !confirm("Cancel this order? Its items go back into stock and it can't be reopened.")) {
      return;
    }
    startTransition(async () => {
      setError("");
      const result = await setOrderStatus(orderId, next);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Order status">
        {orderStatuses.map((s) => {
          const active = s.id === status;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => change(s.id)}
              disabled={pending || (cancelled && !active)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
                active
                  ? s.id === "cancelled"
                    ? "border-danger bg-danger text-white"
                    : "border-night bg-night text-white dark:border-accent dark:bg-accent"
                  : "border-ink/15 hover:border-ink/40 disabled:opacity-40",
              )}
            >
              {s.label}
            </button>
          );
        })}
        {pending && <Loader2 className="size-5 animate-spin self-center text-muted" aria-label="Saving" />}
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {cancelled && <p className="mt-2 text-sm text-muted">This order was cancelled and its items returned to stock.</p>}
    </div>
  );
}

export function OrderNote({ orderId, note }: { orderId: string; note: string }) {
  const [value, setValue] = useState(note);
  const [saved, setSaved] = useState(note);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await saveOrderNote(orderId, value);
      if (result.ok) {
        setSaved(value);
        setMessage("Saved.");
      } else {
        setMessage(result.error);
      }
    });

  return (
    <div>
      <label htmlFor="admin-note" className="sr-only">
        Private note
      </label>
      <TextArea
        id="admin-note"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setMessage("");
        }}
        placeholder="Only you can see this, e.g. paid via MoMo, rider name…"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {message && <span className="text-sm text-muted">{message}</span>}
        <button
          type="button"
          onClick={save}
          disabled={pending || value === saved}
          className="rounded-full bg-night px-4 py-2 text-sm font-medium text-white hover:bg-accent disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}
