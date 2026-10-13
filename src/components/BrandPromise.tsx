import { brand, promise } from "@/data/store";
import { PillLink } from "./ui/Button";
import { Reveal, Section } from "./ui/Section";
import { Accent, SectionHeading } from "./ui/SectionHeading";
import { Star4 } from "./ui/Sparkle";

export function BrandPromise() {
  const [first, ...rest] = promise.title.split(" ");

  return (
    <Section id="story" className="pt-0 md:pt-0">
      <Reveal>
        <div className="relative overflow-hidden rounded-4xl bg-surface px-6 py-14 md:px-14 md:py-20 dark:ring-1 dark:ring-white/5">
          <Star4 className="absolute -top-10 -right-10 size-56 text-accent/10" />
          <Star4 className="absolute -bottom-6 left-1/3 size-24 text-accent/10" />

          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <SectionHeading
                label={`The ${brand.name} Promise`}
                title={
                  <>
                    {first} <Accent>{rest.join(" ")}</Accent>
                  </>
                }
              />
              <p className="mt-6 max-w-xl text-lg text-muted">{promise.body}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PillLink href="#collection" variant="dark" arrow>
                  Explore the Collection
                </PillLink>
                <PillLink href="/contact" variant="outline">
                  Get in Touch
                </PillLink>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {promise.points.map((point) => (
                <li key={point.label} className="flex items-center gap-4 rounded-2xl bg-paper p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-white">
                    <Star4 className="size-4" />
                  </span>
                  <div>
                    <p className="text-xl font-semibold">{point.value}</p>
                    <p className="text-sm text-muted">{point.label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
