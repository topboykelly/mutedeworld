import { Clock, MapPin } from "lucide-react";
import { contact } from "@/data/store";
import { whatsappUrl } from "@/lib/contact";
import { PillLink } from "./ui/Button";
import { CircleBadge } from "./ui/CircleBadge";
import { Reveal, Section } from "./ui/Section";
import { SectionLabel } from "./ui/SectionHeading";
import { SocialLinks, WhatsappIcon } from "./ui/SocialIcons";
import { Sparkle } from "./ui/Sparkle";

export function ContactSection() {
  return (
    <Section id="contact" className="pt-0 pb-12 md:pt-0 md:pb-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-night px-6 py-16 text-white md:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-accent/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-accent-light/20 blur-3xl"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid [--grid-line:rgb(255_255_255/0.04)]" />

          <div className="absolute top-12 right-12 hidden lg:block">
            <CircleBadge
              href={whatsappUrl()}
              label="Chat with us on WhatsApp"
              text="Chat With Us • Chat With Us • "
              icon={<WhatsappIcon className="size-5" />}
            />
          </div>

          <div className="relative max-w-2xl">
            <SectionLabel light>Contact</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Questions? We&apos;re here to{" "}
              <span className="whitespace-nowrap">
                <span className="text-accent-light">help</span>
                <Sparkle className="ml-1 size-7 -translate-y-6 text-accent-light md:size-9 md:-translate-y-9" />
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/60">
              Need help with sizing, an order or delivery? Message us on WhatsApp and we&apos;ll usually reply
              within a few hours.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href={whatsappUrl()} target="_blank" rel="noreferrer" variant="accent" arrow>
                Chat on WhatsApp
              </PillLink>
              <PillLink href="/contact" variant="outline-light">
                All Contact Options
              </PillLink>
            </div>
          </div>

          <div className="relative mt-14 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm text-white/50">Based in</span>
                <span className="block font-medium">{contact.location}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
                <Clock className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm text-white/50">Hours</span>
                <span className="block font-medium">{contact.hours}</span>
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <span className="text-sm text-white/50">Follow Us</span>
              <SocialLinks light />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
