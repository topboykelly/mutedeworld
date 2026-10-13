import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { contact } from "@/data/store";
import { telUrl, whatsappUrl } from "@/lib/contact";
import { PillLink } from "../ui/Button";
import { InstagramIcon, TiktokIcon, WhatsappIcon } from "../ui/SocialIcons";

const channels = [
  { label: "Call us", value: contact.phone, href: telUrl, Icon: Phone },
  { label: "Email us", value: contact.email, href: `mailto:${contact.email}`, Icon: Mail },
  { label: "Instagram", value: contact.instagram.handle, href: contact.instagram.url, Icon: InstagramIcon },
  { label: "TikTok", value: contact.tiktok.handle, href: contact.tiktok.url, Icon: TiktokIcon },
];

export function ContactChannels() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-4xl bg-night p-6 text-white sm:p-8 dark:ring-1 dark:ring-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-accent/40 blur-3xl"
        />
        <div className="relative">
          <span className="grid size-12 place-items-center rounded-full bg-accent">
            <WhatsappIcon className="size-6" />
          </span>
          <p className="mt-5 text-sm text-white/60">Fastest way to reach us</p>
          <h2 className="mt-1 text-2xl font-semibold">Chat on WhatsApp</h2>
          <p className="mt-2 text-white/60">
            Orders, sizing, delivery: we usually reply within a few hours during business hours.
          </p>
          <PillLink href={whatsappUrl()} target="_blank" rel="noreferrer" variant="accent" arrow className="mt-6">
            Start a Chat
          </PillLink>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {channels.map(({ label, value, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex h-full items-center gap-3 rounded-3xl bg-surface p-4 transition-shadow hover:shadow-lg hover:shadow-accent/10 dark:ring-1 dark:ring-white/5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">{label}</span>
                <span className="block truncate font-medium">{value}</span>
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-muted transition-transform group-hover:rotate-45 group-hover:text-accent"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 sm:flex-row sm:gap-8 dark:ring-1 dark:ring-white/5">
        <p className="flex items-center gap-3">
          <MapPin className="size-5 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <span className="block text-sm text-muted">Based in</span>
            <span className="block font-medium">{contact.location}</span>
          </span>
        </p>
        <p className="flex items-center gap-3">
          <Clock className="size-5 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <span className="block text-sm text-muted">Hours</span>
            <span className="block font-medium">{contact.hours}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
