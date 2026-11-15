import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listInventory, getLowStock } from "@/lib/inventory";
import { listWarehouses } from "@/lib/warehouses";
import { listProducts } from "@/lib/catalogue";
import { InventoryManager } from "@/components/admin/InventoryManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ division: string }>;
  searchParams: Promise<{ lowStock?: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const lowOnly = (await searchParams).lowStock === "true";

  const [inventory, warehouses, products, lowStock] = await Promise.all([
    listInventory(div),
    listWarehouses(div),
    listProducts(div),
    lowOnly ? getLowStock(div) : Promise.resolve([]),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Inventory</h1>
        </div>
        <span className="pill">{inventory.length} variants tracked</span>
      </div>
      <InventoryManager
        division={div}
        inventory={inventory}
        warehouses={warehouses}
        products={products}
        lowStock={lowStock}
      />
    </div>
  );
}