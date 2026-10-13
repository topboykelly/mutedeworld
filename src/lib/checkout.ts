import type { PaymentId, RegionId } from "@/data/store";

/** Checkout form fields, validated in the browser and again on the server. */
export type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  region: RegionId | "";
  city: string;
  address: string;
  payment: PaymentId;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export type OrderItemInput = { productId: string; color: string; size: string; qty: number };

export const MAX_LINE_QTY = 20;
export const MAX_LINES = 30;

export function validateCheckout(form: CheckoutForm): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter your last name.";
  const digits = form.phone.replace(/\D/g, "");
  if (!digits) errors.phone = "Enter a phone number we can reach you on.";
  else if (digits.length < 9 || digits.length > 12) errors.phone = "Enter a valid phone number, e.g. 024 123 4567.";
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!form.region) errors.region = "Select your region.";
  if (!form.city.trim()) errors.city = "Enter your city or town.";
  if (!form.address.trim()) errors.address = "Enter a delivery address or landmark.";
  if (form.payment === "cod" && form.region && form.region !== "accra")
    errors.payment = "Pay on delivery is only available in Greater Accra.";
  return errors;
}

export type PlacedOrder = {
  reference: string;
  firstName: string;
  phone: string;
  itemCount: number;
  total: number;
  /** Opens a chat with the shop, pre-filled with the full order. */
  whatsappUrl: string;
  /** True when Supabase isn't connected: nothing was saved. */
  demo: boolean;
};

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; error: string; fieldErrors?: CheckoutErrors };
