import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listProducts } from "@/lib/catalogue";
import { listOrders } from "@/lib/orders";
import { listInventory } from "@/lib/inventory";
import { listPurchaseOrders } from "@/lib/purchase-orders";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, { name: string; tagline: string }> = {
  mobiles: { name: "YAGA MOBILES", tagline: "Mobile phones & accessories" },
  jewellery: { name: "YAGA GOLD & FASHION", tagline: "Jewellery & fashion retail" },
  digital: { name: "YAGA DIGITAL NEXUS", tagline: "Digital marketing services" },
};

const MODULES: { href: string; label: string; icon: string; description: string }[] = [
  { href: "products", label: "Products", icon: "▤", description: "Manage catalogue and pricing" },
  { href: "categories", label: "Categories", icon: "▥", description: "Organise product hierarchy" },
  { href: "brands", label: "Brands", icon: "◇", description: "Brand directory" },
  { href: "attributes", label: "Attributes", icon: "≡", description: "Dynamic product attributes" },
  { href: "enquiries", label: "Enquiries", icon: "✉", description: "Lead pipeline" },
  { href: "orders", label: "Orders", icon: "✦", description: "Order fulfilment" },
  { href: "customers", label: "Customers", icon: "☺", description: "Customer records" },
  { href: "inventory", label: "Inventory", icon: "▦", description: "Stock levels & adjustments" },
  { href: "warehouses", label: "Warehouses", icon: "▣", description: "Storage locations" },
  { href: "purchase-orders", label: "Purchase Orders", icon: "◫", description: "Supplier purchasing" },
  { href: "vendors", label: "Vendors", icon: "◉", description: "Supplier directory" },
  { href: "wholesale", label: "Wholesale", icon: "◆", description: "B2B tiered pricing" },
];

export default async function DivisionPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const label = LABELS[div];
  if (!label) notFound();

  const [products, orders, inventory, purchaseOrders] = await Promise.all([
    listProducts(div, { limit: 200 }),
    listOrders(div, { limit: 200 }),
    listInventory(div),
    listPurchaseOrders(div, { limit: 200 }),
  ]);

  const lowStock = inventory.filter((row) => row.quantity_available <= row.reorder_point);
  const openOrders = orders.filter(
    (o) => !["delivered", "cancelled", "refunded", "returned"].includes(o.status)
  );
  const draftPOs = purchaseOrders.filter((po) => po.status === "draft");

  const modules = MODULES.filter((m) => {
    if (div === "digital") {
      return ["products", "categories", "attributes", "enquiries", "orders", "customers"].includes(
        m.href
      );
    }
    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Division workspace</p>
          <h1>{label.name}</h1>
          <p className="admin-muted">{label.tagline}</p>
        </div>
      </div>

      <div className="admin-kpis">
        <div className="admin-kpi">
          <span>Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="admin-kpi">
          <span>Open orders</span>
          <strong>{openOrders.length}</strong>
        </div>
        <div className="admin-kpi">
          <span>Low stock</span>
          <strong style={{ color: lowStock.length > 0 ? "#b45309" : undefined }}>
            {lowStock.length}
          </strong>
        </div>
        <div className="admin-kpi">
          <span>Draft POs</span>
          <strong>{draftPOs.length}</strong>
        </div>
      </div>

      <section className="admin-section">
        <h2>Modules</h2>
        <div className="admin-card-grid">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={`/admin/${div}/${m.href}`}
              className="admin-card"
            >
              <span className="admin-card-tag">{m.icon} {m.label}</span>
              <span className="admin-card-link">{m.description} →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}