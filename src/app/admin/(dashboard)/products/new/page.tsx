import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  const session = await getAdminSession();
  if (!session) return <SetupNotice />;

  const { data } = await session.supabase
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="New product" description="Add a piece to the store." />
      <ProductForm product={null} nextSortOrder={(data?.sort_order ?? -1) + 1} />
    </div>
  );
}
