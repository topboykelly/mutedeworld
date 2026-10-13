import { marquee } from "@/data/store";
import { Star4 } from "./ui/Sparkle";

export function Marquee() {
  return (
    <div className="group relative overflow-hidden bg-night py-5 text-white md:py-6">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex shrink-0 items-center"
          >
            {marquee.map((label) => (
              <li
                key={label}
                className="flex items-center gap-10 pr-10 text-xl font-semibold whitespace-nowrap md:text-2xl"
              >
                {label}
                <Star4 className="size-5 text-accent-light" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
