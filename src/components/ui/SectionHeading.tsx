import { cn } from "@/lib/cn";
import { Sparkle } from "./Sparkle";

export function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-accent">{children}</span>;
}

export function SectionLabel({
  children,
  light = false,
  className,
}: {
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-sm font-medium tracking-wide",
        light ? "text-white/80" : "text-ink/80",
        className,
      )}
    >
      <span className="h-0.5 w-6 rounded-full bg-accent" />
      {children}
    </p>
  );
}

export function SectionHeading({
  label,
  title,
  light = false,
  className,
}: {
  label: string;
  title: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <SectionLabel light={light}>{label}</SectionLabel>
      <h2
        className={cn(
          "mt-3 text-4xl font-semibold tracking-tight md:text-5xl",
          light && "text-white",
        )}
      >
        {title}
        {"\u2060"}
        <Sparkle className="ml-1 size-6 -translate-y-5 md:size-7" />
      </h2>
    </div>
  );
}
