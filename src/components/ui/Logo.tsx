import Link from "next/link";
import { brand } from "@/data/store";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${brand.name}, home`}>
      <span className="grid size-9 place-items-center rounded-full bg-accent text-lg font-bold text-white">
        {brand.name.charAt(0)}
      </span>
      <span className="text-[15px] font-semibold tracking-[0.1em] uppercase sm:text-lg sm:tracking-[0.18em]">
        {brand.name}
        <span className="text-accent">.</span>
      </span>
    </Link>
  );
}
