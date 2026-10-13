"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { brand, contactTopics } from "@/data/store";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { PillButton } from "../ui/Button";
import { Field, Select, TextArea, TextInput } from "../ui/fields";
import { WhatsappIcon } from "../ui/SocialIcons";

type Form = { name: string; phone: string; topic: string; orderRef: string; message: string };
type Errors = Partial<Record<keyof Form, string>>;
type Channel = "whatsapp" | "email";

const emptyForm: Form = { name: "", phone: "", topic: contactTopics[0], orderRef: "", message: "" };

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = "Tell us your name.";
  const digits = form.phone.replace(/\D/g, "");
  if (digits && (digits.length < 9 || digits.length > 12)) errors.phone = "Enter a valid phone number, or leave it blank.";
  if (form.message.trim().length < 10) errors.message = "Write a short message (at least 10 characters).";
  return errors;
}

function compose(form: Form) {
  const lines = [`Hi ${brand.name}, I'm ${form.name.trim()}.`, `Topic: ${form.topic}`];
  if (form.orderRef.trim()) lines.push(`Order ref: ${form.orderRef.trim()}`);
  if (form.phone.trim()) lines.push(`Phone: ${form.phone.trim()}`);
  lines.push("", form.message.trim());
  return lines.join("\n");
}

export function ContactForm() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [sentVia, setSentVia] = useState<Channel | null>(null);

  const errors = submitted ? validate(form) : {};

  const set =
    <K extends keyof Form>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const send = (channel: Channel) => {
    setSubmitted(true);
    const found = validate(form);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      setSentVia(null);
      return;
    }
    const text = compose(form);
    if (channel === "whatsapp") {
      window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
    } else {
      window.location.href = mailtoUrl(`${form.topic} — ${form.name.trim()}`, text);
    }
    setSentVia(channel);
    setSubmitted(false);
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send("whatsapp");
      }}
      className="rounded-4xl bg-surface p-5 sm:p-8 dark:ring-1 dark:ring-white/5"
    >
      <h2 className="text-2xl font-semibold">Send us a message</h2>
      <p className="mt-1 text-muted">
        Fill this in and we&apos;ll open WhatsApp (or your email app) with your message ready to send.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field id="contact-name" label="Your name" error={errors.name}>
          <TextInput
            id="contact-name"
            autoComplete="name"
            placeholder="Ama Owusu"
            value={form.name}
            onChange={set("name")}
            invalid={!!errors.name}
          />
        </Field>
        <Field id="contact-phone" label="Phone number" optional error={errors.phone}>
          <TextInput
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+233 24 123 4567"
            value={form.phone}
            onChange={set("phone")}
            invalid={!!errors.phone}
          />
        </Field>
        <Field id="contact-topic" label="What's it about?">
          <Select id="contact-topic" value={form.topic} onChange={set("topic")}>
            {contactTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="contact-orderRef" label="Order reference" optional>
          <TextInput
            id="contact-orderRef"
            placeholder="MDW-XXXXXX"
            value={form.orderRef}
            onChange={set("orderRef")}
          />
        </Field>
        <Field id="contact-message" label="Message" error={errors.message} className="sm:col-span-2">
          <TextArea
            id="contact-message"
            rows={5}
            placeholder="How can we help?"
            value={form.message}
            onChange={set("message")}
            invalid={!!errors.message}
          />
        </Field>
      </div>

      <AnimatePresence>
        {sentVia && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="status"
            className="overflow-hidden"
          >
            <span className="mt-5 flex items-start gap-2.5 rounded-2xl bg-accent-soft p-4 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              {sentVia === "whatsapp"
                ? "WhatsApp opened in a new tab with your message ready. Just tap send. If nothing opened, check your pop-up blocker and try again."
                : "Your email app should have opened with your message ready. Just hit send."}
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <PillButton type="submit" variant="accent" className="gap-2.5">
          <WhatsappIcon className="size-5" />
          Send on WhatsApp
        </PillButton>
        <PillButton type="button" variant="outline" onClick={() => send("email")} className="gap-2.5">
          <Mail className="size-5" aria-hidden="true" />
          Send by Email
        </PillButton>
      </div>
    </form>
  );
}
