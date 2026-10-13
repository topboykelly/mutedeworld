"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { faqs } from "@/data/store";
import { cn } from "@/lib/cn";
import { easeOut } from "../ui/Section";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="flex flex-col gap-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        const panelId = `faq-panel-${i}`;
        return (
          <li key={faq.q} className="rounded-3xl bg-surface dark:ring-1 dark:ring-white/5">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 p-5 text-left text-lg font-semibold sm:px-7"
              >
                {faq.q}
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full transition-all duration-300",
                    isOpen ? "rotate-45 bg-accent text-white" : "bg-paper",
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: easeOut }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-6 text-muted sm:px-7">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
