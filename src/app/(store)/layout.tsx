import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CartProvider } from "@/lib/cart";
import { getProducts } from "@/lib/catalog";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const products = await getProducts();

  return (
    <CartProvider products={products}>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </CartProvider>
  );
}
