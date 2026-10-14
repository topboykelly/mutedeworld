import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ImportStarterButton } from "@/components/admin/ImportStarterButton";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AdminHeader, AdminSkeleton, Card } from "@/components/admin/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { categoryLabel } from "@/data/store";
import { getAdminSession } from "@/lib/auth";
import { formatCedi } from "@/lib/format";
import { coverPhoto, lowStockCount, productFromRow, totalStock, type Product, type ProductRow } from "@/lib/product";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  const session = await getAdminSession();
  if (!session) return <SetupNotice />;

  const { data, error } = await session.supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const products = ((data ?? []) as ProductRow[]).map(productFromRow).filter((p): p is Product => p !== null);

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Products" description={`${products.length} in your catalogue`}>
        {products.length > 0 && <ImportStarterButton />}
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Link>
      </AdminHeader>

      {error && <p className="text-danger">Couldn&apos;t load products: {error.message}</p>}

      {products.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-14 text-center">
          <h2 className="text-xl font-semibold">No products yet</h2>
          <p className="max-w-md text-muted">
            Bring in the 18 starter pieces from the old site (you can edit them afterwards), or add your first product.
          </p>
          <ImportStarterButton prominent />
        </Card>
      ) : (
        <Card className="p-2 sm:p-3">
          <ul className="divide-y divide-ink/5">
            {products.map((p) => {
              const stock = totalStock(p);
              const low = lowStockCount(p);
              return (
                <li key={p.id} className="flex items-start gap-3 p-2 sm:items-center sm:gap-4 sm:p-3">
                  <Link href={`/admin/products/${p.id}`} className="shrink-0">
                    <ProductImage
                      src={coverPhoto(p)}
                      alt=""
                      category={p.category}
                      sizes="64px"
                      className="aspect-[3/4] w-16 rounded-xl sm:w-14"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/products/${p.id}`} className="block truncate font-semibold hover:text-accent">
                        {p.name}
                      </Link>
                      <p className="truncate text-sm text-muted">
                        {categoryLabel(p.category)} · {formatCedi(p.price)}
                        <span className="hidden sm:inline"> · /{p.slug}</span>
                      </p>
                      <p className="text-xs">
                        {stock === 0 ? (
                          <span className="font-semibold text-danger">Sold out</span>
                        ) : low !== null ? (
                          <span className="font-semibold text-danger">{stock} in stock</span>
                        ) : (
                          <span className="text-muted">{stock} in stock</span>
                        )}
                        {p.images.length === 0 && <span className="ml-2 text-muted">· No photos</span>}
                      </p>
                    </div>
                    <ProductRowActions id={p.id} name={p.name} isActive={p.isActive} featured={p.featured} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
