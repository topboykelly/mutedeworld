import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your order, add delivery details and check out.",
};

export default function CartPage() {
  return <Checkout />;
}
