"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/** Rotating circular-text badge (the portfolio's "Hire Me" badge). Renders a link when href is given. */
export function CircleBadge({
  text,
  icon,
  href,
  label,
  className,
}: {
  text: string;
  icon: React.ReactNode;
  href?: string;
  label?: string;
  className?: string;
}) {
  const pathId = `badge-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const classes = cn(
    "group relative grid size-28 place-items-center rounded-full bg-surface shadow-xl shadow-black/10 transition-transform duration-300 dark:ring-1 dark:ring-white/10",
    href && "hover:scale-105",
    className,
  );

  const content = (
    <>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full animate-spin-slow">
        <defs>
          <path id={pathId} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-ink text-[9px] font-semibold uppercase">
          <textPath href={`#${pathId}`} textLength="230" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="grid size-11 place-items-center rounded-full bg-accent text-white transition-transform duration-300 group-hover:rotate-45">
        {icon}
      </span>
    </>
  );

  if (!href) return <div className={classes}>{content}</div>;

  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={classes}
    >
      {content}
    </a>
  );
}
