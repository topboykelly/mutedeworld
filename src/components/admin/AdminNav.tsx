"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, LogOut, Package, ReceiptText } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ReceiptText },
];

export function AdminNav({ showSignOut }: { showSignOut: boolean }) {
  return <AdminNavShell pathname={usePathname()} showSignOut={showSignOut} />;
}

/** Without a pathname (while the route's params are still unknown) no link is highlighted. */
export function AdminNavShell({ pathname, showSignOut }: { pathname: string | null; showSignOut: boolean }) {
  const isActive = (href: string) =>
    pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 z-40 border-b border-ink/10 bg-surface/90 backdrop-blur-md lg:h-screen lg:border-r lg:border-b-0">
      <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">Admin</span>
          </div>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        <nav aria-label="Admin" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 lg:mt-6 lg:flex-col">
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
                isActive(href) ? "bg-night text-white dark:bg-accent" : "text-ink/70 hover:bg-paper hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-paper hover:text-ink"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View store
          </Link>
        </nav>

        <div className="mt-auto hidden items-center justify-between gap-3 lg:flex">
          <ThemeToggle />
          {showSignOut && (
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          )}
        </div>
        {showSignOut && (
          <form action={signOut} className="lg:hidden">
            <button type="submit" className="text-sm font-medium text-muted hover:text-danger">
              Sign out
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
