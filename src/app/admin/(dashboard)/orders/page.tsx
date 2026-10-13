import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AdminHeader, AdminSkeleton, Card, StatusBadge, formatDate } from "@/components/admin/ui";
import { isOrderStatus, orderStatuses, regionLabel } from "@/data/store";
import { getAdminSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { formatCedi } from "@/lib/format";
import { itemCount, type OrderRow } from "@/lib/orders";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession();
  if (!session) return <SetupNotice />;

  const { status: raw } = await searchParams;
  const status = typeof raw === "string" && isOrderStatus(raw) ? raw : null;

  let query = session.supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  const orders = (data ?? []) as OrderRow[];

  const tabs = [{ id: null, label: "All" }, ...orderStatuses.map((s) => ({ id: s.id, label: s.label }))];

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Orders" description="Every order placed on the website." />

      <nav aria-label="Filter by status" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {tabs.map((tab) => {
          const active = tab.id === status;
          return (
            <Link
              key={tab.label}
              href={tab.id ? `/admin/orders?status=${tab.id}` : "/admin/orders"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active ? "bg-night text-white dark:bg-accent" : "bg-surface text-ink/70 hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {error && <p className="text-danger">Couldn&apos;t load orders: {error.message}</p>}

      <Card className="p-2 sm:p-3">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-muted">No {status ? `${status} ` : ""}orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th scope="col" className="px-3 py-2 font-medium">Order</th>
                  <th scope="col" className="px-3 py-2 font-medium">Customer</th>
                  <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">Delivery</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Total</th>
                  <th scope="col" className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-ink/5 hover:bg-paper">
                    <td className="px-3 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-accent">
                        {o.reference}
                      </Link>
                      <p className="text-xs whitespace-nowrap text-muted">{formatDate(o.created_at)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium whitespace-nowrap">
                        {o.first_name} {o.last_name}
                      </p>
                      <p className="text-xs text-muted">{o.phone}</p>
                    </td>
                    <td className="hidden px-3 py-3 text-muted md:table-cell">
                      {o.city}, {regionLabel(o.region)}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <p className="font-semibold">{formatCedi(Number(o.total))}</p>
                      <p className="text-xs text-muted">
                        {itemCount(o)} {itemCount(o) === 1 ? "item" : "items"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
