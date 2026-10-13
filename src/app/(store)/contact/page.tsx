import type { Metadata } from "next";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/contact/ContactForm";
import { Faq } from "@/components/contact/Faq";
import { Reveal, Section } from "@/components/ui/Section";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, sizing or delivery? Reach Mutedeworld on WhatsApp, phone, email or Instagram.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative bg-grid pt-32 pb-16 md:pt-36 md:pb-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              label="Get in Touch"
              title={
                <>
                  We&apos;d love to <Accent>hear from you</Accent>
                </>
              }
            />
            <p className="mt-5 max-w-2xl text-lg text-muted">
              Questions about a piece, your order or delivery? Pick whatever&apos;s easiest for you. A real person from
              the team will get back to you.
            </p>
          </Reveal>

          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.25fr]">
            <Reveal delay={0.1}>
              <ContactChannels />
            </Reveal>
            <Reveal delay={0.2}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>

      <Section id="faq" className="pt-4 md:pt-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <SectionHeading
              label="Good to Know"
              title={
                <>
                  Frequently Asked <Accent>Questions</Accent>
                </>
              }
            />
            <p className="mt-5 max-w-sm text-muted">
              Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll help you out.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
