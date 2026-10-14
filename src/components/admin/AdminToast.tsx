"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { easeOut } from "../ui/Section";

type Toast = { id: number; message: string; ok: boolean };

const VISIBLE_MS = 2500;

const AdminToastContext = createContext<((message: string, ok?: boolean) => void) | null>(null);

/** Lives in the dashboard layout, so a toast survives navigating to another admin page. */
export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const nextId = useRef(0);

  const notify = useCallback((message: string, ok = true) => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, ok });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <AdminToastContext value={notify}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 lg:justify-end lg:px-8"
      >
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="pointer-events-auto flex items-center gap-3 rounded-full bg-night py-2 pr-5 pl-2.5 text-sm font-medium text-white shadow-xl shadow-black/20 dark:ring-1 dark:ring-white/10"
            >
              <span className={cn("grid size-6 place-items-center rounded-full", toast.ok ? "bg-accent" : "bg-danger")}>
                {toast.ok ? <Check className="size-3.5" aria-hidden="true" /> : <AlertCircle className="size-3.5" aria-hidden="true" />}
              </span>
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminToastContext>
  );
}

export function useAdminToast() {
  const notify = useContext(AdminToastContext);
  if (!notify) throw new Error("useAdminToast must be used inside <AdminToastProvider>");
  return notify;
}
