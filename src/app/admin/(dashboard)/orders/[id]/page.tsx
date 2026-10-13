import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { OrderNote, OrderStatusControl } from "@/components/admin/OrderControls";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AdminHeader, AdminSkeleton, Card, StatusBadge, formatDate, internationalPhone } from "@/components/admin/ui";
import { WhatsappIcon } from "@/components/ui/SocialIcons";
import { brand, paymentLabel, regionLabel } from "@/data/store";
import { getAdminSession } from "@/lib/auth";
import { formatCedi } from "@/lib/format";
import { type OrderRow } from "@/lib/orders";
import { variantLabel } from "@/lib/product";

export const metadata: Metadata = { title: "Order" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Order params={params} />
    </Suspense>
  );
}

async function Order({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return <SetupNotice />;

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { data } = await session.supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const order = data as OrderRow;

  const customerChat = `https://wa.me/${internationalPhone(order.phone)}?text=${encodeURIComponent(
    `Hi ${order.first_name}, this is ${brand.name} about your order ${order.reference}.`,
  )}`;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent">
        <ArrowLeft className="size-4" aria-hidden="true" /> All orders
      </Link>
      <AdminHeader title={order.reference} description={`Placed ${formatDate(order.created_at)}`}>
        <StatusBadge status={order.status} />
      </AdminHeader>

      <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="text-lg font-semibold">Status</h2>
            <div className="mt-4">
              <OrderStatusControl orderId={order.id} status={order.status} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Items</h2>
            <ul className="mt-4 divide-y divide-ink/5">
              {order.items.map((item, i) => {
                const variant = variantLabel(item.color, item.size);
                return (
                  <li key={i} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link href={`/product/${item.slug}`} target="_blank" className="font-medium hover:text-accent">
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted">
                        {variant && `${variant} · `}
                        {item.qty} × {formatCedi(Number(item.price))}
                      </p>
                    </div>
                    <span className="font-semibold">{formatCedi(Number(item.price) * item.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-2 flex flex-col gap-2 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd className="text-ink">{formatCedi(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Delivery</dt>
                <dd className="text-ink">
                  {Number(order.delivery_fee) === 0 ? "Free" : formatCedi(Number(order.delivery_fee))}
                </dd>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatCedi(Number(order.total))}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="text-lg font-semibold">Customer</h2>
            <p className="mt-3 font-medium">
              {order.first_name} {order.last_name}
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-accent">
                <Phone className="size-4 text-muted" aria-hidden="true" /> {order.phone}
              </a>
              {order.email && (
                <a href={`mailto:${order.email}`} className="inline-flex items-center gap-2 hover:text-accent">
                  <Mail className="size-4 text-muted" aria-hidden="true" /> {order.email}
                </a>
              )}
            </div>
            <a
              href={customerChat}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-white hover:-translate-y-0.5"
            >
              <WhatsappIcon className="size-4" /> Message on WhatsApp
            </a>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Delivery &amp; payment</h2>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-muted">Address</dt>
                <dd className="mt-0.5 whitespace-pre-line">{order.address}</dd>
              </div>
              <div>
                <dt className="text-muted">City / Region</dt>
                <dd className="mt-0.5">
                  {order.city}, {regionLabel(order.region)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Payment</dt>
                <dd className="mt-0.5">{paymentLabel(order.payment_method)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Private note</h2>
            <div className="mt-3">
              <OrderNote orderId={order.id} note={order.admin_note} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
