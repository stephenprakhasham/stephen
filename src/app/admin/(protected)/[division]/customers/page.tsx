import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listCustomers } from "@/lib/orders";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionCustomersPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const rows = await listCustomers(div);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Customers</h1>
        </div>
        <span className="pill">{rows.length} customers</span>
      </div>

      <div className="admin-table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Notes</th></tr></thead>
          <tbody>
            {rows.map((c: any) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email || "—"}</td>
                <td className="admin-muted">{c.notes || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="admin-muted">No customers yet. Customers are created when an enquiry is converted to an order.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}