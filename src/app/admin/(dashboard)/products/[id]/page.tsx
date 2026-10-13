import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui";
import { getAdminSession } from "@/lib/auth";
import { productFromRow, type ProductRow } from "@/lib/product";

export const metadata: Metadata = { title: "Edit product" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return <SetupNotice />;

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { data } = await session.supabase.from("products").select("*").eq("id", id).maybeSingle();
  const product = data ? productFromRow(data as ProductRow) : null;
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title={product.name} description="Edit details, photos and stock." />
      <ProductForm product={product} />
    </div>
  );
}
