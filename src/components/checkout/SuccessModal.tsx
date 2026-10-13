"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { PlacedOrder } from "@/lib/checkout";
import { formatCedi } from "@/lib/format";
import { WhatsappIcon } from "../ui/SocialIcons";
import { easeOut } from "../ui/Section";

export function SuccessModal({ order }: { order: PlacedOrder | null }) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (order) linkRef.current?.focus();
  }, [order]);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-black/50 p-5 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="w-full max-w-md rounded-4xl bg-surface p-8 text-center shadow-2xl sm:p-10 dark:ring-1 dark:ring-white/10"
          >
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
              className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-white shadow-lg shadow-accent/30"
            >
              <Check className="size-8" strokeWidth={3} aria-hidden="true" />
            </motion.span>
            <h2 id="success-title" className="mt-6 text-3xl font-semibold tracking-tight">
              Thank you, <span className="text-accent">{order.firstName}</span>
            </h2>
            <p className="mt-3 text-muted">
              Your order of {order.itemCount} {order.itemCount === 1 ? "item" : "items"} ({formatCedi(order.total)}) is
              in. Send it to us on WhatsApp and we&apos;ll confirm delivery and payment with you.
            </p>
            <p className="mt-5 inline-block rounded-full bg-paper px-4 py-2 text-sm">
              Order ref <span className="font-semibold">{order.reference}</span>
            </p>
            {order.demo && (
              <p className="mt-3 text-xs text-muted">Demo mode: this order wasn&apos;t saved because the shop database isn&apos;t connected yet.</p>
            )}

            <a
              ref={linkRef}
              href={order.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#25d366]/25 transition-transform hover:-translate-y-0.5"
            >
              <WhatsappIcon className="size-5" />
              Send Order on WhatsApp
            </a>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Back to the shop
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
