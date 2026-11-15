import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";
import { OrderManager } from "@/components/admin/OrderManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionOrdersPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const orders = await listOrders(div);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Orders</h1>
        </div>
        <span className="pill">{orders.length} orders</span>
      </div>
      <OrderManager division={div} orders={orders} />
    </div>
  );
}