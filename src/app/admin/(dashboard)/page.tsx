import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Package, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AdminHeader, AdminSkeleton, Card, StatusBadge, formatDate } from "@/components/admin/ui";
import { LOW_STOCK_THRESHOLD } from "@/data/store";
import { getAdminSession } from "@/lib/auth";
import { formatCedi } from "@/lib/format";
import { itemCount, type OrderRow } from "@/lib/orders";
import { colorNames, productFromRow, stockFor, variantLabel, type Product, type ProductRow } from "@/lib/product";

export const metadata: Metadata = { title: "Dashboard" };

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const session = await getAdminSession();
  if (!session) {
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Welcome" description="One-time setup to start managing your store." />
        <SetupNotice />
      </div>
    );
  }

  const since = daysAgo(30);
  const [{ data: productRows }, { data: recent }, { data: monthOrders }, { count: newCount }] = await Promise.all([
    session.supabase.from("products").select("*").order("sort_order"),
    session.supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    session.supabase.from("orders").select("total, status").gte("created_at", since),
    session.supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const products = ((productRows ?? []) as ProductRow[])
    .map(productFromRow)
    .filter((p): p is Product => p !== null);
  const orders = (recent ?? []) as OrderRow[];
  const revenue = (monthOrders ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const lowStock = products
    .filter((p) => p.isActive)
    .flatMap((p) =>
      colorNames(p).flatMap((color) =>
        p.sizes.flatMap((size) => {
          const left = stockFor(p, color, size);
          return left <= LOW_STOCK_THRESHOLD ? [{ product: p, color, size, left }] : [];
        }),
      ),
    )
    .sort((a, b) => a.left - b.left);

  const stats = [
    { label: "New orders", value: String(newCount ?? 0), Icon: ReceiptText, href: "/admin/orders?status=new" },
    { label: "Sales, last 30 days", value: formatCedi(revenue), Icon: Wallet, href: "/admin/orders" },
    { label: "Orders, last 30 days", value: String(monthOrders?.length ?? 0), Icon: TrendingUp, href: "/admin/orders" },
    { label: "Live products", value: String(products.filter((p) => p.isActive).length), Icon: Package, href: "/admin/products" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Dashboard" description={`Signed in as ${session.user.email}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, href }) => (
          <Link key={label} href={href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-lg group-hover:shadow-accent/10">
              <Icon className="size-5 text-accent" aria-hidden="true" />
              <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold">Your catalogue is empty.</span>{" "}
            <span className="text-muted">Import the starter products or add your first piece.</span>
          </p>
          <Link href="/admin/products" className="font-medium text-accent hover:underline">
            Go to products
          </Link>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-accent">
              All orders <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No orders yet. They&apos;ll show up here as soon as someone checks out.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/5">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-2xl px-2 py-3 hover:bg-paper"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {o.reference} <span className="font-normal text-muted">· {o.first_name} {o.last_name}</span>
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(o.created_at)} · {itemCount(o)} {itemCount(o) === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold">{formatCedi(Number(o.total))}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="size-5 text-danger" aria-hidden="true" />
            Low stock
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Everything is well stocked.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-1">
              {lowStock.slice(0, 12).map(({ product, color, size, left }) => (
                <li key={`${product.id}|${color}|${size}`}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-2xl px-2 py-2 text-sm hover:bg-paper"
                  >
                    <span className="min-w-0 truncate">
                      {product.name} <span className="text-muted">({variantLabel(color, size)})</span>
                    </span>
                    <span className={left === 0 ? "font-semibold text-danger" : "font-semibold"}>
                      {left === 0 ? "Sold out" : `${left} left`}
                    </span>
                  </Link>
                </li>
              ))}
              {lowStock.length > 12 && <li className="pt-2 text-xs text-muted">+{lowStock.length - 12} more</li>}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
