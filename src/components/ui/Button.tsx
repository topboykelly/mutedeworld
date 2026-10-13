import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "dark" | "accent" | "outline" | "outline-light";

const variants: Record<Variant, { pill: string; circle: string }> = {
  dark: {
    pill: "bg-night text-white hover:shadow-night/25 dark:ring-1 dark:ring-white/10",
    circle: "bg-accent text-white",
  },
  accent: {
    pill: "bg-accent text-white hover:shadow-accent/30",
    circle: "bg-night text-white",
  },
  outline: {
    pill: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
    circle: "bg-accent text-white",
  },
  "outline-light": {
    pill: "border-2 border-white/25 text-white hover:border-white hover:bg-white hover:text-[#0a0a0a]",
    circle: "bg-accent text-white",
  },
};

function pillClasses(variant: Variant, arrow: boolean, className?: string) {
  return cn(
    "group inline-flex items-center justify-center gap-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
    arrow ? "py-1.5 pr-1.5 pl-6" : "px-7 py-3",
    variants[variant].pill,
    className,
  );
}

function ArrowCircle({ variant }: { variant: Variant }) {
  return (
    <span
      className={cn(
        "grid size-10 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45",
        variants[variant].circle,
      )}
    >
      <ArrowUpRight className="size-5" aria-hidden="true" />
    </span>
  );
}

type PillLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: string;
  variant?: Variant;
  arrow?: boolean;
};

export function PillLink({
  variant = "dark",
  arrow = false,
  className,
  children,
  ...props
}: PillLinkProps) {
  return (
    <Link className={pillClasses(variant, arrow, className)} {...props}>
      {children}
      {arrow && <ArrowCircle variant={variant} />}
    </Link>
  );
}

type PillButtonProps = React.ComponentProps<"button"> & {
  variant?: Variant;
  arrow?: boolean;
};

export function PillButton({
  variant = "dark",
  arrow = false,
  className,
  children,
  type = "button",
  ...props
}: PillButtonProps) {
  return (
    <button type={type} className={pillClasses(variant, arrow, className)} {...props}>
      {children}
      {arrow && <ArrowCircle variant={variant} />}
    </button>
  );
}
