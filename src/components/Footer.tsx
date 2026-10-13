import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand, contact, footerColumns } from "@/data/store";
import { telUrl } from "@/lib/contact";
import { Logo } from "./ui/Logo";
import { SocialLinks } from "./ui/SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-muted">
            Aesthetic gear for those who find beauty in stillness and let their style do the talking.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5 text-sm">
            <li className="flex items-center gap-2.5 text-muted">
              <MapPin className="size-4 text-accent" aria-hidden="true" />
              {contact.location}
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 text-muted transition-colors hover:text-accent">
                <Mail className="size-4 text-accent" aria-hidden="true" />
                {contact.email}
              </a>
            </li>
            <li>
              <a href={telUrl} className="flex items-center gap-2.5 text-muted transition-colors hover:text-accent">
                <Phone className="size-4 text-accent" aria-hidden="true" />
                {contact.phone}
              </a>
            </li>
          </ul>
          <SocialLinks className="mt-6" />
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold tracking-wide uppercase">{col.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10">
        <p className="container-page py-6 text-center text-sm text-muted">
          &copy; {brand.copyrightYear} {brand.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
