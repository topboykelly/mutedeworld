"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, MessageCircle, ShoppingBag } from "lucide-react";
import { deliveryFee, paymentMethods, regions } from "@/data/store";
import { placeOrder as placeOrderAction } from "@/app/(store)/cart/actions";
import { useHydrated } from "@/hooks/useHydrated";
import { useCart } from "@/lib/cart";
import { validateCheckout, type CheckoutErrors, type CheckoutForm, type PlacedOrder } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { formatCedi } from "@/lib/format";
import { PillButton, PillLink } from "../ui/Button";
import { FreeDeliveryMeter } from "../ui/FreeDeliveryMeter";
import { easeOut } from "../ui/Section";
import { Accent, SectionHeading } from "../ui/SectionHeading";
import { CartItemRow } from "./CartItemRow";
import { Field, Select, TextArea, TextInput } from "../ui/fields";
import { SuccessModal } from "./SuccessModal";

type Form = CheckoutForm;

const emptyForm: Form = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  region: "",
  city: "",
  address: "",
  payment: "momo",
};

const cardClass = "rounded-4xl bg-surface p-5 sm:p-7 dark:ring-1 dark:ring-white/5";

function focusField(field: keyof Form, payment: Form["payment"]) {
  const el = document.getElementById(field === "payment" ? `payment-${payment}` : field);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  el?.focus({ preventScroll: true });
}

export function Checkout() {
  const hydrated = useHydrated();
  const { lines, count, subtotal, hasUnavailable, clear } = useCart();
  const [form, setForm] = useState<Form>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<CheckoutErrors>({});
  const [formError, setFormError] = useState("");
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [pending, startTransition] = useTransition();

  const errors: CheckoutErrors = submitted ? { ...serverErrors, ...validateCheckout(form) } : {};
  const fee = deliveryFee(form.region, subtotal);
  const total = subtotal + (fee ?? 0);
  const region = regions.find((r) => r.id === form.region);

  const set =
    <K extends keyof Form>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value as Form[K] }));
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };

  const placeOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setFormError("");
    const found = validateCheckout(form);
    const firstInvalid = Object.keys(found)[0] as keyof Form | undefined;
    if (firstInvalid) {
      focusField(firstInvalid, form.payment);
      return;
    }
    if (lines.length === 0 || hasUnavailable) return;

    const items = lines.map((l) => ({ productId: l.productId, color: l.color, size: l.size, qty: l.qty }));
    startTransition(async () => {
      try {
        const result = await placeOrderAction(form, items);
        if (!result.ok) {
          setServerErrors(result.fieldErrors ?? {});
          setFormError(result.error);
          const first = Object.keys(result.fieldErrors ?? {})[0] as keyof Form | undefined;
          if (first) focusField(first, form.payment);
          return;
        }
        setOrder(result.order);
        clear();
        setForm(emptyForm);
        setSubmitted(false);
      } catch {
        setFormError("We couldn't reach the shop. Check your connection and try again.");
      }
    });
  };

  const showEmpty = hydrated && lines.length === 0 && !order;

  return (
    <section className="relative bg-grid pt-32 pb-20 md:pt-36 md:pb-28">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <SectionHeading
            label="Review & Checkout"
            title={
              <>
                Your <Accent>Cart</Accent>
              </>
            }
          />
          <Link
            href="/#collection"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Continue shopping
          </Link>
        </motion.div>

        {!hydrated ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]" aria-hidden="true">
            <div className={cn(cardClass, "h-72 animate-pulse")} />
            <div className={cn(cardClass, "h-72 animate-pulse")} />
          </div>
        ) : showEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className={cn(cardClass, "mt-10 flex flex-col items-center px-6 py-16 text-center")}
          >
            <span className="grid size-20 place-items-center rounded-full bg-accent-soft text-accent">
              <ShoppingBag className="size-8" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-2xl font-semibold">Your cart is empty</h3>
            <p className="mt-2 max-w-sm text-muted">Head back to the collection and add something you love.</p>
            <PillLink href="/#collection" variant="dark" arrow className="mt-7">
              Shop the Collection
            </PillLink>
          </motion.div>
        ) : (
          <form
            id="checkout-form"
            noValidate
            onSubmit={placeOrder}
            className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_380px]"
          >
            <div className="flex flex-col gap-6">
              {/* Items */}
              <div className={cardClass}>
                <h3 className="text-xl font-semibold">
                  Items <span className="text-muted">({count})</span>
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.key}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3, ease: easeOut }}
                      >
                        <CartItemRow line={line} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>

              {/* Delivery */}
              <fieldset className={cardClass}>
                <legend className="sr-only">Delivery details</legend>
                <h3 className="text-xl font-semibold" aria-hidden="true">
                  Delivery Details
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field id="firstName" label="First name" error={errors.firstName}>
                    <TextInput
                      id="firstName"
                      autoComplete="given-name"
                      placeholder="Kwame"
                      value={form.firstName}
                      onChange={set("firstName")}
                      invalid={!!errors.firstName}
                    />
                  </Field>
                  <Field id="lastName" label="Last name" error={errors.lastName}>
                    <TextInput
                      id="lastName"
                      autoComplete="family-name"
                      placeholder="Mensah"
                      value={form.lastName}
                      onChange={set("lastName")}
                      invalid={!!errors.lastName}
                    />
                  </Field>
                  <Field id="phone" label="Phone number" error={errors.phone}>
                    <TextInput
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+233 24 123 4567"
                      value={form.phone}
                      onChange={set("phone")}
                      invalid={!!errors.phone}
                    />
                  </Field>
                  <Field id="email" label="Email address" optional error={errors.email}>
                    <TextInput
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set("email")}
                      invalid={!!errors.email}
                    />
                  </Field>
                  <Field id="region" label="Region" error={errors.region}>
                    <Select id="region" value={form.region} onChange={set("region")} invalid={!!errors.region}>
                      <option value="">Select region</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field id="city" label="City / Town" error={errors.city}>
                    <TextInput
                      id="city"
                      autoComplete="address-level2"
                      placeholder="e.g. Accra, Kumasi, Tema"
                      value={form.city}
                      onChange={set("city")}
                      invalid={!!errors.city}
                    />
                  </Field>
                  <Field id="address" label="Delivery address" error={errors.address} className="sm:col-span-2">
                    <TextArea
                      id="address"
                      autoComplete="street-address"
                      placeholder="Street name, area, a landmark near you…"
                      value={form.address}
                      onChange={set("address")}
                      invalid={!!errors.address}
                    />
                  </Field>
                </div>
                <p className="mt-4 rounded-2xl border-l-4 border-accent bg-accent-soft px-4 py-3 text-sm" aria-live="polite">
                  {region ? region.note : "Select your region to see delivery options and fees."}
                </p>
              </fieldset>

              {/* Payment */}
              <fieldset className={cardClass} aria-describedby={errors.payment ? "payment-error" : undefined}>
                <legend className="sr-only">Payment method</legend>
                <h3 className="text-xl font-semibold" aria-hidden="true">
                  How You&apos;ll Pay
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((m) => (
                    <label
                      key={m.id}
                      htmlFor={`payment-${m.id}`}
                      className="relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 border-ink/10 bg-paper p-4 transition-colors hover:border-accent/50 has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-4 has-focus-visible:ring-accent/20"
                    >
                      <input
                        id={`payment-${m.id}`}
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={form.payment === m.id}
                        onChange={set("payment")}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between gap-2 font-semibold">
                        {m.label}
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                            form.payment === m.id ? "border-accent" : "border-ink/20",
                          )}
                        >
                          <span
                            className={cn(
                              "size-2.5 rounded-full bg-accent transition-transform",
                              form.payment === m.id ? "scale-100" : "scale-0",
                            )}
                          />
                        </span>
                      </span>
                      <span className="text-sm text-muted">{m.detail}</span>
                    </label>
                  ))}
                </div>
                {errors.payment && (
                  <p id="payment-error" className="mt-3 text-sm text-danger">
                    {errors.payment}
                  </p>
                )}
              </fieldset>
            </div>

            {/* Summary */}
            <aside className={cn(cardClass, "lg:sticky lg:top-28")}>
              <h3 className="text-xl font-semibold">Order Summary</h3>
              <dl className="mt-5 flex flex-col gap-3">
                <div className="flex justify-between text-muted">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-ink">{formatCedi(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Delivery</dt>
                  <dd className="font-medium text-ink">
                    {fee === null ? "Select region" : fee === 0 ? <span className="text-accent">Free</span> : formatCedi(fee)}
                  </dd>
                </div>
                <div className="mt-2 flex items-end justify-between border-t border-ink/10 pt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-3xl font-semibold tracking-tight">{formatCedi(total)}</dd>
                </div>
              </dl>

              {(form.region === "" || form.region === "accra") && (
                <FreeDeliveryMeter subtotal={subtotal} className="mt-5" />
              )}

              <PillButton
                type="submit"
                variant="accent"
                arrow
                disabled={pending || hasUnavailable}
                className="mt-6 w-full justify-between"
              >
                {pending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Placing order…
                  </span>
                ) : (
                  "Place Order"
                )}
              </PillButton>
              {hasUnavailable ? (
                <p className="mt-3 text-center text-sm text-danger" role="alert">
                  Remove the sold-out items to continue.
                </p>
              ) : formError ? (
                <p className="mt-3 text-center text-sm text-danger" role="alert">
                  {formError}
                </p>
              ) : (
                submitted &&
                Object.keys(errors).length > 0 && (
                  <p className="mt-3 text-center text-sm text-danger" role="alert">
                    Please fix the highlighted fields.
                  </p>
                )
              )}
              <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-xs text-muted">
                <MessageCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                No payment now. We&apos;ll confirm your order and payment details on WhatsApp.
              </p>
            </aside>
          </form>
        )}
      </div>

      <SuccessModal order={order} />
    </section>
  );
}
