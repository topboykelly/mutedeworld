"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, LayoutDashboard, LogOut, Menu, Package, ReceiptText, X } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { Logo } from "../ui/Logo";
import { easeOut } from "../ui/Section";
import { ThemeToggle } from "../ui/ThemeToggle";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ReceiptText },
];

const linkClass = "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors";
const idleClass = "text-ink/70 hover:bg-paper hover:text-ink";

export function AdminNav({ showSignOut }: { showSignOut: boolean }) {
  return <AdminNavShell pathname={usePathname()} showSignOut={showSignOut} />;
}

/** Without a pathname (while the route's params are still unknown) no link is highlighted. */
export function AdminNavShell({ pathname, showSignOut }: { pathname: string | null; showSignOut: boolean }) {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const navLinks = (onNavigate?: () => void) => (
    <>
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(linkClass, isActive(href) ? "bg-night text-white dark:bg-accent" : idleClass)}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
      <Link href="/" target="_blank" onClick={onNavigate} className={cn(linkClass, idleClass)}>
        <ExternalLink className="size-4" aria-hidden="true" />
        View store
      </Link>
    </>
  );

  const signOutButton = () =>
    showSignOut && (
      <form action={signOut}>
        <button type="submit" className={cn(linkClass, "w-full text-ink/70 hover:bg-danger/10 hover:text-danger")}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </button>
      </form>
    );

  return (
    <aside
      ref={barRef}
      className="sticky top-0 z-40 border-b border-ink/10 bg-surface/90 backdrop-blur-md lg:h-screen lg:border-r lg:border-b-0"
    >
      <div className="flex h-full flex-col p-4 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 lg:flex-col lg:items-start">
            <Logo />
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent lg:ml-11">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="admin-menu"
              className="grid size-10 place-items-center rounded-full bg-paper"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <nav aria-label="Admin" className="mt-10 hidden flex-col gap-1 lg:flex">
          {navLinks()}
        </nav>

        <div className="mt-auto hidden flex-col gap-3 lg:flex">
          <ThemeToggle />
          {signOutButton()}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="absolute inset-x-0 top-full overflow-hidden border-b border-ink/10 bg-surface shadow-xl shadow-black/10 lg:hidden"
            >
              <nav id="admin-menu" aria-label="Admin" className="flex flex-col gap-1 p-3">
                {navLinks(() => setOpen(false))}
                {showSignOut && (
                  <div className="mt-1 border-t border-ink/10 pt-2">{signOutButton()}</div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
