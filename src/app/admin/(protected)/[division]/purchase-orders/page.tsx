import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listPurchaseOrders, getPurchaseOrderLines } from "@/lib/purchase-orders";
import { listVendors } from "@/lib/vendors";
import { listProducts } from "@/lib/catalogue";
import { PurchaseOrderManager } from "@/components/admin/PurchaseOrderManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionPurchaseOrdersPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const [orders, vendors, products] = await Promise.all([
    listPurchaseOrders(div),
    listVendors(div),
    listProducts(div),
  ]);

  // Fetch lines for each order.
  const linesMap = new Map<string, Awaited<ReturnType<typeof getPurchaseOrderLines>>>();
  await Promise.all(
    orders.map(async (o) => {
      linesMap.set(o.id, await getPurchaseOrderLines(o.id));
    })
  );

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Purchase Orders</h1>
        </div>
        <span className="pill">{orders.length} POs</span>
      </div>
      <PurchaseOrderManager
        division={div}
        orders={orders}
        vendors={vendors}
        products={products}
        linesMap={Object.fromEntries(linesMap)}
      />
    </div>
  );
}