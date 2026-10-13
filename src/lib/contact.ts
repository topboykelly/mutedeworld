import { brand, contact } from "@/data/store";

export function whatsappUrl(text = `Hi ${brand.name}, I have a question.`) {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function mailtoUrl(subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${contact.email}${query ? `?${query}` : ""}`;
}

export const telUrl = `tel:${contact.phone.replace(/\s/g, "")}`;
