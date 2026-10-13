"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { navLinks } from "@/data/store";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { CartDrawer } from "./CartDrawer";
import { Logo } from "./ui/Logo";
import { easeOut } from "./ui/Section";
import { ThemeToggle } from "./ui/ThemeToggle";

const sectionIds = navLinks.flatMap((link) => (link.href.startsWith("#") ? [link.href.slice(1)] : []));

export function Navbar() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const activeSection = useActiveSection(sectionIds);
  const isActive = (href: string) =>
    href.startsWith("#") ? onHome && activeSection === href.slice(1) : pathname === href;
  const { count, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hrefFor = (href: string) => (href.startsWith("#") && !onHome ? `/${href}` : href);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pt-4">
        <div className="container-page">
          <motion.nav
            aria-label="Main"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className={cn(
              "flex items-center justify-between rounded-full bg-surface/90 py-2 pr-2 pl-3 backdrop-blur-md transition-shadow duration-300 dark:ring-1 dark:ring-white/10",
              scrolled ? "shadow-lg shadow-black/5" : "shadow-sm shadow-black/5",
            )}
          >
            <Logo />

            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={hrefFor(link.href)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative block rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                        active ? "text-accent" : "text-ink/70 hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-accent-soft"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={openCart}
                aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
                className="group relative inline-flex items-center gap-2 rounded-full bg-night py-2.5 pr-2.5 pl-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent sm:pr-3 sm:pl-5"
              >
                <span className="hidden sm:inline">Cart</span>
                <ShoppingBag className="size-5" aria-hidden="true" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 24 }}
                      className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] leading-5 font-semibold text-white ring-2 ring-surface group-hover:bg-night"
                    >
                      <motion.span
                        key={count}
                        initial={{ scale: 1.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="block"
                      >
                        {count}
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="grid size-10 place-items-center rounded-full bg-paper md:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </motion.nav>

          <AnimatePresence>
            {open && (
              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="mt-2 rounded-3xl bg-surface p-3 shadow-xl shadow-black/10 md:hidden dark:ring-1 dark:ring-white/10"
              >
                <ul className="flex flex-col">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={hrefFor(link.href)}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block rounded-2xl px-4 py-3 font-medium transition-colors",
                          isActive(link.href) ? "bg-accent-soft text-accent" : "hover:bg-paper",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="mt-2 block rounded-2xl bg-night px-4 py-3 text-center font-medium text-white"
                >
                  Checkout{count > 0 ? ` (${count})` : ""}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
