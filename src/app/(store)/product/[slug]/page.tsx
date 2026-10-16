import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductView } from "@/components/product/ProductView";
import { Reveal } from "@/components/ui/Section";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { coverPhoto } from "@/lib/product";

const PLACEHOLDER_SLUG = "__none__";

export async function generateStaticParams() {
  const products = await getProducts();
  // Cache Components needs at least one sample; the placeholder renders a 404.
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };

  const image = coverPhoto(product);
  return {
    title: product.name,
    description: product.description || `${product.name} by Mutedeworld.`,
    openGraph: image ? { images: [image] } : undefined,
  };
}

// Known products are prerendered. One added after the build renders on its first visit (then is cached),
// and blocking here keeps a real 404 status for unknown links.
export const instant = false;

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const others = (await getProducts()).filter((p) => p.id !== product.id);
  const related = [
    ...others.filter((p) => p.category === product.category),
    ...others.filter((p) => p.category !== product.category),
  ].slice(0, 4);

  return (
    <>
      <section className="relative bg-grid pt-24 pb-3 md:pt-32 md:pb-8">
        <div className="container-page">
          <ProductView product={product} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="relative py-4 md:py-8">
          <div className="container-page">
            <Reveal>
              <SectionHeading
                label="Complete the Look"
                title={
                  <>
                    You May Also <Accent>Like</Accent>
                  </>
                }
              />
            </Reveal>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:mt-6 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
