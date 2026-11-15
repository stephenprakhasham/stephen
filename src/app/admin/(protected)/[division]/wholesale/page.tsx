import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listWholesalePrices } from "@/lib/wholesale";
import { listCustomers } from "@/lib/orders";
import { listProducts } from "@/lib/catalogue";
import { WholesaleManager } from "@/components/admin/WholesaleManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionWholesalePage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const [prices, customers, products] = await Promise.all([
    listWholesalePrices(div),
    listCustomers(div),
    listProducts(div),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Wholesale</h1>
        </div>
        <span className="pill">{prices.length} price entries</span>
      </div>
      <WholesaleManager division={div} prices={prices} customers={customers} products={products} />
    </div>
  );
}