"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { easeOut } from "./ui/Section";

const VISIBLE_MS = 2500;

export function CartToast() {
  const { toast, dismissToast, openCart } = useCart();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center px-5">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-night py-2 pr-2 pl-2.5 text-sm font-medium text-white shadow-xl shadow-black/20 dark:ring-1 dark:ring-white/10"
          >
            <span className={cn("grid size-6 place-items-center rounded-full", toast.ok ? "bg-accent" : "bg-white/15")}>
              {toast.ok ? <Check className="size-3.5" aria-hidden="true" /> : <Info className="size-3.5" aria-hidden="true" />}
            </span>
            {toast.message}
            <button
              type="button"
              onClick={() => {
                dismissToast();
                openCart();
              }}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs transition-colors hover:bg-white/20"
            >
              View cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
