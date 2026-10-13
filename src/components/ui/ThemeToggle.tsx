"use client";

import { useLayoutEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, getPreferredTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/cn";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

let fadeTimer: ReturnType<typeof setTimeout> | undefined;

/** Cross-fades colours for browsers without the View Transitions API (e.g. Safari before iOS 18). */
function fadeToTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-fade");
  applyTheme(theme);
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => root.classList.remove("theme-fade"), 500);
}

export function ThemeToggle({ className }: { className?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // React resets <html> attributes on the dev Strict Mode remount, wiping what the head script set.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = getPreferredTheme();
  }, []);

  const toggle = () => {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const button = buttonRef.current;
    if (reduceMotion) {
      applyTheme(next);
      return;
    }
    if (typeof document.startViewTransition !== "function" || !button) {
      fadeToTheme(next);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={cn(
        "relative grid size-10 place-items-center overflow-hidden rounded-full bg-paper text-ink transition-colors duration-300 hover:bg-accent-soft hover:text-accent",
        className,
      )}
    >
      <Moon
        aria-hidden="true"
        className="absolute size-5 transition-all duration-500 dark:scale-0 dark:-rotate-90 dark:opacity-0"
      />
      <Sun
        aria-hidden="true"
        className="absolute size-5 scale-0 rotate-90 opacity-0 transition-all duration-500 dark:scale-100 dark:rotate-0 dark:opacity-100"
      />
    </button>
  );
}
