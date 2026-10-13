"use server";

import { updateTag } from "next/cache";
import { starterProducts } from "@/data/seed";
import { brand, deliveryRule, isRegion, paymentLabel, paymentMethods, regionLabel } from "@/data/store";
import { PRODUCTS_TAG } from "@/lib/catalog";
import {
  MAX_LINE_QTY,
  MAX_LINES,
  validateCheckout,
  type CheckoutForm,
  type OrderItemInput,
  type PlaceOrderResult,
} from "@/lib/checkout";
import { whatsappUrl } from "@/lib/contact";
import { formatCedi } from "@/lib/format";
import { stockFor, variantLabel } from "@/lib/product";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/service";

type SavedLine = { name: string; color: string; size: string; qty: number; price: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanForm(input: CheckoutForm): CheckoutForm {
  const text = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const region = text(input?.region);
  const payment = text(input?.payment);
  return {
    firstName: text(input?.firstName, 80),
    lastName: text(input?.lastName, 80),
    phone: text(input?.phone, 30),
    email: text(input?.email, 120),
    region: isRegion(region) ? region : "",
    city: text(input?.city, 80),
    address: text(input?.address, 400),
    payment: paymentMethods.some((m) => m.id === payment) ? (payment as CheckoutForm["payment"]) : "momo",
  };
}

function cleanItems(input: OrderItemInput[]): OrderItemInput[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) return null;
  const items: OrderItemInput[] = [];
  for (const item of input) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      typeof item.color !== "string" ||
      typeof item.size !== "string" ||
      !Number.isInteger(item.qty) ||
      item.qty < 1 ||
      item.qty > MAX_LINE_QTY
    ) {
      return null;
    }
    items.push({ productId: item.productId, color: item.color, size: item.size, qty: item.qty });
  }
  return items;
}

function orderMessage(
  reference: string,
  form: CheckoutForm,
  lines: SavedLine[],
  totals: { subtotal: number; deliveryFee: number; total: number },
) {
  const items = lines.map((l) => {
    const variant = variantLabel(l.color, l.size);
    return `• ${l.qty} × ${l.name}${variant ? ` (${variant})` : ""}: ${formatCedi(l.price * l.qty)}`;
  });

  return [
    `Hi ${brand.name}, I just placed order ${reference}.`,
    "",
    ...items,
    "",
    `Subtotal: ${formatCedi(totals.subtotal)}`,
    `Delivery: ${totals.deliveryFee === 0 ? "Free" : formatCedi(totals.deliveryFee)}`,
    `Total: ${formatCedi(totals.total)}`,
    "",
    `Name: ${form.firstName} ${form.lastName}`,
    `Phone: ${form.phone}`,
    `Deliver to: ${form.address}, ${form.city}, ${regionLabel(form.region)}`,
    `Payment: ${paymentLabel(form.payment)}`,
  ].join("\n");
}

function stockError(message: string) {
  const [, name, color, size, available] = message.split("|");
  const variant = variantLabel(color ?? "", size ?? "");
  const label = `${name}${variant ? ` (${variant})` : ""}`;
  return Number(available) > 0
    ? `Only ${available} of ${label} left. We've updated your cart, please check it and try again.`
    : `${label} just sold out. Please remove it from your cart and try again.`;
}

export async function placeOrder(formInput: CheckoutForm, itemsInput: OrderItemInput[]): Promise<PlaceOrderResult> {
  const form = cleanForm(formInput);
  const fieldErrors = validateCheckout(form);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const items = cleanItems(itemsInput);
  if (!items) return { ok: false, error: "Your cart looks empty or invalid. Please refresh and try again." };

  const region = form.region as Exclude<CheckoutForm["region"], "">;
  const rule = deliveryRule(region);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  /* Demo mode: no database yet, so check the starter stock and return a reference without saving. */
  if (!isSupabaseConfigured) {
    const lines: SavedLine[] = [];
    for (const item of items) {
      const product = starterProducts.find((p) => p.id === item.productId);
      if (!product) return { ok: false, error: "One of the items is no longer available. Please refresh your cart." };
      const available = stockFor(product, item.color, item.size);
      if (available < item.qty) {
        return { ok: false, error: stockError(`OUT_OF_STOCK|${product.name}|${item.color}|${item.size}|${available}`) };
      }
      lines.push({ name: product.name, color: item.color, size: item.size, qty: item.qty, price: product.price });
    }
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const deliveryFee = rule.freeOver !== null && subtotal >= rule.freeOver ? 0 : rule.fee;
    const total = subtotal + deliveryFee;
    const reference = `MDW-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    return {
      ok: true,
      order: {
        reference,
        firstName: form.firstName,
        phone: form.phone,
        itemCount,
        total,
        whatsappUrl: whatsappUrl(orderMessage(reference, form, lines, { subtotal, deliveryFee, total })),
        demo: true,
      },
    };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("placeOrder: SUPABASE_SERVICE_ROLE_KEY is missing.");
    return { ok: false, error: "We can't take orders right now. Please message us on WhatsApp instead." };
  }

  if (items.some((i) => !UUID.test(i.productId))) {
    return { ok: false, error: "One of the items is no longer available. Please refresh your cart." };
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_customer: {
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      email: form.email,
      region: form.region,
      city: form.city,
      address: form.address,
    },
    p_items: items.map((i) => ({ product_id: i.productId, color: i.color, size: i.size, qty: i.qty })),
    p_payment_method: form.payment,
    p_delivery: { fee: rule.fee, free_over: rule.freeOver },
  });

  if (error) {
    const message = error.message ?? "";
    if (message.startsWith("OUT_OF_STOCK")) {
      updateTag(PRODUCTS_TAG);
      return { ok: false, error: stockError(message) };
    }
    if (message.startsWith("UNAVAILABLE")) {
      updateTag(PRODUCTS_TAG);
      return { ok: false, error: "One of the items is no longer available. Please refresh your cart." };
    }
    console.error("placeOrder failed:", message);
    return { ok: false, error: "Something went wrong placing your order. Please try again or message us on WhatsApp." };
  }

  updateTag(PRODUCTS_TAG);

  const result = data as {
    reference: string;
    items: SavedLine[];
    subtotal: number | string;
    delivery_fee: number | string;
    total: number | string;
  };
  const totals = {
    subtotal: Number(result.subtotal),
    deliveryFee: Number(result.delivery_fee),
    total: Number(result.total),
  };
  const lines = result.items.map((l) => ({ ...l, price: Number(l.price) }));

  return {
    ok: true,
    order: {
      reference: result.reference,
      firstName: form.firstName,
      phone: form.phone,
      itemCount,
      total: totals.total,
      whatsappUrl: whatsappUrl(orderMessage(result.reference, form, lines, totals)),
      demo: false,
    },
  };
}
